import express from 'express';
import notificationController from '../../controllers/notification.controller.js';
import authMiddleware from '../../middlewares/auth.middlewares.js';

const router = express.Router();

// Route to fetch all notifications for a user
router.get('/:userId',authMiddleware(), notificationController.getNotifications);
router.post('/update',authMiddleware(), notificationController.updateNotifications);





export default router;