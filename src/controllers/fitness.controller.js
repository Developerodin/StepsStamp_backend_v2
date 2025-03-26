import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { updateStepHistory, getUserStepData } from '../services/fitness.service.js';

/**
 * API to update user's step count
 */
const updateSteps = catchAsync(async (req, res) => {
  const { walkingSteps, rewardSteps, source, userId } = req.body;
 // const userId = req.user.id; // Extract user from JWT auth
  const result = await updateStepHistory(walkingSteps, rewardSteps, source, userId);
  res.status(httpStatus.OK).json({ message: 'Steps updated successfully', data: result });
});

const getSteps = catchAsync(async (req, res) => {
  // const userId = req.user.id; // Extract logged-in user ID
  const { date, monthYear, userId } = req.body;

  const stepData = await getUserStepData(userId, date, monthYear);

  res.status(httpStatus.OK).json(stepData);
});

const getAnalysis = catchAsync(async (req, res) => {
  res.status(httpStatus.OK).json({"stepData":"ss"});
})

export { updateSteps, getSteps, getAnalysis };
