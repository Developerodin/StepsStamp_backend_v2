import UserFitness from '../models/userFitness.mode.js';
import moment from 'moment';


/**
 * Fetch user's step data
 */
const getUserStepData = async (userId, date, monthYear) => {
  const currentMonth = monthYear || moment().format('YYYY-MM'); // Default to current month
  const previousMonth = moment(currentMonth).subtract(1, 'month').format('YYYY-MM');
  const formattedDate = date ? moment(date, 'YYYY-MM-DD').format('DD/MM/YY') : null; // Ensure correct format
  const currentDate = moment().format('DD/MM/YY'); // Get current date

  // Find user fitness data for both current and previous month
  const userFitnessData = await UserFitness.find({ 
    userId, 
    monthYear: { $in: [currentMonth, previousMonth] }
  }).lean();

  if (!userFitnessData || userFitnessData.length === 0) {
    return { message: 'No step data found for the given period' };
  }

  // Merge step history from both months
  const mergedStepHistory = {};
  userFitnessData.forEach(fitness => {
    if (fitness.stepHistory) {
      Object.assign(mergedStepHistory, fitness.stepHistory);
    }
  });

  if (formattedDate) {
    // Return stepHistory for the specific date
    return {
      date: formattedDate,
      steps: mergedStepHistory[formattedDate] || [],
    };
  }

  // Get current date's step data
  const currentDateSteps = mergedStepHistory[currentDate] || [];
  const currentDateData = currentDateSteps[0] || { walkingSteps: 0, rewardSteps: 0 };

  // Return entire merged step history with current date's steps
  return {
    monthYear: currentMonth,
    dailyWalkingSteps: currentDateData.walkingSteps,
    dailyRewardSteps: currentDateData.rewardSteps,
    stepHistory: mergedStepHistory,
  };
};


/**
 * Update user's step count
 */
// const updateStepHistory = async (walkingSteps, rewardSteps, source, userId) => {
//   const currentDate = moment().format('DD/MM/YY'); // Example: "05/02/24"
//   const currentMonth = moment().format('YYYY-MM'); // Example: "2025-02"

//   let userFitness = await UserFitness.findOne({ userId, monthYear: currentMonth });

//   if (!userFitness) {
//     // Create new monthly record if it doesn't exist
//     userFitness = new UserFitness({
//       userId,
//       monthYear: currentMonth,
//       dailyWalkingSteps: 0,
//       dailyRewardSteps: 0,
//       stepHistory: {}, // Ensure stepHistory starts as an object
//     });
//   }

//   // Ensure stepHistory is properly initialized
//   if (!userFitness.stepHistory) {
//     userFitness.stepHistory = {};
//   }

//   // Prepare step entry
//   const stepEntry = {
//     timestamp: new Date(),
//     walkingSteps,
//     rewardSteps,
//   };

//   // Ensure the current date exists in stepHistory before pushing
//   await UserFitness.updateOne(
//     { userId, monthYear: currentMonth },
//     {
//       $set: { [`stepHistory.${currentDate}`]: userFitness.stepHistory[currentDate] || [] },
//       $push: { [`stepHistory.${currentDate}`]: stepEntry }, // Append step entry
//       $inc: { dailyWalkingSteps: walkingSteps, dailyRewardSteps: rewardSteps }, // Increment daily steps
//       $set: { lastStepUpdate: new Date() },
//     },
//     { upsert: true }
//   );

//   return { message: 'Steps updated successfully' };
// };


const updateStepHistory = async (walkingSteps, rewardSteps, source, userId) => {
  const currentDate = moment().format('DD/MM/YY'); // e.g. "05/04/25"
  const currentMonth = moment().format('YYYY-MM'); // e.g. "2025-04"

  let userFitness = await UserFitness.findOne({ userId, monthYear: currentMonth });

  if (!userFitness) {
    userFitness = new UserFitness({
      userId,
      monthYear: currentMonth,
      dailyWalkingSteps: 0,
      dailyRewardSteps: 0,
      stepHistory: {},
    });
    await userFitness.save();
  }

  const stepEntry = {
    timestamp: new Date(),
    walkingSteps,
    rewardSteps,
  };

  // If date key already exists in stepHistory, update index 0 entry
  const existingDateEntry = userFitness.stepHistory.get(currentDate);

  if (existingDateEntry && existingDateEntry.length > 0) {
    // Update the first entry
    userFitness.stepHistory.set(currentDate, [stepEntry]);
  } else {
    // New date, set with one step entry
    userFitness.stepHistory.set(currentDate, [stepEntry]);
  }

  // Update daily totals and save
  userFitness.dailyWalkingSteps = walkingSteps;
  userFitness.dailyRewardSteps = rewardSteps;
  userFitness.lastStepUpdate = new Date();
  userFitness.fitnessSource = source;
  await userFitness.save();

  return { message: 'Steps updated successfully (single entry per date)' };
};



export { updateStepHistory, getUserStepData };
