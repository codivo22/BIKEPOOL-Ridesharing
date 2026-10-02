import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const createNotification = async (data) => {
  const recipient = await User.findById(data.recipient).select('messagePreference');
  if (recipient && recipient.messagePreference === false) return null;
  return Notification.create(data);
};
