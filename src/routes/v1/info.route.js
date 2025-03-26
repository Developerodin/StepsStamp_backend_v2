import express from 'express';
import * as infoController from '../../controllers/info.controller.js';
import validate from '../../middlewares/validate.js';
import * as infoValidation from '../../validations/info.validation.js';

const router = express.Router();

// User Ratings
router.post('/ratings', validate(infoValidation.createRating), infoController.createRating);
router.get('/ratings/:userId', validate(infoValidation.getRating), infoController.getRating);
router.patch('/ratings/:userId', validate(infoValidation.updateRating), infoController.updateRating);
router.delete('/ratings/:userId', validate(infoValidation.deleteRating), infoController.deleteRating);

// FAQs
router.post('/faqs', validate(infoValidation.createFaq), infoController.createFaq);
router.get('/faqs', infoController.getAllFaqs);
router.patch('/faqs/:faqId', validate(infoValidation.updateFaq), infoController.updateFaq);
router.delete('/faqs/:faqId', validate(infoValidation.deleteFaq), infoController.deleteFaq);


// Terms & Privacy
router.post('/info', validate(infoValidation.createInfo), infoController.createInfo);
router.get('/info/:type', validate(infoValidation.getInfo), infoController.getInfo);
router.patch('/info/:type', validate(infoValidation.updateInfo), infoController.updateInfo);
router.delete('/info/:type', validate(infoValidation.deleteInfo), infoController.deleteInfo);

// Notifications (CRUD only)
router.post('/notifications', validate(infoValidation.createNotification), infoController.createNotification);
router.get('/notifications/:userId', validate(infoValidation.getNotifications), infoController.getNotifications);
router.patch('/notifications/:notificationId', validate(infoValidation.updateNotification), infoController.updateNotification);
router.delete('/notifications/:notificationId', validate(infoValidation.deleteNotification), infoController.deleteNotification);

export default router;
