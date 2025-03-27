import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as fitnessValidation from '../../validations/fitness.validation.js';
import * as fitnessController from '../../controllers/fitness.controller.js';
import authMiddleware from '../../middlewares/auth.middlewares.js';

const router = express.Router();
router.get('/analysis/:userId', validate(fitnessValidation.analysis), fitnessController.getAnalysis)


router.post('/updateSteps',authMiddleware(), validate(fitnessValidation.updateSteps), fitnessController.updateSteps);
router.post('/getSteps',authMiddleware(), validate(fitnessValidation.getSteps), fitnessController.getSteps);

export default router;
