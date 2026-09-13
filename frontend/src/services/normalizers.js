export const resourceId = (value) =>
  typeof value === 'object' && value !== null
    ? String(value.id || value._id || '')
    : String(value || '');
export function assetUrl(value) {
  if (!value || !value.startsWith('/api/')) return value || '';
  const base = import.meta.env?.VITE_API_BASE_URL || '/api';
  return `${base.replace(/\/$/, '')}/${value.slice(5)}`;
}
export function normalizeUser(user, profile = {}) {
  return {
    ...profile,
    ...user,
    id: resourceId(user),
    companyId: user.role === 'provider' ? resourceId(user) : undefined,
    skills: profile.skills || [],
    graduation: profile.graduationYear || '',
    preferredRoles: (profile.preferredJobRoles || []).join(', '),
    location: profile.preferredWorkLocation || '',
    linkedin: profile.linkedinUrl || '',
    github: profile.githubUrl || '',
    picture: assetUrl(user.profilePicture || profile.profilePicture),
    cv: profile.cvUpload ? 'Profile CV.pdf' : '',
    cvUpload: resourceId(profile.cvUpload),
    cvUrl: profile.cvUrl || '',
  };
}
export function normalizeCompany(profile, job) {
  return {
    ...profile,
    id: resourceId(profile?.user || job?.provider),
    name: profile?.companyName || job?.company || '',
    description: profile?.companyDescription || '',
    picture: assetUrl(profile?.companyLogo),
    mark: (profile?.companyName || job?.company || 'Company')[0],
  };
}
export function normalizeJob(job) {
  return {
    ...job,
    id: resourceId(job),
    companyId: resourceId(job.provider),
    type: job.jobType,
    mode: job.workMode,
    skills: job.requiredSkills || [],
    salary: job.salaryText || 'Not specified',
    deadline: job.applicationDeadline?.slice(0, 10) || '',
    positions: job.numberOfPositions,
    experience: job.experienceRequirements || 'Entry level',
    status: job.deletedAt
      ? 'Deleted'
      : job.status === 'Active' && new Date(job.applicationDeadline) < new Date()
        ? 'Expired'
        : job.status,
  };
}
export function normalizeApplication(application) {
  return {
    ...application,
    id: resourceId(application),
    userId: resourceId(application.student),
    jobId: resourceId(application.job),
    cv: 'Submitted CV.pdf',
    notes: application.personalNotes || '',
    privateNotes: application.providerNotes || '',
    history: (application.statusHistory || []).map((item) => ({
      ...item,
      date: item.at,
    })),
  };
}
export function normalizeInterview(interview) {
  const date = new Date(interview.startsAt);
  const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return {
    ...interview,
    id: resourceId(interview),
    applicationId: resourceId(interview.application),
    userId: resourceId(interview.student),
    jobId: resourceId(interview.job),
    date: localDate,
    time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
    type: { Online: 'Video call', 'In-person': 'In person', Phone: 'Phone call' }[
      interview.interviewType
    ],
    link: interview.meetingLink || '',
    location: interview.physicalLocation || '',
    status: ['Scheduled', 'Rescheduled'].includes(interview.status)
      ? 'Upcoming'
      : interview.status,
  };
}
export const emptyWorkspace = () => ({
  users: [],
  companies: [],
  jobs: [],
  applications: [],
  interviews: [],
  notifications: [],
  saved: {},
  followups: [],
  analytics: null,
});
