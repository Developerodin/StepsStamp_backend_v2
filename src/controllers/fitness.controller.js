import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { updateStepHistory, getUserStepData } from '../services/fitness.service.js';
import UserFitness from '../models/userFitness.mode.js';
import moment from 'moment';

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

const generateEmptyWeekStatus = () => {
  return {
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  };
}

 const getWeeklyStepGoalStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = moment().startOf('day');
    const weekStart = moment(today).startOf('isoWeek');  // Monday as the start of the week

    // Get user fitness data
    const userFitness = await UserFitness.findOne({
      userId,
      monthYear: moment().format('YYYY-MM')
    });

    if (!userFitness) {
      return res.status(404).json({ message: 'User fitness data not found' });
    }

    // console.log("User fitness data ===>", userFitness);

    const weeklyGoalStatus = {};
    const stepHistory = userFitness.stepHistory || new Map();

    // Loop through each day of the current week (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const currentDate = moment(weekStart).add(i, 'days').format('DD/MM/YY');
      const dayName = moment(weekStart).add(i, 'days').format('dddd');  // Get day name (Monday, Tuesday, etc.)

      if (stepHistory.has(currentDate)) {
        // Get all step entries for the day
        const dailySteps = stepHistory.get(currentDate);
        
        // Sum all walking and reward steps for the day
        const totalWalkingSteps = dailySteps.reduce((acc, entry) => acc + (entry.walkingSteps || 0), 0);
        const totalRewardSteps = dailySteps.reduce((acc, entry) => acc + (entry.rewardSteps || 0), 0);
        const totalSteps = totalWalkingSteps + totalRewardSteps;

        // Set true if the total steps >= 10,000
        weeklyGoalStatus[dayName] = totalSteps >= 10000;
      } else {
        weeklyGoalStatus[dayName] = false;  // If no data for that day
      }
    }

    return res.status(200).json({
      userId,
      weeklyGoalStatus,
    });

  } catch (error) {
    console.error('Error getting weekly step goal status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

 const getUserStepStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user fitness data
    const userFitness = await UserFitness.findOne({ userId });

    if (!userFitness) {
      return res.status(404).json({ message: 'User fitness data not found' });
    }

    // console.log("User fitness data ===>", userFitness);

    const stepHistory = userFitness.stepHistory || new Map();
    const historyEntries = Array.from(stepHistory.entries());

    // Sort by date in ascending order
    historyEntries.sort(([dateA], [dateB]) => moment(dateA, 'DD/MM/YY').valueOf() - moment(dateB, 'DD/MM/YY').valueOf());

    let currentStreak = 0;
    let maxStreak = 0;
    let totalSteps = 0;

    // Loop through each day in step history
    for (const [date, steps] of historyEntries) {
      const totalWalkingSteps = steps.reduce((acc, entry) => acc + (entry.walkingSteps || 0), 0);
      const totalRewardSteps = steps.reduce((acc, entry) => acc + (entry.rewardSteps || 0), 0);
      const dailyTotalSteps = totalWalkingSteps + totalRewardSteps;

      // Add to total steps
      totalSteps += dailyTotalSteps;

      // Check if the goal (10,000 steps) is met
      if (dailyTotalSteps >= 10000) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);  // Track the longest streak
      } else {
        currentStreak = 0;  // Reset the streak if goal is not met
      }
    }

    res.status(200).json({
      userId,
      totalSteps,
      currentStreak,
      maxStreak
    });

  } catch (error) {
    console.error('Error getting user step stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export { updateSteps, getSteps, getAnalysis,getWeeklyStepGoalStatus,getUserStepStats };
