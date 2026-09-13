import api from './api.js';
import { mutateRequest } from './serviceUtils.js';
export const notificationService = {
  markRead: (id) => mutateRequest(api.patch(`/notifications/${id}/read`)),
  markAll: () => mutateRequest(api.patch('/notifications/read-all')),
  remove: (id) => mutateRequest(api.delete(`/notifications/${id}`)),
};
