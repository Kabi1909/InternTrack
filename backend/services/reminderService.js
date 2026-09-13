import Job from '../models/Job.js';
import SavedJob from '../models/SavedJob.js';
import Notification from '../models/Notification.js';
// Explicitly invoked by a future scheduler. Never starts a cron job at import time.
export async function createDeadlineReminders(now = new Date()) {
  const end = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const jobs = await Job.find({
    deletedAt: null,
    status: 'Active',
    applicationDeadline: { $gte: now, $lte: end },
  });
  for (const job of jobs) {
    const recipients = await SavedJob.find({ job: job.id });
    const notices = [
      {
        recipient: job.provider,
        type: 'JOB_CLOSING_SOON',
        title: 'Your vacancy closes soon',
      },
      ...recipients.map((item) => ({
        recipient: item.student,
        type: 'DEADLINE_REMINDER',
        title: 'A saved opportunity closes soon',
      })),
    ];
    for (const notice of notices) {
      const dedupeKey = `${notice.type}:${job.id}:${notice.recipient}:${job.applicationDeadline.toISOString()}`;
      await Notification.updateOne(
        { dedupeKey },
        {
          $setOnInsert: {
            ...notice,
            message: `${job.title} closes on ${job.applicationDeadline.toISOString().slice(0, 10)}.`,
            relatedJob: job.id,
          },
        },
        { upsert: true },
      );
    }
  }
  return { processedJobs: jobs.length };
}
