import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { updateStepHistory, getUserStepData } from '../services/fitness.service.js';
import UserFitness from '../models/userFitness.mode.js';
import TransactionHistory from '../models/transactions.model.js';
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
        weeklyGoalStatus[dayName] = totalSteps >= 1500;
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

    const stepHistory = userFitness.stepHistory || new Map();
    console.log("stepHistory ===>", stepHistory);
    const historyEntries = Array.from(stepHistory.entries());

    // Sort by date in ascending order
    historyEntries.sort(([dateA], [dateB]) => moment(dateA, 'DD/MM/YY').valueOf() - moment(dateB, 'DD/MM/YY').valueOf());

    let currentStreak = 0;
    let maxStreak = 0;
    let totalSteps = 0;
    let lastDate = null;

    // Loop through each day in step history
    for (const [date, steps] of historyEntries) {
      const totalWalkingSteps = steps.reduce((acc, entry) => acc + (entry.walkingSteps || 0), 0);
      const totalRewardSteps = steps.reduce((acc, entry) => acc + (entry.rewardSteps || 0), 0);
      const dailyTotalSteps = totalRewardSteps;

      // Add to total steps
      totalSteps += dailyTotalSteps;

      // Check if the goal (1500 steps) is met
      if (dailyTotalSteps >= 1500) {
        // If this is the first entry
        if (!lastDate) {
          currentStreak = 1;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          // Calculate days difference
          const daysDiff = moment(date, 'DD/MM/YY').diff(moment(lastDate, 'DD/MM/YY'), 'days');
          
          // Only count as streak if it's exactly the next day
          if (daysDiff === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
          } else {
            // If there's any gap in dates, reset streak
            currentStreak = 1;
          }
        }
      } else {
        // If goal not met or no data for the day, reset current streak
        currentStreak = 0;
      }
      
      lastDate = date;
    }

    // If the last recorded date is not today, reset current streak
    const today = moment().format('DD/MM/YY');
    if (lastDate !== today) {
      currentStreak = 0;
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

const getUserLastNDaysData = async (req, res) => {
  try {
    const { userId,days } = req.body;
 

    if (!userId) {
      return res.status(400).json({ message: 'Invalid User ID' });
    }

    const numberOfDays = parseInt(days, 10);
    if (isNaN(numberOfDays) || numberOfDays <= 0) {
      return res.status(400).json({ message: 'Invalid number of days' });
    }

    const today = moment().startOf('day');
    const startDate = moment(today).subtract(numberOfDays - 1, 'days');

    const userFitness = await UserFitness.findOne({ userId });

    if (!userFitness) {
      return res.status(404).json({ message: 'User fitness data not found' });
    }

    const stepHistory = userFitness.stepHistory || {};
    
    const stepData = [];
    
    // Loop through the last N days
    for (let i = 0; i < numberOfDays; i++) {
      const date = moment(startDate).add(i, 'days').format('DD/MM/YY');
      
      if (stepHistory.has(date)) {
        const dayData = stepHistory.get(date);
        
        const totalWalkingSteps = dayData.reduce((acc, record) => acc + record.walkingSteps, 0);
        const totalRewardSteps = dayData.reduce((acc, record) => acc + record.rewardSteps, 0);
        
        stepData.push({
          date,
          walkingSteps: totalWalkingSteps,
          rewardSteps: totalRewardSteps,
          totalSteps: totalWalkingSteps + totalRewardSteps,
        });
      } else {
        // If no data for this day, return 0 steps
        stepData.push({
          date,
          walkingSteps: 0,
          rewardSteps: 0,
          totalSteps: 0,
        });
      }
    }

    res.status(200).json({
      userId,
      days: numberOfDays,
      stepData,
    });
  } catch (error) {
    console.error('Error fetching last N days data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getWeeklyDayWiseData = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Invalid User ID' });
    }

    const today = moment().startOf('day');
    const weekStart = moment(today).startOf('isoWeek'); // Start of the week (Monday)
    const weekEnd = moment(weekStart).endOf('isoWeek'); // End of the week (Sunday)

    // Fetch user fitness data
    const userFitness = await UserFitness.findOne({ userId });

    if (!userFitness) {
      return res.status(404).json({ message: 'User fitness data not found' });
    }

    const stepHistory = userFitness.stepHistory || new Map();

    // Initialize day-wise data
    const dayWiseData = {
      Monday: { rewardSteps: 0, poolAReward: 0, poolBReward: 0 },
      Tuesday: { rewardSteps: 0, poolAReward: 0, poolBReward: 0 },
      Wednesday: { rewardSteps: 0, poolAReward: 0, poolBReward: 0 },
      Thursday: { rewardSteps: 0, poolAReward: 0, poolBReward: 0 },
      Friday: { rewardSteps: 0, poolAReward: 0, poolBReward: 0 },
      Saturday: { rewardSteps: 0, poolAReward: 0, poolBReward: 0 },
      Sunday: { rewardSteps: 0, poolAReward: 0, poolBReward: 0 },
    };

    // Fetch Pool A and Pool B rewards from TransactionHistory
    const rewards = await TransactionHistory.find({
      userId,
      transactionType: { $in: ['pool_A_reward', 'pool_B_reward'] },
      timestamp: { $gte: weekStart.toDate(), $lte: weekEnd.toDate() },
    }).lean();

    // Loop through each day of the current week (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const currentDate = moment(weekStart).add(i, 'days').format('DD/MM/YY');
      const dayName = moment(weekStart).add(i, 'days').format('dddd'); // Get day name (Monday, Tuesday, etc.)

      // Get step data for the day
      if (stepHistory.has(currentDate)) {
        const dayData = stepHistory.get(currentDate);

        // Sum up reward steps for the day
        const totalRewardSteps = dayData.reduce((acc, record) => acc + (record.rewardSteps || 0), 0);

        // Update reward steps in day-wise data
        dayWiseData[dayName].rewardSteps += totalRewardSteps;
      }

      // Get Pool A and Pool B rewards for the day
      rewards.forEach((reward) => {
        if (moment(reward.timestamp).format('DD/MM/YY') === currentDate) {
          if (reward.transactionType === 'pool_A_reward') {
            dayWiseData[dayName].poolAReward += reward.amount;
          } else if (reward.transactionType === 'pool_B_reward') {
            dayWiseData[dayName].poolBReward += reward.amount;
          }
        }
      });
    }

    res.status(200).json({
      userId,
      weekStart: weekStart.format('DD/MM/YY'),
      weekEnd: weekEnd.format('DD/MM/YY'),
      dayWiseData,
    });
  } catch (error) {
    console.error('Error fetching weekly day-wise data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};




export { updateSteps, getSteps, getAnalysis,getWeeklyStepGoalStatus,getUserStepStats,getUserLastNDaysData ,getWeeklyDayWiseData };
