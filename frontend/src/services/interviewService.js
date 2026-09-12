import { mutate, uid, notify } from './mockStore';
export const interviewService = {
  save: (values) =>
    mutate((data) => {
      const app = data.applications.find((a) => a.id === values.applicationId);
      const interview = {
        ...values,
        id: uid('i'),
        jobId: app.jobId,
        userId: app.userId,
        status: 'Upcoming',
      };
      data.interviews.push(interview);
      app.status = 'Interview Scheduled';
      app.updatedAt = new Date().toISOString();
      app.history.push({ status: app.status, date: app.updatedAt });
      notify(
        data,
        app.userId,
        'Your interview is scheduled',
        `Meet the team on ${values.date} at ${values.time}.`,
        'Interview scheduled',
      );
      return interview;
    }),
};
