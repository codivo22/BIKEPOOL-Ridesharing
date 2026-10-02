import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort('-createdAt').limit(50);
  res.json({ notifications, unreadCount: notifications.filter((notification) => !notification.isRead).length });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.notificationId, recipient: req.user._id }, { isRead: true }, { new: true });
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found.');
  }
  res.json({ notification });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
});
