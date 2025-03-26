import cron from 'node-cron';
import UserFitness from '../../models/userFitness.mode.js';
import DailyReward from '../../models/dailyrewards.model.js';
import moment from 'moment-timezone';
import logger from '../../config/logger.js';


/**
 * Clears all pools data and resets daily steps at GMT-00:02 every day.
 */
const resetDailyData = async () => {
  try {
    console.log('I am called');
    logger.info('⏳ Resetting daily steps and clearing pools data...');

    // ✅ Step 1: Clear PoolA and PoolB data
    await DailyReward.deleteMany({});
    
    logger.info('✅ Cleared PoolA and PoolB data');

    // ✅ Step 2: Reset daily steps for all users
    await UserFitness.updateMany({}, { 
      $set: { 
        dailyWalkingSteps: 0, 
        dailyRewardSteps: 0 
      }
    });

    logger.info('✅ Reset all users’ daily walking and real steps');

  } catch (error) {
    logger.error(`❌ Error resetting daily data: ${error.message}`);
  }
};

// 🕒 Schedule job to run 2 minutes after GMT-00 (00:02 UTC)
//cron.schedule('*/1 * * * *', () => { test for running the job every 2 mins

cron.schedule('2 0 * * *', () => {
  logger.info('🕒 Running scheduled daily reset (GMT-00:02)...');
  resetDailyData();
}, {
  scheduled: true,
  timezone: "Etc/GMT"
});





export default resetDailyData;
