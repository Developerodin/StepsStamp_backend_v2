import express from 'express';
import notificationController from '../../controllers/notification.controller.js';

const router = express.Router();

// Route to fetch all notifications for a user
router.post('/:userId', notificationController.getNotifications);
router.post('/update', notificationController.updateNotifications);





export default router;