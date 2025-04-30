import express from 'express';
import authMiddleware from '../../middlewares/auth.middlewares.js';
import * as adminController from '../../controllers/admin.controller.js';
import validate from '../../middlewares/validate.js';
import * as adminValidation from '../../validations/admin.validation.js';

const router = express.Router();

// Admin login
router.post('/login', validate(adminValidation.login), adminController.login);

// Admin registration (protected route - only existing admins can create new admins)
router.post('/register', validate(adminValidation.register), adminController.register);

// Change password
router.post('/change-password', authMiddleware('admin'), validate(adminValidation.changePassword), adminController.changePassword);

// Get all users (admin only)
router.get('/users', authMiddleware('admin'), adminController.getAllUsers);

// Get user details (admin only)
router.get('/users/:userId', authMiddleware('admin'), adminController.getUserDetails);

// Update user (admin only)
router.patch('/users/:userId', authMiddleware('admin'), validate(adminValidation.updateUser), adminController.updateUser);

// Delete user (admin only)
router.delete('/users/:userId', authMiddleware('admin'), adminController.deleteUser);

// Register user by admin (admin only)
router.post('/register-user', authMiddleware('admin'), adminController.registerUserByAdmin);

// Trigger distribution functions
router.post('/trigger-distributions', adminController.triggerDistributions);

// Admin routes
router.post('/trigger-daily-reset', adminController.triggerDailyReset);

export default router; 