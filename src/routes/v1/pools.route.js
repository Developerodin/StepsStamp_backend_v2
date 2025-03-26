import express from 'express';
import validate from '../../middlewares/validate.js';
import * as poolsValidation from '../../validations/pools.validation.js';
import * as poolsController from '../../controllers/pools.controller.js';

const router = express.Router();

router.post('/saveDailyPoolA', validate(poolsValidation.validatePoolA), poolsController.saveDailyPoolA);
router.post('/saveDailyPoolB', validate(poolsValidation.validatePoolB), poolsController.saveDailyPoolB);
router.post('/getDailyPooldata', poolsController.getUserActivePools);
export default router; 
