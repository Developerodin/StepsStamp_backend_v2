import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { savePoolEntry } from '../services/pools.service.js';
import { getUserStepData } from '../services/fitness.service.js'; // Fetch steps from DB
import { saveDailyReward } from '../services/poolreward.service.js';
import { getUserWalletAndNft } from '../services/user.service.js';
import Pool from '../models/pools.model.js';
import User from '../models/user.model.js';
import moment from 'moment';

const saveDailyPoolA = catchAsync(async (req, res) => {
  //const userId = req.user.id;
  const userId = req.body.userId;

  // Fetch user's step data from database
  const userFitness = await getUserStepData(userId);

  if (!userFitness) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'User fitness data not found' });
  }

  if (userFitness.dailyRewardSteps >= 1500) {
    // If step condition is met, save Pool A entry
    const response = await savePoolEntry(userId, 'PoolA', userFitness.dailyRewardSteps);
   
    let {decentralizedWalletAddress, nftAddress} = await getUserWalletAndNft(userId);
  
    if (!nftAddress) { 
      nftAddress = "free";  // ✅ Ensure nftAddress has a value
  }
    console.log(nftAddress);
    const rewardResponse = await saveDailyReward(userId, decentralizedWalletAddress, nftAddress, 'A');

    res.status(httpStatus.CREATED).json(response);
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Insufficient steps for Pool A' });
  }
});

const saveDailyPoolB = catchAsync(async (req, res) => {
  // const userId = req.user.id;
  const userId = req.body.userId;
  // Fetch user's step data from database
  const userFitness = await getUserStepData(userId);

  if (!userFitness) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'User fitness data not found' });
  }
  
  if (userFitness.dailyRewardSteps >= 10000) {
    // If step condition is met, save Pool B entry
    const response = await savePoolEntry(userId, 'PoolB', userFitness.dailyRewardSteps);
    let {decentralizedWalletAddress, nftAddress} = await getUserWalletAndNft(userId);
  
    if (!nftAddress) { 
      nftAddress = "free";  // ✅ Ensure nftAddress has a value
  }
    console.log(nftAddress);
    const rewardResponse = await saveDailyReward(userId, decentralizedWalletAddress, nftAddress, 'B');

    res.status(httpStatus.CREATED).json(response);
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Insufficient steps for Pool B' });
  }
});

const getUserActivePools = async (req, res) => {
  try {
    const { userId } = req.body;  
    const today = moment().format('YYYY-MM-DD');  // Format date as string

    // Query by userId and string date format
    const poolEntries = await Pool.find({ 
      userId, 
      date: today  // Ensure you're querying with the correct format
    });

    const response = {
      PoolA: false,
      PoolB: false
    };

    poolEntries.forEach(entry => {
      if (entry.poolType === 'PoolA') {
        response.PoolA = true;
      }
      if (entry.poolType === 'PoolB') {
        response.PoolB = true;
      }
    });

    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error fetching user pool status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get all users with their activated pools (historical data with activation date and time, and user name)
 */
const getAllUsersActivatedPools = catchAsync(async (req, res) => {
  // Query to find all pool entries
  const poolEntries = await Pool.find().sort({ date: 1 }); // Sort by date to get the earliest activation date

  // Create a response object to group users by their activated pools
  const userPools = {};

  poolEntries.forEach((entry) => {
    const userId = entry.userId.toString();

    if (!userPools[userId]) {
      userPools[userId] = {
        userId,
        name: null, // Placeholder for the user's name
        PoolA: { activated: false, dateTime: null },
        PoolB: { activated: false, dateTime: null },
      };
    }

    if (entry.poolType === 'PoolA' && !userPools[userId].PoolA.activated) {
      userPools[userId].PoolA.activated = true;
      userPools[userId].PoolA.dateTime = entry.date; // Store the activation date and time
    }

    if (entry.poolType === 'PoolB' && !userPools[userId].PoolB.activated) {
      userPools[userId].PoolB.activated = true;
      userPools[userId].PoolB.dateTime = entry.date; // Store the activation date and time
    }
  });

  // Fetch user details (names) for all userIds
  const userIds = Object.keys(userPools);
  const users = await User.find({ _id: { $in: userIds } }).select('_id name'); // Fetch userId and name

  // Map user names to the response
  users.forEach((user) => {
    if (userPools[user._id.toString()]) {
      userPools[user._id.toString()].name = user.name;
    }
  });

  // Convert the object to an array for the response
  const response = Object.values(userPools);

  res.status(httpStatus.OK).json({ success: true, data: response });
});



export { saveDailyPoolA, saveDailyPoolB,getUserActivePools ,getAllUsersActivatedPools };
