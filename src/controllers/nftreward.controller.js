import { calculatePoolRewards } from '../services/nftreward.service.js';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';

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

export default {
  getPoolRewards
}; 