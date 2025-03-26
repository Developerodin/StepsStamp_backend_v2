import { UserRating, Faq, Info, Notification } from '../models/info.model.js';

// 📌 User Ratings
export const saveRating = async (data) => await UserRating.create(data);
export const getUserRating = async (userId) => await UserRating.findOne({ userId });
export const updateUserRating = async (userId, data) => await UserRating.findOneAndUpdate({ userId }, data, { new: true });
export const deleteUserRating = async (userId) => await UserRating.findOneAndDelete({ userId });

// 📌 FAQs
export const createFaq = async (data) => await Faq.create(data);
export const getFaqs = async () => await Faq.find();
export const updateFaq = async (faqId, data) => await Faq.findByIdAndUpdate(faqId, data, { new: true });
export const deleteFaq = async (faqId) => await Faq.findByIdAndDelete(faqId);

// 📌 Terms & Privacy
export const createInfo = async (data) => await Info.create(data);
export const getInfo = async (type) => await Info.findOne({ type });
export const updateInfo = async (type, data) => await Info.findOneAndUpdate({ type }, data, { new: true });
export const deleteInfo = async (type) => await Info.findOneAndDelete({ type });

// 📌 Notifications
export const createNotification = async (data) => await Notification.create(data);
export const getUserNotifications = async (userId) => await Notification.find({ userId });
export const updateNotification = async (notificationId, data) => await Notification.findByIdAndUpdate(notificationId, data, { new: true });
export const deleteNotification = async (notificationId) => await Notification.findByIdAndDelete(notificationId);
