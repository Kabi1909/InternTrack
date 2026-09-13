import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import { success, list, pagination } from '../utils/response.js';
export async function getNotifications(req, res) {
  const { page, limit, skip } = pagination(req.query);
  const filter = { recipient: req.user.id };
  const [data, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, isRead: false }),
  ]);
  res.json({
    success: true,
    data,
    unread,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
export async function markRead(req, res) {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { $set: { isRead: true } },
    { new: true },
  );
  if (!notification) throw new ApiError(404, 'Notification not found.');
  success(res, notification);
}
export async function markAll(req, res) {
  await Notification.updateMany(
    { recipient: req.user.id, isRead: false },
    { $set: { isRead: true } },
  );
  success(res, null, 'All notifications marked read.');
}
export async function remove(req, res) {
  if (
    !(await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user.id }))
  )
    throw new ApiError(404, 'Notification not found.');
  success(res, null, 'Notification removed.');
}
