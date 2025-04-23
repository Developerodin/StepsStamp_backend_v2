import DailyReward from '../models/dailyrewards.model.js';
import User from '../models/user.model.js';
import { Blockchain } from '../models/blockchain.model.js';
import UserFitness from '../models/userFitness.mode.js';

/**
 * Calculate and distribute NFT rewards for a specific pool type and NFT
 * @param {string} poolType - The pool type ('A' or 'B')
 * @param {string} nftAddress - The NFT address to process rewards for
 * @returns {Promise<Array>} Array of objects containing user rewards data
 */
export const calculatePoolRewards = async (poolType, nftAddress) => {
  try {
    // console.log("calculatePoolRewards poolType called", poolType);
    // Find all users in the specified pool type with the given NFT address
    const poolUsers = await DailyReward.find({
      poolType,
      nftAddress
    }).populate('userId', 'name decentralizedWalletAddress');

    if (!poolUsers.length) {
      return [];
    }

    // Get NFT data from blockchain model
    const nftData = await Blockchain.findOne({ nftAddress });
    if (!nftData) {
      throw new Error('NFT data not found');
    }

    // Calculate total tokens for the pool (half of daily mining cap)
    const totalDailyTokens = nftData.dailyMineCap;
    const poolTokens = totalDailyTokens / 2; // Split equally between Pool A and Pool B

    let rewards = [];

    if (poolType === 'A') {
      // For Pool A: Distribute based on steps
      const eligibleUsers = new Map(); // Use Map to ensure unique users
      let totalSteps = 0;

      // Get latest step data for each user
      for (const user of poolUsers) {
        // Skip if we already processed this user
        if (eligibleUsers.has(user.userId._id.toString())) {
          continue;
        }

        const userFitness = await UserFitness.findOne({ userId: user.userId._id })
          .sort({ 'stepHistory': -1 })
          .limit(1);

        // console.log("Steps data of pool users", userFitness.stepHistory);
        
        if (userFitness && userFitness.stepHistory) {
          // Convert Map to array of entries and sort by date
          const stepEntries = Array.from(userFitness.stepHistory.entries());
          stepEntries.sort((a, b) => {
            // Convert DD/MM/YY to YYYY-MM-DD for proper date comparison
            const [dayA, monthA, yearA] = a[0].split('/');
            const [dayB, monthB, yearB] = b[0].split('/');
            const dateA = new Date(`20${yearA}-${monthA}-${dayA}`);
            const dateB = new Date(`20${yearB}-${monthB}-${dayB}`);
            return dateB - dateA;
          });

          if (stepEntries.length > 0) {
            const [latestDate, stepData] = stepEntries[0];
            // console.log("latestDate", latestDate);
            const latestSteps = stepData[0]?.rewardSteps || 0;
            // console.log("latestSteps", latestSteps);

            eligibleUsers.set(user.userId._id.toString(), {
              user,
              steps: latestSteps,
              date: latestDate
            });
            totalSteps += latestSteps;
          }
        }
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
      poolUsers.forEach(user => {
        uniqueUsers.set(user.userId._id.toString(), user);
      });

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

    return rewards;
  } catch (error) {
    throw new Error(`Error calculating pool rewards: ${error.message}`);
  }
};

// const rewards = await calculatePoolRewards('A', '0x28226dE0cCEF834a4d23fB41fFd111028E93FC75');
// console.log(rewards);