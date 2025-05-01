import DailyReward from '../models/dailyrewards.model.js';
import User from '../models/user.model.js';
import { Blockchain } from '../models/blockchain.model.js';
import Pool from '../models/pools.model.js';

/**
 * Calculate and distribute NFT rewards for a specific pool type and NFT
 * @param {string} poolType - The pool type ('A' or 'B')
 * @param {string} nftAddress - The NFT address to process rewards for
 * @returns {Promise<Array>} Array of objects containing user rewards data
 */
export const calculatePoolRewards = async (poolType, nftAddress) => {
  try {
    // Find all users in the specified pool type with the given NFT address
    const poolUsers = await DailyReward.find({
      poolType,
      nftAddress
    }).populate('userId', 'name decentralizedWalletAddress');

    if (!poolUsers || poolUsers.length === 0) {
      return {
        success: true,
        message: 'No users found in the specified pool',
        rewards: []
      };
    }

    // Get NFT data from blockchain model
    const nftData = await Blockchain.findOne({ nftAddress });
    if (!nftData) {
      return {
        success: true,
        message: 'NFT data not found',
        rewards: []
      };
    }

    // Calculate total tokens for the pool (half of daily mining cap)
    const totalDailyTokens = nftData.dailyMineCap;
    const poolTokens = totalDailyTokens / 2; // Split equally between Pool A and Pool B

    let rewards = [];

    if (poolType === 'A') {
      // For Pool A: Distribute based on steps
      const eligibleUsers = new Map(); // Use Map to ensure unique users
      let totalSteps = 0;

      // Get latest pool data for each user
      for (const user of poolUsers) {
        // Skip if user data is invalid
        if (!user || !user.userId || !user.userId._id) {
          continue;
        }

        // Skip if we already processed this user
        if (eligibleUsers.has(user.userId._id.toString())) {
          continue;
        }

        const userPool = await Pool.findOne({ 
          userId: user.userId._id,
          poolType: poolType === 'A' ? 'PoolA' : 'PoolB'
        }).sort({ date: -1 }).limit(1);

        if (userPool) {
          eligibleUsers.set(user.userId._id.toString(), {
            user,
            steps: userPool.stepsRecorded,
            date: userPool.date
          });
          totalSteps += userPool.stepsRecorded;
        }
      }

      // If no eligible users found, return empty rewards
      if (eligibleUsers.size === 0 || totalSteps === 0) {
        return {
          success: true,
          message: 'No eligible users found in Pool A',
          rewards: []
        };
      }

      // Calculate tokens based on steps proportion
      rewards = Array.from(eligibleUsers.values()).map(({ user, steps, date }) => ({
        userId: user.userId._id,
        userName: user.userId.name,
        decentralizedWalletAddress: user.decentralizedWalletAddress,
        nftAddress: user.nftAddress,
        nftName: nftData.name,
        tokens: (steps / totalSteps) * poolTokens,
        totalPoolTokens: poolTokens,
        steps: steps,
        rewardDate: date
      }));
    } else {
      // For Pool B: Equal distribution
      const uniqueUsers = new Map(); // Use Map to ensure unique users
      
      // Filter out invalid users
      poolUsers.forEach(user => {
        if (user && user.userId && user.userId._id) {
          uniqueUsers.set(user.userId._id.toString(), user);
        }
      });

      // If no valid users found, return empty rewards
      if (uniqueUsers.size === 0) {
        return {
          success: true,
          message: 'No eligible users found in Pool B',
          rewards: []
        };
      }

      const tokensPerUser = poolTokens / uniqueUsers.size;
      rewards = Array.from(uniqueUsers.values()).map(user => ({
        userId: user.userId._id,
        userName: user.userId.name,
        decentralizedWalletAddress: user.decentralizedWalletAddress,
        nftAddress: user.nftAddress,
        nftName: nftData.name,
        tokens: tokensPerUser,
        totalPoolTokens: poolTokens
      }));
    }

    return {
      success: true,
      message: 'Rewards calculated successfully',
      rewards
    };
  } catch (error) {
    throw new Error(`Error calculating pool rewards: ${error.message}`);
  }
};

// const rewards = await calculatePoolRewards('A', '0x28226dE0cCEF834a4d23fB41fFd111028E93FC75');
// console.log(rewards);