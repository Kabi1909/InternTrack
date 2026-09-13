import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Interview from '../models/Interview.js';
import SavedJob from '../models/SavedJob.js';
import { listRecent } from './notificationService.js';
import { populateApplication, presentApplications } from './applicationService.js';
import { attachCompanies } from './jobService.js';
async function statusCounts(filter) {
  const rows = await Application.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((row) => ({ status: row._id, count: row.count }));
}
async function overTime(filter) {
  return Application.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', count: 1 } },
  ]);
}
export async function studentAnalytics(student) {
  const [applicationsByStatus, savedJobs, applicationsOverTime] = await Promise.all([
    statusCounts({ student }),
    SavedJob.countDocuments({ student }),
    overTime({ student }),
  ]);
  const count = (status) =>
    applicationsByStatus.find((row) => row.status === status)?.count || 0;
  return {
    totalApplications: applicationsByStatus.reduce((sum, row) => sum + row.count, 0),
    underReview: count('Under Review'),
    shortlisted: count('Shortlisted'),
    interviews: count('Interview Scheduled'),
    offers: count('Offered'),
    rejections: count('Rejected'),
    savedJobs,
    applicationsByStatus,
    applicationsOverTime,
  };
}
export async function providerAnalytics(provider) {
  const [
    totalVacancies,
    activeVacancies,
    closedVacancies,
    applicationsByStatus,
    grouped,
  ] = await Promise.all([
    Job.countDocuments({ provider, deletedAt: null }),
    Job.countDocuments({
      provider,
      deletedAt: null,
      status: 'Active',
      applicationDeadline: { $gte: new Date() },
    }),
    Job.countDocuments({ provider, deletedAt: null, status: 'Closed' }),
    statusCounts({ provider }),
    Application.aggregate([
      { $match: { provider } },
      { $group: { _id: '$job', count: { $sum: 1 } } },
      { $lookup: { from: 'jobs', localField: '_id', foreignField: '_id', as: 'job' } },
      { $unwind: '$job' },
      { $project: { _id: 0, jobId: '$_id', title: '$job.title', count: 1 } },
    ]),
  ]);
  const count = (status) =>
    applicationsByStatus.find((row) => row.status === status)?.count || 0;
  return {
    totalVacancies,
    activeVacancies,
    closedVacancies,
    totalApplicants: applicationsByStatus.reduce((sum, row) => sum + row.count, 0),
    shortlistedCandidates: count('Shortlisted'),
    interviewsScheduled: count('Interview Scheduled'),
    offersMade: count('Offered'),
    applicationsByStatus,
    applicantsByJob: grouped,
  };
}
export async function studentDashboard(student) {
  const [analytics, upcomingInterviews, recent, saved, recommendedJobs] =
    await Promise.all([
      studentAnalytics(student),
      Interview.find({
        student,
        status: { $in: ['Scheduled', 'Rescheduled'] },
        startsAt: { $gte: new Date() },
      })
        .populate('job')
        .sort({ startsAt: 1 })
        .limit(5),
      populateApplication(Application.find({ student }).sort({ updatedAt: -1 }).limit(5)),
      SavedJob.find({ student }).populate({
        path: 'job',
        match: {
          status: 'Active',
          deletedAt: null,
          applicationDeadline: { $gte: new Date() },
        },
      }),
      Job.find({
        status: 'Active',
        deletedAt: null,
        applicationDeadline: { $gte: new Date() },
      })
        .sort({ createdAt: -1 })
        .limit(6),
    ]);
  return {
    analytics,
    upcomingInterviews,
    recentApplicationUpdates: await presentApplications(recent, 'student'),
    upcomingJobDeadlines: saved
      .map((item) => item.job)
      .filter(Boolean)
      .sort((a, b) => a.applicationDeadline - b.applicationDeadline)
      .slice(0, 5),
    recommendedJobs: await attachCompanies(recommendedJobs),
  };
}
export async function providerDashboard(provider) {
  const [analytics, recent, activeVacancies, upcomingInterviews, recentNotifications] =
    await Promise.all([
      providerAnalytics(provider),
      populateApplication(
        Application.find({ provider }).sort({ appliedAt: -1 }).limit(5),
      ),
      Job.find({
        provider,
        deletedAt: null,
        status: 'Active',
        applicationDeadline: { $gte: new Date() },
      })
        .sort({ createdAt: -1 })
        .limit(5),
      Interview.find({
        provider,
        status: { $in: ['Scheduled', 'Rescheduled'] },
        startsAt: { $gte: new Date() },
      })
        .populate('job')
        .populate('student', 'name email')
        .sort({ startsAt: 1 })
        .limit(5),
      listRecent(provider),
    ]);
  return {
    analytics,
    recentApplicants: await presentApplications(recent, 'provider'),
    activeVacancies: await attachCompanies(activeVacancies),
    upcomingInterviews,
    recentNotifications,
  };
}
