import Interview from '../models/Interview.js';
import Application from '../models/Application.js';
import ApiError from '../utils/ApiError.js';
import { pick, success, list, pagination } from '../utils/response.js';
import { notify } from '../services/notificationService.js';
import { sendEmail } from '../services/emailService.js';
const fields = [
  'interviewDate',
  'interviewTime',
  'interviewType',
  'meetingLink',
  'physicalLocation',
  'notes',
  'durationMinutes',
];
async function scheduleValues(req, existing) {
  const application = await Application.findOne({
    _id: req.body.application,
    provider: req.user.id,
  });
  if (!application) throw new ApiError(404, 'Application not found.');
  if (['Withdrawn', 'Rejected'].includes(application.status))
    throw new ApiError(409, 'This application cannot be scheduled.');
  if (existing && String(existing.application) !== application.id)
    throw new ApiError(400, 'An interview cannot be moved to another application.');
  const startsAt = new Date(
    req.body.startsAt ||
      `${req.body.interviewDate.slice(0, 10)}T${req.body.interviewTime}:00Z`,
  );
  if (
    !Number.isFinite(startsAt.getTime()) ||
    (startsAt <= new Date() && req.body.status !== 'Completed')
  )
    throw new ApiError(400, 'Interview must be scheduled in the future.');
  const duration = Number(req.body.durationMinutes || 60);
  const end = new Date(startsAt.getTime() + duration * 60000);
  const candidates = await Interview.find({
    _id: { $ne: existing?._id },
    $or: [{ provider: req.user.id }, { student: application.student }],
    status: { $in: ['Scheduled', 'Rescheduled'] },
    startsAt: { $lt: end, $gte: new Date(startsAt.getTime() - 480 * 60000) },
  });
  if (
    candidates.some(
      (item) =>
        item.startsAt.getTime() + item.durationMinutes * 60000 > startsAt.getTime(),
    )
  )
    throw new ApiError(
      409,
      'The candidate or provider already has an overlapping interview.',
    );
  return {
    application,
    values: {
      ...pick(req.body, fields),
      startsAt,
      durationMinutes: duration,
      application: application.id,
      student: application.student,
      provider: req.user.id,
      job: application.job,
    },
  };
}
async function announce(interview, type, message) {
  await notify(interview.student, type, 'An interview update', message, {
    relatedInterview: interview.id,
    relatedApplication: interview.application,
    relatedJob: interview.job,
  });
  await sendEmail({ recipientId: interview.student, template: type });
}
export async function create(req, res) {
  const { application, values } = await scheduleValues(req);
  const interview = await Interview.create(values);
  const updated = await Application.findOneAndUpdate(
    { _id: application.id, status: { $nin: ['Withdrawn', 'Rejected'] } },
    {
      $set: { status: 'Interview Scheduled' },
      $push: { statusHistory: { status: 'Interview Scheduled', at: new Date() } },
    },
  );
  if (!updated) {
    await Interview.deleteOne({ _id: interview.id });
    throw new ApiError(409, 'Application changed. Refresh before scheduling.');
  }
  await announce(
    interview,
    'INTERVIEW_SCHEDULED',
    `Your interview is scheduled for ${interview.interviewDate} at ${interview.interviewTime}.`,
  );
  success(res, interview, 'Interview scheduled.', 201);
}
export async function update(req, res) {
  const existing = await Interview.findOne({ _id: req.params.id, provider: req.user.id });
  if (!existing) throw new ApiError(404, 'Interview not found.');
  if (req.body.status === 'Cancelled') return cancel(req, res);
  const { values } = await scheduleValues(req, existing);
  const status = req.body.status === 'Completed' ? 'Completed' : 'Rescheduled';
  if (status === 'Completed' && values.startsAt > new Date())
    throw new ApiError(400, 'A future interview cannot be marked completed.');
  Object.assign(existing, values, { status });
  await existing.save();
  if (status === 'Rescheduled') {
    await Application.updateOne(
      { _id: existing.application },
      {
        $set: { status: 'Interview Scheduled' },
        $push: { statusHistory: { status: 'Interview Scheduled', at: new Date() } },
      },
    );
    await announce(
      existing,
      'INTERVIEW_RESCHEDULED',
      `Your interview has moved to ${existing.interviewDate} at ${existing.interviewTime}.`,
    );
  }
  success(res, existing, 'Interview updated.');
}
export async function cancel(req, res) {
  const interview = await Interview.findOneAndUpdate(
    { _id: req.params.id, provider: req.user.id, status: { $ne: 'Cancelled' } },
    { $set: { status: 'Cancelled' } },
    { new: true },
  );
  if (!interview) throw new ApiError(404, 'A cancellable interview was not found.');
  const another = await Interview.exists({
    application: interview.application,
    status: { $in: ['Scheduled', 'Rescheduled'] },
    startsAt: { $gte: new Date() },
  });
  if (!another)
    await Application.updateOne(
      { _id: interview.application, status: 'Interview Scheduled' },
      {
        $set: { status: 'Shortlisted' },
        $push: { statusHistory: { status: 'Shortlisted', at: new Date() } },
      },
    );
  await announce(
    interview,
    'INTERVIEW_CANCELLED',
    'Your interview was cancelled. Check your application for further updates.',
  );
  success(res, interview, 'Interview cancelled.');
}
export async function getInterviews(req, res) {
  const { page, limit, skip } = pagination(req.query);
  const filter = { [req.user.role === 'student' ? 'student' : 'provider']: req.user.id };
  const [data, total] = await Promise.all([
    Interview.find(filter)
      .populate('job')
      .populate('student', 'name email profilePicture')
      .sort({ startsAt: 1 })
      .skip(skip)
      .limit(limit),
    Interview.countDocuments(filter),
  ]);
  list(res, data, total, page, limit);
}
