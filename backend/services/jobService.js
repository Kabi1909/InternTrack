import ProviderProfile from '../models/ProviderProfile.js';
export async function attachCompanies(jobs) {
  const providers = await ProviderProfile.find({
    user: { $in: jobs.map((job) => job.provider?._id || job.provider) },
  });
  return jobs.map((job) => {
    const object = job.toJSON();
    object.companyProfile = providers
      .find(
        (profile) => String(profile.user) === String(job.provider?._id || job.provider),
      )
      ?.toJSON();
    if (object.status === 'Active' && new Date(object.applicationDeadline) < new Date())
      object.status = 'Expired';
    return object;
  });
}
