import mongoose from 'mongoose';

const notificationsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    emailNotification: {
      type: Boolean,
      default: false, // Default value is false
    },
    earningNotification: {
      type: Boolean,
      default: false, // Default value is false
    },
    poolNotification: {
      type: Boolean,
      default: false, // Default value is false
    },
    achievementNotification: {
      type: Boolean,
      default: false, // Default value is false
    },
    goalCompleteNotification: {
      type: Boolean,
      default: false, // Default value is false
    },
  },
  { timestamps: true }
);

// Index for better performance
notificationsSchema.index({ userId: 1 });

const Notifications = mongoose.model('Notifications', notificationsSchema);

export default Notifications;