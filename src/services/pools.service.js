import Pool from '../models/pools.model.js';
import moment from 'moment';
import User from "../models/user.model.js";

/**
 * Save Pool Entry for a User
 */
const savePoolEntry = async (userId, poolType, stepsRecorded) => {
  const today = moment().format('YYYY-MM-DD');

  // Check if the user has already entered this pool today
  const existingEntry = await Pool.findOne({ userId, poolType, date: today });
  if (existingEntry) {
    return { message: `User has already entered ${poolType} for today.` };
  }

  //update mined block
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { completedBlocks: 1 } }, // Increment by 1
    { new: true } // Return updated document
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  // Save the pool entry
  const newPoolEntry = await Pool.create({
    userId,
    poolType,
    date: today,
    stepsRecorded
   
  });

  return { message: `${poolType} entry saved successfully.`, data: newPoolEntry };
};

/**
 * Save daily reward Entry for a User
 */

const saveDailyreward = async (userId, poolType, stepsRecorded) => {
  const today = moment().format('YYYY-MM-DD');

  // Check if the user has already entered this pool today
  const existingEntry = await Pool.findOne({ userId, poolType, date: today });
  if (existingEntry) {
    return { message: `User has already entered ${poolType} for today.` };
  }

  //update mined block
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { completedBlocks: 1 } }, // Increment by 1
    { new: true } // Return updated document
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  // Save the pool entry
  const newPoolEntry = await Pool.create({
    userId,
    poolType,
    date: today,
    stepsRecorded
   
  });

  return { message: `${poolType} entry saved successfully.`, data: newPoolEntry };
};


/**
 * Fetches the list of eligible wallets for Pool A and Pool B.
 * @returns {Object} { poolA: [wallets], poolB: [wallets] }
 */
 const fetchPoolAWallets = async () => {
  try {
    const today = moment().format('YYYY-MM-DD'); // Get today's date

    // Fetch users from Pool A for today
    const poolAUsers = Pool.findOne();
      
    
    return poolAUsers;
  } catch (error) {
    console.error('❌ Error fetching Pool A wallets:', error);
    return [];
  }
};



export { savePoolEntry, fetchPoolAWallets };
