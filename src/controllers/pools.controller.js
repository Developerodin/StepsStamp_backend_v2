import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { savePoolEntry } from '../services/pools.service.js';
import { getUserStepData } from '../services/fitness.service.js'; // Fetch steps from DB
import { saveDailyReward } from '../services/poolreward.service.js';
import { getUserWalletAndNft } from '../services/user.service.js';
import Pool from '../models/pools.model.js';
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

export { saveDailyPoolA, saveDailyPoolB,getUserActivePools };
