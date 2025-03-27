import express from 'express';
import validate from '../../middlewares/validate.js';
import * as poolsValidation from '../../validations/pools.validation.js';
import * as poolsController from '../../controllers/pools.controller.js';
import authMiddleware from '../../middlewares/auth.middlewares.js';

const router = express.Router();

router.post('/saveDailyPoolA',authMiddleware(), validate(poolsValidation.validatePoolA), poolsController.saveDailyPoolA);
router.post('/saveDailyPoolB',authMiddleware(), validate(poolsValidation.validatePoolB), poolsController.saveDailyPoolB);
router.post('/getDailyPooldata', poolsController.getUserActivePools);
export default router; 
