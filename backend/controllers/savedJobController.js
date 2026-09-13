import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';
import ApiError from '../utils/ApiError.js';
import { list, pagination, success } from '../utils/response.js';
export async function getSaved(req, res) {
  const { page, limit, skip } = pagination(req.query);
  const filter = { student: req.user.id };
  const [data, total] = await Promise.all([
    SavedJob.find(filter).populate('job').sort({ savedAt: -1 }).skip(skip).limit(limit),
    SavedJob.countDocuments(filter),
  ]);
  list(res, data, total, page, limit);
}
export async function save(req, res) {
  if (
    !(await Job.exists({
      _id: req.params.jobId,
      deletedAt: null,
      status: 'Active',
      applicationDeadline: { $gte: new Date() },
    }))
  )
    throw new ApiError(404, 'An active job was not found.');
  const saved = await SavedJob.findOneAndUpdate(
    { student: req.user.id, job: req.params.jobId },
    { $setOnInsert: { savedAt: new Date() } },
    { upsert: true, new: true },
  );
  success(res, saved, 'Job saved.', 201);
}
export async function unsave(req, res) {
  await SavedJob.deleteOne({ student: req.user.id, job: req.params.jobId });
  success(res, null, 'Job removed from saved jobs.');
}
