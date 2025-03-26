import UserFitness from '../models/userFitness.mode.js';
import moment from 'moment';


/**
 * Fetch user's step data
 */
const getUserStepData = async (userId, date, monthYear) => {
  const currentMonth = monthYear || moment().format('YYYY-MM'); // Default to current month
  const formattedDate = date ? moment(date, 'YYYY-MM-DD').format('DD/MM/YY') : null; // Ensure correct format

  // Find user fitness data for the given month
  const userFitness = await UserFitness.findOne({ userId, monthYear: currentMonth }).lean(); 

  if (!userFitness) {
    return { message: 'No step data found for the given period' };
  }

  if (formattedDate) {
    // ✅ Return stepHistory for the specific date
    return {
      date: formattedDate,
      steps: userFitness.stepHistory[formattedDate] || [],
    };
  }

  // ✅ Return entire month's step data
  return {
    monthYear: currentMonth,
    dailyWalkingSteps: userFitness.dailyWalkingSteps,
    dailyRewardSteps: userFitness.dailyRewardSteps,
    stepHistory: userFitness.stepHistory,
  };
};


/**
 * Update user's step count
 */
const updateStepHistory = async (walkingSteps, rewardSteps, source, userId) => {
  const currentDate = moment().format('DD/MM/YY'); // Example: "05/02/24"
  const currentMonth = moment().format('YYYY-MM'); // Example: "2025-02"

  let userFitness = await UserFitness.findOne({ userId, monthYear: currentMonth });

  if (!userFitness) {
    // Create new monthly record if it doesn't exist
    userFitness = new UserFitness({
      userId,
      monthYear: currentMonth,
      dailyWalkingSteps: 0,
      dailyRewardSteps: 0,
      stepHistory: {}, // Ensure stepHistory starts as an object
    });
  }

  // Ensure stepHistory is properly initialized
  if (!userFitness.stepHistory) {
    userFitness.stepHistory = {};
  }

  // Prepare step entry
  const stepEntry = {
    timestamp: new Date(),
    walkingSteps,
    rewardSteps,
  };

  // Ensure the current date exists in stepHistory before pushing
  await UserFitness.updateOne(
    { userId, monthYear: currentMonth },
    {
      $set: { [`stepHistory.${currentDate}`]: userFitness.stepHistory[currentDate] || [] },
      $push: { [`stepHistory.${currentDate}`]: stepEntry }, // Append step entry
      $inc: { dailyWalkingSteps: walkingSteps, dailyRewardSteps: rewardSteps }, // Increment daily steps
      $set: { lastStepUpdate: new Date() },
    },
    { upsert: true }
  );

  return { message: 'Steps updated successfully' };
};


export { updateStepHistory, getUserStepData };
