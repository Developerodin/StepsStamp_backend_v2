import DailyReward from "../models/dailyrewards.model.js";
import mongoose from "mongoose";

/**
 * Save a new daily reward entry
 * @param {String} userId - User's ObjectId
 * @param {String} decentralizedWalletAddress - User's wallet address
 * @param {String} nftAddress - NFT contract address
 * @param {String} poolType - Pool type (A or B)
 * @returns {Object} - Saved reward entry
 */
export const saveDailyReward = async (userId, decentralizedWalletAddress, nftAddress, poolType) => {
    try {
        // Validate userId as a MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid userId: Must be a valid MongoDB ObjectId");
        }

        // Validate poolType
        if (!["A", "B"].includes(poolType)) {
            throw new Error("Invalid poolType: Must be either 'A' or 'B'");
        }

        // Create and save the reward entry
        const newReward = new DailyReward({
            userId,
            decentralizedWalletAddress,
            nftAddress,
            poolType
        });

        await newReward.save();
        console.log("✅ Daily reward saved successfully:", newReward);
        return newReward;
    } catch (error) {
        console.error("❌ Error saving daily reward:", error.message);
        throw error;
    }
};

/**
 * Fetch all daily rewards for a user
 * @param {String} userId - User's ObjectId
 * @returns {Array} - List of rewards
 */
export const getDailyRewardsByUserId = async (userId) => {
    try {
        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid userId: Must be a valid MongoDB ObjectId");
        }

        // Fetch all rewards for the user
        const rewards = await DailyReward.find({ userId })
            .select("decentralizedWalletAddress nftAddress poolType createdAt")
            .lean();

        if (!rewards.length) {
            console.log(`⚠️ No daily rewards found for userId: ${userId}`);
            return [];
        }

        console.log("✅ Daily rewards fetched successfully:", rewards);
        return rewards;
    } catch (error) {
        console.error("❌ Error fetching daily rewards:", error.message);
        throw error;
    }
};
