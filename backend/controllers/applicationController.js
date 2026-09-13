import Application from '../models/Application.js';
import Job from '../models/Job.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import Upload from '../models/Upload.js';
import Interview from '../models/Interview.js';
import ApiError from '../utils/ApiError.js';
import { pagination, list, success, escapeRegex } from '../utils/response.js';
import { notify } from '../services/notificationService.js';
import {
  populateApplication,
  presentApplications,
  readApplication,
} from '../services/applicationService.js';
export async function apply(req, res) {
  const job = await Job.findOne({ _id: req.params.jobId, deletedAt: null });
  if (!job) throw new ApiError(404, 'Job not found.');
  if (job.status !== 'Active' || job.applicationDeadline < new Date())
    throw new ApiError(409, 'This job is not accepting applications.');
  const profile = await StudentProfile.findOne({ user: req.user.id });
  const uploadId = req.body.cvUpload || profile.cvUpload;
  const upload =
    uploadId && (await Upload.findOne({ _id: uploadId, owner: req.user.id, kind: 'cv' }));
  if (!upload)
    throw new ApiError(400, 'Upload a CV to your student profile before applying.');
  const application = await Application.create({
    student: req.user.id,
    job: job.id,
    provider: job.provider,
    cvUrl: `/api/uploads/${upload.id}`,
    cvUpload: upload.id,
    coverLetter: req.body.coverLetter || '',
    statusHistory: [{ status: 'Applied', at: new Date() }],
  });
  const related = { relatedJob: job.id, relatedApplication: application.id };
  await Promise.all([
    notify(
      req.user.id,
      'APPLICATION_SUBMITTED',
      'Application submitted',
      `You applied for ${job.title}.`,
      related,
    ),
    notify(
      job.provider,
      'NEW_APPLICATION',
      'A new candidate applied',
      `${req.user.name} applied for ${job.title}.`,
      related,
    ),
  ]);
  success(
    res,
    await readApplication(application.id, 'student'),
    'Application submitted successfully.',
    201,
  );
}
export async function getApplications(req, res) {
  const { page, limit, skip } = pagination(req.query);
  const filter =
    req.user.role === 'student' ? { student: req.user.id } : { provider: req.user.id };
  if (req.params.jobId) {
    if (!(await Job.exists({ _id: req.params.jobId, provider: req.user.id })))
      throw new ApiError(404, 'Job not found.');
    filter.job = req.params.jobId;
  }
  if (req.query.status) filter.status = req.query.status;
  if (req.query.from) filter.appliedAt = { $gte: new Date(req.query.from) };
  if (req.query.company) {
    const jobs = await Job.find({
      company: new RegExp(escapeRegex(req.query.company), 'i'),
      ...(req.params.jobId ? { _id: req.params.jobId } : {}),
    }).select('_id');
    filter.job = { $in: jobs.map((job) => job._id) };
  }
  if (
    req.user.role === 'provider' &&
    (req.query.skill || req.query.university || req.query.search)
  ) {
    const profileFilter = {};
    if (req.query.skill)
      profileFilter.skills = new RegExp(escapeRegex(req.query.skill), 'i');
    if (req.query.university)
      profileFilter.university = new RegExp(escapeRegex(req.query.university), 'i');
    if (req.query.search) {
      const users = await User.find({
        role: 'student',
        name: new RegExp(escapeRegex(req.query.search), 'i'),
      }).select('_id');
      profileFilter.user = { $in: users.map((user) => user._id) };
    }
    const profiles = await StudentProfile.find(profileFilter).select('user');
    filter.student = { $in: profiles.map((profile) => profile.user) };
  }
  const [applications, total] = await Promise.all([
    populateApplication(
      Application.find(filter).sort({ appliedAt: -1 }).skip(skip).limit(limit),
    ),
    Application.countDocuments(filter),
  ]);
  list(res, await presentApplications(applications, req.user.role), total, page, limit);
}
export async function detail(req, res) {
  const owner = req.user.role === 'student' ? 'student' : 'provider';
  if (!(await Application.exists({ _id: req.params.id, [owner]: req.user.id })))
    throw new ApiError(404, 'Application not found.');
  success(res, await readApplication(req.params.id, req.user.role));
}
export async function withdraw(req, res) {
  const application = await Application.findOneAndUpdate(
    { _id: req.params.id, student: req.user.id, status: { $ne: 'Withdrawn' } },
    {
      $set: { status: 'Withdrawn', activeSubmission: false },
      $push: { statusHistory: { status: 'Withdrawn', at: new Date() } },
    },
    { new: true },
  );
  if (!application) throw new ApiError(404, 'An active application was not found.');
  await Interview.updateMany(
    { application: application.id, status: { $in: ['Scheduled', 'Rescheduled'] } },
    { $set: { status: 'Cancelled' } },
  );
  await notify(
    application.provider,
    'APPLICATION_STATUS_CHANGED',
    'Application withdrawn',
    `${req.user.name} withdrew their application.`,
    { relatedApplication: application.id, relatedJob: application.job },
  );
  success(
    res,
    await readApplication(application.id, 'student'),
    'Application withdrawn.',
  );
}
export async function updateStatus(req, res) {
  const application = await Application.findOne({
    _id: req.params.id,
    provider: req.user.id,
  });
  if (!application) throw new ApiError(404, 'Application not found.');
  if (application.status === 'Withdrawn')
    throw new ApiError(409, 'A withdrawn application cannot be changed.');
  const status = req.body.status;
  if (
    status === 'Interview Scheduled' &&
    !(await Interview.exists({
      application: application.id,
      status: { $in: ['Scheduled', 'Rescheduled'] },
      startsAt: { $gte: new Date() },
    }))
  )
    throw new ApiError(409, 'Schedule an interview before assigning this status.');
  if (application.status !== status) {
    const updated = await Application.findOneAndUpdate(
      { _id: application.id, status: application.status },
      { $set: { status }, $push: { statusHistory: { status, at: new Date() } } },
    );
    if (!updated) throw new ApiError(409, 'Application changed. Refresh and try again.');
    if (status === 'Rejected')
      await Interview.updateMany(
        { application: application.id, status: { $in: ['Scheduled', 'Rescheduled'] } },
        { $set: { status: 'Cancelled' } },
      );
    await notify(
      application.student,
      'APPLICATION_STATUS_CHANGED',
      'Your application has an update',
      `Your application is now ${status.toLowerCase()}.`,
      { relatedApplication: application.id, relatedJob: application.job },
    );
  }
  success(
    res,
    await readApplication(application.id, 'provider'),
    'Application status updated.',
  );
}
export async function updateNotes(req, res) {
  const student = req.user.role === 'student';
  const field = student ? 'personalNotes' : 'providerNotes';
  const application = await Application.findOneAndUpdate(
    { _id: req.params.id, [student ? 'student' : 'provider']: req.user.id },
    { $set: { [field]: req.body[field] } },
    { new: true },
  );
  if (!application) throw new ApiError(404, 'Application not found.');
  success(res, await readApplication(application.id, req.user.role), 'Notes saved.');
}
