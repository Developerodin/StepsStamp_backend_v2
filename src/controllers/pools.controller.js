import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { savePoolEntry } from '../services/pools.service.js';
import { getUserStepData } from '../services/fitness.service.js'; // Fetch steps from DB
import { saveDailyReward } from '../services/poolreward.service.js';
import { getUserWalletAndNft } from '../services/user.service.js';

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

export { saveDailyPoolA, saveDailyPoolB };
