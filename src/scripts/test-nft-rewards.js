import { calculatePoolRewards } from '../services/nftreward.service.js';


async function testCalculatePoolRewards() {
  try {
    const poolType = 'A'; // or 'B'
    const nftAddress = 'free';
    
    const rewards = await calculatePoolRewards(poolType, nftAddress);
    console.log('Rewards:', JSON.stringify(rewards, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the test
testCalculatePoolRewards(); 