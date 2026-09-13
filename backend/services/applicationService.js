import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';
import { serializeApplication } from '../utils/response.js';
export const populateApplication = (query) =>
  query
    .populate('student', 'name email profilePicture')
    .populate('provider', 'name')
    .populate('job');
export async function presentApplications(applications, role) {
  const profiles = await StudentProfile.find({
    user: {
      $in: applications.map(
        (application) => application.student?._id || application.student,
      ),
    },
  });
  return applications.map((application) => {
    const value = serializeApplication(application, role);
    const profile = profiles.find(
      (profile) =>
        String(profile.user) === String(application.student?._id || application.student),
    );
    if (profile) {
      value.candidateProfile = profile.toJSON();
      delete value.candidateProfile.cvUrl;
      delete value.candidateProfile.cvUpload;
    }
    return value;
  });
}
export async function readApplication(id, role) {
  const application = await populateApplication(Application.findById(id));
  return (await presentApplications([application], role))[0];
}
