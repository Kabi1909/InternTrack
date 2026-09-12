import { mutate, uid, notify } from './mockStore.js';

export const interviewService = {
  save: (values) =>
    mutate((data) => {
      const app = data.applications.find((item) => item.id === values.applicationId);
      if (!app || ['Withdrawn', 'Rejected'].includes(app.status)) {
        throw new Error('This application is not available for an interview.');
      }
      const when = new Date(`${values.date}T${values.time}`);
      if (Number.isNaN(when.getTime()) || when <= new Date()) {
        throw new Error('Choose an interview date and time in the future.');
      }
      if (values.type === 'Video call' && !/^https?:\/\//i.test(values.link || '')) {
        throw new Error('Enter a valid meeting link starting with https://.');
      }
      const job = data.jobs.find((item) => item.id === app.jobId);
      const conflict = data.interviews.some((interview) => {
        const otherJob = data.jobs.find((item) => item.id === interview.jobId);
        const sameTime = interview.date === values.date && interview.time === values.time;
        return (
          sameTime &&
          interview.status === 'Upcoming' &&
          (interview.userId === app.userId || otherJob?.companyId === job?.companyId)
        );
      });
      if (conflict)
        throw new Error(
          'The candidate or your team already has an interview at this time.',
        );
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
