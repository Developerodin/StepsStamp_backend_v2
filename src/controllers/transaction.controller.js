import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import transactionService from '../services/transaction.service.js';
import { distributeBonusForAllNFTs, distribute50kDailyRewards } from '../services/cronJobs/50kDistributation.service.js';
import TransactionHistory from '../models/transactions.model.js';
import { Blockchain } from '../models/blockchain.model.js';
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
    }).lean();
    console.log('Rewards:', rewards);

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


const getAllUsersTransactionHistory = catchAsync(async (req, res) => {
  try {
    // Fetch all transactions and populate user details
    const transactions = await TransactionHistory.find()
      .populate({
        path: 'userId', // Populate user details
        select: 'name decentralizedWalletAddress', // Only fetch name and decentralizedWalletAddress
      })
      .sort({ timestamp: -1 }); // Sort by most recent transactions

    // Format the response
    const formattedTransactions = transactions.map((transaction) => {
      const date = moment(transaction.timestamp).format('YYYY-MM-DD'); // Extract date
      const time = moment(transaction.timestamp).format('HH:mm:ss'); // Extract time

      return {
        userName: transaction.userId?.name || 'Unknown User',
        decentralizedWalletAddress: transaction.userId?.decentralizedWalletAddress || 'N/A',
        transactionType: transaction.transactionType,
        amount: transaction.amount,
        date, // Include date separately
        time, // Include time separately
      };
    });

    res.status(httpStatus.OK).json({ success: true, data: formattedTransactions });
  } catch (error) {
    console.error('Error fetching all users transaction history:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});

const getAllPurchaseTransactions = catchAsync(async (req, res) => {
  try {
    // Fetch all purchase transactions and populate user details
    const transactions = await TransactionHistory.find({ transactionType: 'purchase' })
      .populate({
        path: 'userId', // Populate user details
        select: 'name', // Only fetch the user's name
      })
      .sort({ timestamp: -1 }); // Sort by most recent transactions

    // Fetch blockchain names for each transaction
    const formattedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const date = moment(transaction.timestamp).format('YYYY-MM-DD'); // Extract date
        const time = moment(transaction.timestamp).format('HH:mm:ss'); // Extract time

        // Fetch blockchain name using blockchainId
        let blockchainName = 'Unknown Blockchain';
        if (transaction.blockchainId) {
          const blockchain = await Blockchain.findById(transaction.blockchainId); // Fetch blockchain details
          blockchainName = blockchain?.name || 'Unknown Blockchain';
        }

        return {
          userName: transaction.userId?.name || 'Unknown User',
          blockchainName, // Blockchain name fetched manually
          amount: transaction.amount,
          date, // Include date separately
          time, // Include time separately
        };
      })
    );

    res.status(httpStatus.OK).json({ success: true, data: formattedTransactions });
  } catch (error) {
    console.error('Error fetching all purchase transactions:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});

const getTransactionsByType = async (req, res) => {
  try {
    const { userId, transactionType } = req.body;

    if (!userId || !transactionType) {
      return res.status(400).json({
        success: false,
        message: 'Both userId and transactionType are required'
      });
    }

    // Validate transactionType against enum values
    const validTransactionTypes = [
      'deposit',
      'withdrawal',
      'staking',
      'unstaking',
      'swap',
      'referral_bonus',
      'investor_bonus',
      'watch_bonus',
      'phase_bonus',
      'daily_reward',
      'pool_A_reward',
      'pool_B_reward',
      'purchase',
      'deposite_against_purchase'
    ];

    if (!validTransactionTypes.includes(transactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction type'
      });
    }

    const transactions = await TransactionHistory.find({
      userId,
      transactionType
    }).sort({ timestamp: -1 });

    return res.status(200).json({
      success: true,
      data: transactions,
      message: 'Transactions retrieved successfully'
    });

  } catch (error) {
    console.error('Error in getTransactionsByType:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};




export default {
  getAllTransactions,
  getTransactionsByUser,
  getTransactionsByUserAndType,
  distribute30day,
  distribute50k,
  getLastNDaysRewards,
  getAllUsersTransactionHistory,
  getAllPurchaseTransactions,
  getTransactionsByType,
};
