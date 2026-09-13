import StudentProfile from '../models/StudentProfile.js';
import Followup from '../models/Followup.js';
import ApiError from '../utils/ApiError.js';
import { pick, success } from '../utils/response.js';
import { studentAnalytics, studentDashboard } from '../services/analyticsService.js';
export const getProfile = async (req, res) =>
  success(res, await StudentProfile.findOne({ user: req.user.id }));
export async function updateProfile(req, res) {
  const values = pick(req.body, [
    'phone',
    'university',
    'degree',
    'graduationYear',
    'skills',
    'preferredJobRoles',
    'preferredWorkLocation',
    'linkedinUrl',
    'githubUrl',
    'bio',
  ]);
  if (values.graduationYear === '') values.graduationYear = undefined;
  success(
    res,
    await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: values },
      { new: true, runValidators: true },
    ),
    'Student profile updated.',
  );
}
export const analytics = async (req, res) =>
  success(res, await studentAnalytics(req.user._id));
export const dashboard = async (req, res) =>
  success(res, await studentDashboard(req.user._id));
export const listFollowups = async (req, res) =>
  success(res, await Followup.find({ student: req.user.id }).sort({ date: 1 }));
export const createFollowup = async (req, res) =>
  success(
    res,
    await Followup.create({ student: req.user.id, ...pick(req.body, ['title', 'date']) }),
    'Follow-up created.',
    201,
  );
export async function removeFollowup(req, res) {
  const result = await Followup.findOneAndDelete({
    _id: req.params.id,
    student: req.user.id,
  });
  if (!result) throw new ApiError(404, 'Follow-up not found.');
  success(res, null, 'Follow-up removed.');
}
