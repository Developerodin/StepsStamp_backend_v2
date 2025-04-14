import express from 'express';
import chatController from '../../controllers/chat.controller.js';

const router = express.Router();

// Route to send a message
router.post('/send', chatController.sendMessage);

// Route to get chat history between admin and a specific user
router.post('/history', chatController.getChatHistory);

// Route to receive messages for a specific user or admin
router.get('/receive/:receiverId/:receiverType', chatController.receiveMessages);

// Route to delete a specific message
router.delete('/delete/:messageId', chatController.deleteMessage);

export default router;