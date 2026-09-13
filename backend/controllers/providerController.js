import ProviderProfile from '../models/ProviderProfile.js';
import Job from '../models/Job.js';
import { pick, success } from '../utils/response.js';
import { providerAnalytics, providerDashboard } from '../services/analyticsService.js';
export const getProfile = async (req, res) =>
  success(res, await ProviderProfile.findOne({ user: req.user.id }));
export async function updateProfile(req, res) {
  const profile = await ProviderProfile.findOneAndUpdate(
    { user: req.user.id },
    {
      $set: pick(req.body, [
        'companyName',
        'companyDescription',
        'website',
        'industry',
        'location',
        'contactEmail',
      ]),
    },
    { new: true, runValidators: true },
  );
  if (req.body.companyName)
    await Job.updateMany(
      { provider: req.user.id },
      { $set: { company: profile.companyName } },
    );
  success(res, profile, 'Company profile updated.');
}
export const analytics = async (req, res) =>
  success(res, await providerAnalytics(req.user._id));
export const dashboard = async (req, res) =>
  success(res, await providerDashboard(req.user._id));
