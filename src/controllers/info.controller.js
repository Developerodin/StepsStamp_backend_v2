import * as infoService from '../services/info.service.js';

// 📌 User Ratings
export const createRating = async (req, res) => {
  try {
    const rating = await infoService.saveRating(req.body);
    res.status(201).json(rating);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getRating = async (req, res) => {
  const rating = await infoService.getUserRating(req.params.userId);
  return rating ? res.json(rating) : res.status(404).json({ message: 'Rating not found' });
};

export const updateRating = async (req, res) => {
  const updated = await infoService.updateUserRating(req.body.userId, req.body);
  return updated ? res.json(updated) : res.status(404).json({ message: 'Rating not found' });
};

export const deleteRating = async (req, res) => {
  const deleted = await infoService.deleteUserRating(req.params.userId);
  return deleted ? res.json({ message: 'Deleted' }) : res.status(404).json({ message: 'Rating not found' });
};

// 📌 FAQs
export const createFaq = async (req, res) => res.json(await infoService.createFaq(req.body));
export const getAllFaqs = async (req, res) => res.json(await infoService.getFaqs());
export const updateFaq = async (req, res) => res.json(await infoService.updateFaq(req.params.faqId, req.body));
export const deleteFaq = async (req, res) => res.json(await infoService.deleteFaq(req.params.faqId));

// 📌 Terms & Privacy
export const createInfo = async (req, res) => res.json(await infoService.createInfo(req.body));
export const getInfo = async (req, res) => res.json(await infoService.getInfo(req.params.type));
export const updateInfo = async (req, res) => res.json(await infoService.updateInfo(req.params.type, req.body));
export const deleteInfo = async (req, res) => res.json(await infoService.deleteInfo(req.params.type));

// 📌 Notifications
export const createNotification = async (req, res) => res.json(await infoService.createNotification(req.body));
export const getNotifications = async (req, res) => res.json(await infoService.getUserNotifications(req.params.userId));
export const updateNotification = async (req, res) => res.json(await infoService.updateNotification(req.params.notificationId, req.body));
export const deleteNotification = async (req, res) => res.json(await infoService.deleteNotification(req.params.notificationId));
