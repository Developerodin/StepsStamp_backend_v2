import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import transactionService from '../services/transaction.service.js';
import { distributeBonusForAllNFTs, distribute50kDailyRewards } from '../services/cronJobs/50kDistributation.service.js';
import TransactionHistory from '../models/transactions.model.js';
import moment from 'moment';

const getAllTransactions = catchAsync(async (req, res) => {
  const transactions = await transactionService.getAllTransactions();
  res.status(httpStatus.OK).json({ success: true, data: transactions });
});

const getTransactionsByUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const transactions = await transactionService.getTransactionsByUser(userId);
  res.status(httpStatus.OK).json({ success: true, data: transactions });
});

const getTransactionsByUserAndType = catchAsync(async (req, res) => {
  const { userId, transactionType } = req.params;
  const transactions = await transactionService.fetchTransactionsByUserAndType(userId, transactionType);
  res.status(httpStatus.OK).json({ success: true, data: transactions });
});

const distribute30day = catchAsync(async (req, res) => {
  const x = distributeBonusForAllNFTs();
  res.status(httpStatus.OK).json({ success: true, data: x });
})

const distribute50k = catchAsync(async (req, res) => {
 const x = distribute50kDailyRewards();
  res.status(httpStatus.OK).json({ success: true, data: x });
})

const getLastNDaysRewards = catchAsync(async (req, res) => {
  try {
    const { userId, days } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Invalid User ID' });
    }

    const numberOfDays = parseInt(days, 10);
    if (isNaN(numberOfDays) || numberOfDays <= 0) {
      return res.status(400).json({ message: 'Invalid number of days' });
    }

    const today = moment().startOf('day');
    const startDate = moment(today).subtract(numberOfDays - 1, 'days');

    // Fetch Pool A and Pool B rewards from TransactionHistory
    const rewards = await TransactionHistory.find({
      userId,
      transactionType: { $in: ['pool_A_reward', 'pool_B_reward'] },
      timestamp: { $gte: startDate.toDate(), $lte: today.toDate() },
    }).lean();

    // Initialize day-wise rewards
    const rewardsData = {};

    // Loop through the last N days
    for (let i = 0; i < numberOfDays; i++) {
      const currentDate = moment(startDate).add(i, 'days').format('DD/MM/YY');
      rewardsData[currentDate] = { poolAReward: 0, poolBReward: 0, totalReward: 0 };
    }

    // Aggregate rewards for each day
    rewards.forEach((reward) => {
      const rewardDate = moment(reward.timestamp).format('DD/MM/YY');
      if (rewardsData[rewardDate]) {
        if (reward.transactionType === 'pool_A_reward') {
          rewardsData[rewardDate].poolAReward += reward.amount;
        } else if (reward.transactionType === 'pool_B_reward') {
          rewardsData[rewardDate].poolBReward += reward.amount;
        }
        // Update totalReward
        rewardsData[rewardDate].totalReward =
          rewardsData[rewardDate].poolAReward + rewardsData[rewardDate].poolBReward;
      }
    });

    res.status(200).json({
      userId,
      days: numberOfDays,
      rewardsData,
    });
  } catch (error) {
    console.error('Error fetching last N days rewards:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




export default {
  getAllTransactions,
  getTransactionsByUser,
  getTransactionsByUserAndType,
  distribute30day,
  distribute50k,
  getLastNDaysRewards
};
