import { calculatePoolRewards } from '../services/nftreward.service.js';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import {
  distributeMiningDailyRewardsForGreenNft,
  distributeMiningDailyRewardsForGoldNft,
  distributeMiningDailyRewardsForSilverNft,
  distributeMiningDailyRewardsForWhiteNft,
  distributeMiningDailyRewardsForBlackNft
} from '../services/cronJobs/nftRewardDistribuation.service.js';

const getPoolRewards = catchAsync(async (req, res) => {
  const { poolType, nftAddress } = req.query;
  
  if (!poolType || !nftAddress) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: 'error',
      message: 'poolType and nftAddress are required query parameters'
    });
  }

  const rewards = await calculatePoolRewards(poolType, nftAddress);
  
  res.status(httpStatus.OK).json({
    status: 'success',
    data: rewards
  });
});

const distributeAllRewards = catchAsync(async (req, res) => {
  try {
    // Execute all reward distribution functions in sequence
    await distributeMiningDailyRewardsForGreenNft();
    await distributeMiningDailyRewardsForGoldNft();
    await distributeMiningDailyRewardsForSilverNft();
    await distributeMiningDailyRewardsForWhiteNft();
    await distributeMiningDailyRewardsForBlackNft();

    res.status(httpStatus.OK).json({
      status: 'success',
      message: 'All NFT rewards distribution completed successfully'
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Error distributing NFT rewards',
      error: error.message
    });
  }
});

export default {
  getPoolRewards,
  distributeAllRewards
}; 