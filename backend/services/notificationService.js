import Notification from '../models/Notification.js';
export const notify = (recipient, type, title, message, related = {}) =>
  Notification.create({ recipient, type, title, message, ...related });
export async function listRecent(recipient, limit = 5) {
  return Notification.find({ recipient }).sort({ createdAt: -1 }).limit(limit);
}
