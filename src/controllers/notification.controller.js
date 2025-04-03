import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import Notifications from '../models/notifications.model.js';
import mongoose from 'mongoose';

/**
 * Fetch all notifications for a user
 */
const getNotifications = catchAsync(async (req, res) => {
  const { userId } = req.params; // Extract userId from URL params

  if (!userId) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid User ID' });
  }

  const notifications = await Notifications.findOne({ userId });

  if (!notifications) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'No notifications found for the user' });
  }

  res.status(httpStatus.OK).json({ success: true, data: notifications });
});

/**
 * Update a single notification or multiple notifications
 */
const updateNotifications = catchAsync(async (req, res) => {
  const { userId, updates } = req.body;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid or missing User ID' });
  }

  const validFields = [
    'emailNotification',
    'earningNotification',
    'poolNotification',
    'achievementNotification',
    'goalCompleteNotification',
  ];

  // Validate updates
  const updateFields = Object.keys(updates);
  const isValidUpdate = updateFields.every((field) => validFields.includes(field));

  if (!isValidUpdate) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid notification fields in updates' });
  }

  // Update notifications
  const notification = await Notifications.findOneAndUpdate(
    { userId },
    updates,
    { new: true, upsert: true } 
  );

  res.status(httpStatus.OK).json({ success: true, message: 'Notifications updated successfully', data: notification });
});

export default { getNotifications, updateNotifications };