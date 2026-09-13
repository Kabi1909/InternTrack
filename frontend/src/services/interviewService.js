import api from './api.js';
import { mutateRequest } from './serviceUtils.js';
export function interviewPayload(values) {
  return {
    application: values.applicationId,
    interviewDate: values.date,
    interviewTime: values.time,
    startsAt: new Date(`${values.date}T${values.time}`).toISOString(),
    interviewType: {
      'Video call': 'Online',
      'In person': 'In-person',
      'Phone call': 'Phone',
    }[values.type],
    meetingLink: values.link,
    physicalLocation: values.location,
    notes: values.notes,
    durationMinutes: Number(values.durationMinutes || 60),
  };
}
export const interviewService = {
  save: (values) =>
    mutateRequest(
      values.id
        ? api.put(`/interviews/${values.id}`, interviewPayload(values))
        : api.post('/interviews', interviewPayload(values)),
    ),
  cancel: (id) => mutateRequest(api.patch(`/interviews/${id}/cancel`)),
};
