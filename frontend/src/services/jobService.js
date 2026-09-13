import api from './api.js';
import { mutateRequest } from './serviceUtils.js';
import { normalizeJob } from './normalizers.js';
export function jobPayload(job) {
  return {
    title: job.title,
    description: job.description,
    responsibilities: job.responsibilities,
    qualifications: job.qualifications,
    requiredSkills: job.skills,
    jobType: job.type,
    workMode: job.mode,
    location: job.location,
    salaryText: job.salary,
    applicationDeadline: job.deadline,
    numberOfPositions: Number(job.positions),
    experienceRequirements: job.experience,
    category: job.category,
    status: job.status,
  };
}
export const jobService = {
  list: async (params) => (await api.get('/jobs', { params })).data,
  save: async (job) =>
    normalizeJob(
      await mutateRequest(
        job.id
          ? api.put(`/jobs/${job.id}`, jobPayload(job))
          : api.post('/jobs', jobPayload(job)),
      ),
    ),
  close: (id) => mutateRequest(api.patch(`/jobs/${id}/close`)),
  remove: (id) => mutateRequest(api.delete(`/jobs/${id}`)),
  toggleSaved: (userId, jobId, currentlySaved = false) =>
    mutateRequest(
      currentlySaved
        ? api.delete(`/saved-jobs/${jobId}`)
        : api.post(`/saved-jobs/${jobId}`),
    ),
};
