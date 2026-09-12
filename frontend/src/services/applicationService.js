import { readStore, delay, mutate, uid, notify } from './mockStore';
export const applicationService = {
  list: () => delay(readStore().applications),
  apply: (values) =>
    mutate((data) => {
      if (
        data.applications.some(
          (a) =>
            a.userId === values.userId &&
            a.jobId === values.jobId &&
            a.status !== 'Withdrawn',
        )
      )
        throw new Error('You have already applied to this opportunity.');
      const job = data.jobs.find((j) => j.id === values.jobId);
      if (
        !job ||
        job.status !== 'Active' ||
        job.deadline < new Date().toISOString().slice(0, 10)
      )
        throw new Error('This opportunity is no longer accepting applications.');
      const now = new Date().toISOString();
      const application = {
        ...values,
        id: uid('a'),
        status: 'Applied',
        appliedAt: now,
        updatedAt: now,
        history: [{ status: 'Applied', date: now }],
        notes: '',
        privateNotes: '',
      };
      data.applications.unshift(application);
      notify(
        data,
        values.userId,
        'Application sent',
        `Your application for ${job.title} has been submitted.`,
        'Application submitted',
      );
      const owner = data.users.find((u) => u.companyId === job.companyId);
      if (owner)
        notify(
          data,
          owner.id,
          'A new candidate has applied',
          `${data.users.find((u) => u.id === values.userId)?.name} applied for ${job.title}.`,
          'New applicant received',
        );
      return application;
    }),
  update: (id, changes) =>
    mutate((data) => {
      const app = data.applications.find((a) => a.id === id);
      Object.assign(app, changes, { updatedAt: new Date().toISOString() });
      if (changes.status) {
        app.history.push({ status: changes.status, date: app.updatedAt });
        notify(
          data,
          app.userId,
          'Your application has an update',
          `Your application is now ${changes.status.toLowerCase()}.`,
          'Application status changed',
        );
      }
      return app;
    }),
};
