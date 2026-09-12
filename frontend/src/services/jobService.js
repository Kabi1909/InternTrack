import { readStore, delay, mutate, uid } from './mockStore.js';

export const jobService = {
  list: () => delay(readStore().jobs.filter((job) => job.status !== 'Deleted')),

  save: (job) =>
    mutate((data) => {
      if (!job.title?.trim() || !job.companyId || !job.skills?.length) {
        throw new Error('Add a title, company, and at least one skill.');
      }
      if (!Number.isInteger(Number(job.positions)) || Number(job.positions) < 1) {
        throw new Error('The number of positions must be a positive whole number.');
      }
      const found = data.jobs.findIndex((item) => item.id === job.id);
      const result = {
        ...job,
        title: job.title.trim(),
        id: job.id || uid('j'),
        createdAt: job.createdAt || new Date().toISOString().slice(0, 10),
      };
      if (found >= 0) data.jobs[found] = result;
      else data.jobs.unshift(result);
      return result;
    }),

  close: (id) =>
    mutate((data) => {
      const job = data.jobs.find((item) => item.id === id);
      if (!job) throw new Error('This vacancy is no longer available.');
      job.status = 'Closed';
    }),

  remove: (id) =>
    mutate((data) => {
      // Retain the record so submitted applications keep their job and company context.
      const job = data.jobs.find((item) => item.id === id);
      if (!job) throw new Error('This vacancy is no longer available.');
      job.status = 'Deleted';
      Object.keys(data.saved).forEach((userId) => {
        data.saved[userId] = data.saved[userId].filter((jobId) => jobId !== id);
      });
    }),

  toggleSaved: (userId, jobId) =>
    mutate((data) => {
      const saved = data.saved[userId] || [];
      data.saved[userId] = saved.includes(jobId)
        ? saved.filter((id) => id !== jobId)
        : [...saved, jobId];
    }),
};
