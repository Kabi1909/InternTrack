import api from './api.js';
import { fetchAll } from './serviceUtils.js';
import {
  emptyWorkspace,
  normalizeUser,
  normalizeCompany,
  normalizeJob,
  normalizeApplication,
  normalizeInterview,
  resourceId,
} from './normalizers.js';
export async function loadWorkspace(user, detailId, signal) {
  const data = emptyWorkspace();
  const publicJobs = await fetchAll(api, '/jobs', {}, signal);
  let jobs = [...publicJobs];
  let applications = [],
    interviews = [],
    saved = [];
  if (user) {
    const student = user.role === 'student';
    const [
      identity,
      applicationRows,
      interviewRows,
      notifications,
      analytics,
      ownedJobs,
      savedRows,
      followups,
    ] = await Promise.all([
      api.get('/auth/me', { signal }),
      fetchAll(api, student ? '/applications/my' : '/applications/provider', {}, signal),
      fetchAll(api, student ? '/interviews/my' : '/interviews/provider', {}, signal),
      fetchAll(api, '/notifications', {}, signal),
      api.get(student ? '/students/analytics' : '/providers/analytics', { signal }),
      student ? [] : fetchAll(api, '/jobs', { mine: true }, signal),
      student ? fetchAll(api, '/saved-jobs', {}, signal) : [],
      student
        ? api
            .get('/students/followups', { signal })
            .then((response) => response.data.data)
        : [],
    ]);
    const account = identity.data.data;
    data.users.push(normalizeUser(account.user, account.profile));
    if (!student) data.companies.push(normalizeCompany(account.profile));
    applications = applicationRows;
    interviews = interviewRows;
    saved = savedRows;
    jobs.push(...ownedJobs);
    data.analytics = analytics.data.data;
    data.notifications = notifications.map((item) => ({
      ...item,
      id: resourceId(item),
      userId: resourceId(item.recipient),
      read: item.isRead,
      type:
        {
          APPLICATION_SUBMITTED: 'Application submitted',
          NEW_APPLICATION: 'New applicant received',
          APPLICATION_STATUS_CHANGED: 'Application status changed',
          INTERVIEW_SCHEDULED: 'Interview scheduled',
          INTERVIEW_RESCHEDULED: 'Interview rescheduled',
          INTERVIEW_CANCELLED: 'Interview cancelled',
          DEADLINE_REMINDER: 'Deadline approaching',
          JOB_CLOSING_SOON: 'Job closing soon',
        }[item.type] || item.type,
    }));
    data.followups = followups.map((item) => ({
      ...item,
      id: resourceId(item),
      userId: resourceId(item.student),
      date: item.date.slice(0, 10),
    }));
    data.saved[user.id] = saved.map((item) => resourceId(item.job)).filter(Boolean);
  }
  jobs.push(
    ...applications.map((item) => item.job),
    ...interviews.map((item) => item.job),
    ...saved.map((item) => item.job),
  );
  if (detailId && !jobs.some((job) => resourceId(job) === detailId)) {
    try {
      jobs.push((await api.get(`/jobs/${detailId}`, { signal })).data.data);
    } catch (error) {
      if (![400, 404].includes(error.status)) throw error;
    }
  }
  jobs = jobs.filter((job) => job && typeof job === 'object');
  for (const job of jobs) {
    const company = normalizeCompany(job.companyProfile, job);
    const index = data.companies.findIndex((item) => item.id === company.id);
    if (index < 0) data.companies.push(company);
    else if (job.companyProfile) data.companies[index] = company;
  }
  for (const application of applications) {
    if (
      application.student &&
      !data.users.some((item) => item.id === resourceId(application.student))
    ) {
      data.users.push(
        normalizeUser(
          { ...application.student, role: 'student' },
          application.candidateProfile,
        ),
      );
    }
  }
  // Earlier records contain company details; keep them when relations repeat later.
  data.jobs = [
    ...new Map(
      jobs.reverse().map((job) => [resourceId(job), normalizeJob(job)]),
    ).values(),
  ];
  data.applications = applications.map(normalizeApplication);
  data.interviews = interviews.map(normalizeInterview);
  return data;
}
