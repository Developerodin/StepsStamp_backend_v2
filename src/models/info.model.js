import mongoose from 'mongoose';

const userRatingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  suggestion: { type: String, trim: true, default: null },
  notes: { type: String, trim: true, default: null },
});
userRatingSchema.index({ userId: 1 }, { unique: true });

const faqSchema = new mongoose.Schema({
  category: { type: String, required: true },
  questions: [{ question: { type: String, required: true }, answer: { type: String, required: true } }],
});

const infoSchema = new mongoose.Schema({
  type: { type: String, enum: ['terms', 'privacy'], required: true },
  title: { type: String, required: true },
  content: { type: String },
});

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['system', 'transaction', 'reminder', 'promotion', 'security'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  status: { type: String, enum: ['sent', 'failed', 'pending'], default: 'pending' },
});

const UserRating = mongoose.model('UserRating', userRatingSchema);
const Faq = mongoose.model('Faq', faqSchema);
const Info = mongoose.model('Info', infoSchema);
const Notification = mongoose.model('Notification', notificationSchema);

export { UserRating, Faq, Info, Notification };
