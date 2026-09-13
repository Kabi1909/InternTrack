import { attachCompanies } from '../services/jobService.js';
import Job from '../models/Job.js';
import ProviderProfile from '../models/ProviderProfile.js';
import Application from '../models/Application.js';
import ApiError from '../utils/ApiError.js';
import { pick, success, list, pagination, escapeRegex } from '../utils/response.js';
const fields = [
  'title',
  'description',
  'responsibilities',
  'requiredSkills',
  'qualifications',
  'jobType',
  'workMode',
  'location',
  'salaryMin',
  'salaryMax',
  'salaryText',
  'applicationDeadline',
  'numberOfPositions',
  'experienceRequirements',
  'category',
  'status',
];
export async function browse(req, res) {
  const { page, limit, skip } = pagination(req.query);
  const mine = req.query.mine === 'true';
  if (mine && req.user?.role !== 'provider')
    throw new ApiError(
      403,
      'Provider authentication is required to list your vacancies.',
    );
  const filter = { deletedAt: null };
  if (mine) {
    filter.provider = req.user.id;
    if (req.query.status) filter.status = req.query.status;
  } else {
    if (req.query.status && req.query.status !== 'Active')
      throw new ApiError(403, 'Public browsing only includes active opportunities.');
    filter.status = 'Active';
    filter.applicationDeadline = { $gte: new Date() };
  }
  if (mine && req.query.status === 'Expired') {
    filter.$or = [
      { status: 'Expired' },
      { status: 'Active', applicationDeadline: { $lt: new Date() } },
    ];
    delete filter.status;
  }
  if (mine && req.query.status === 'Active')
    filter.applicationDeadline = { $gte: new Date() };
  for (const key of ['jobType', 'workMode', 'category', 'experienceRequirements'])
    if (req.query[key]) filter[key] = req.query[key];
  if (req.query.location)
    filter.location = new RegExp(escapeRegex(req.query.location), 'i');
  if (req.query.skills)
    filter.requiredSkills = {
      $all: req.query.skills
        .split(',')
        .map((skill) => new RegExp('^' + escapeRegex(skill.trim()) + '$', 'i')),
    };
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$and = [
      {
        $or: ['title', 'company', 'location', 'requiredSkills', 'category'].map(
          (key) => ({ [key]: regex }),
        ),
      },
    ];
  }
  const sort = {
    latest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    deadline: { applicationDeadline: 1 },
    title: { title: 1 },
  }[req.query.sort || 'latest'];
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort(sort).skip(skip).limit(limit),
    Job.countDocuments(filter),
  ]);
  const data = await attachCompanies(jobs);
  if (mine) {
    const counts = await Application.aggregate([
      { $match: { provider: req.user._id } },
      { $group: { _id: '$job', count: { $sum: 1 } } },
    ]);
    data.forEach(
      (job) =>
        (job.applicantCount =
          counts.find((count) => String(count._id) === job.id)?.count || 0),
    );
  }
  list(res, data, total, page, limit);
}
export async function detail(req, res) {
  const job = await Job.findOne({ _id: req.params.id, deletedAt: null });
  if (!job || (job.status === 'Draft' && String(job.provider) !== req.user?.id))
    throw new ApiError(404, 'Job not found.');
  success(res, (await attachCompanies([job]))[0]);
}
export async function create(req, res) {
  const profile = await ProviderProfile.findOne({ user: req.user.id });
  if (!profile?.companyName)
    throw new ApiError(400, 'Complete your company profile before publishing jobs.');
  const values = pick(req.body, fields);
  if (values.applicationDeadline.length === 10)
    values.applicationDeadline += 'T23:59:59.999Z';
  const job = await Job.create({
    ...values,
    provider: req.user.id,
    company: profile.companyName,
  });
  success(res, (await attachCompanies([job]))[0], 'Job created.', 201);
}
export async function update(req, res) {
  const values = pick(req.body, fields);
  if (values.applicationDeadline.length === 10)
    values.applicationDeadline += 'T23:59:59.999Z';
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, provider: req.user.id, deletedAt: null },
    { $set: values },
    { new: true, runValidators: true },
  );
  if (!job) throw new ApiError(404, 'Job not found in your workspace.');
  success(res, (await attachCompanies([job]))[0], 'Job updated.');
}
export async function close(req, res) {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, provider: req.user.id, deletedAt: null },
    { $set: { status: 'Closed' } },
    { new: true },
  );
  if (!job) throw new ApiError(404, 'Job not found in your workspace.');
  success(res, job, 'Job closed.');
}
export async function remove(req, res) {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, provider: req.user.id, deletedAt: null },
    { $set: { status: 'Closed', deletedAt: new Date() } },
    { new: true },
  );
  if (!job) throw new ApiError(404, 'Job not found in your workspace.');
  success(res, null, 'Job removed. Existing applications are retained.');
}
