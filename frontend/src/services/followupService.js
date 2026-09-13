import api from './api.js';
import { mutateRequest } from './serviceUtils.js';
export const followupService = {
  create: (values) => mutateRequest(api.post('/students/followups', values)),
  remove: (id) => mutateRequest(api.delete(`/students/followups/${id}`)),
};
