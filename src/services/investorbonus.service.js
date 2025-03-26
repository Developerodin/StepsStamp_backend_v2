import mongoose from "mongoose";
import InvestorBonus from "../models/investorBonus.model.js";

/**
 * Save an InvestorBonus to the database
 */
export const saveInvestorBonus = async (data) => {
    if (!mongoose.Types.ObjectId.isValid(data.userId) || !mongoose.Types.ObjectId.isValid(data.blockchainId)) {
        throw new Error("Invalid userId or blockchainId");
    }
    const newInvestorBonus = new InvestorBonus(data);
    return await newInvestorBonus.save();
};

/**
 * Fetch all InvestorBonuses
 */
export const fetchAllInvestorBonuses = async () => {
    return await InvestorBonus.find().lean();
};

/**
 * Fetch an InvestorBonus by ID
 */
export const fetchInvestorBonusById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
    }
    return await InvestorBonus.findById(id).lean();
};

/**
 * Update an InvestorBonus by ID
 */
export const updateInvestorBonus = async (id, updateData) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
    }
    return await InvestorBonus.findByIdAndUpdate(id, updateData, { new: true }).lean();
};

/**
 * Delete an InvestorBonus by ID
 */
export const deleteInvestorBonus = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
    }
    return await InvestorBonus.findByIdAndDelete(id);
};


export const fetchInvestorBonusesByNFTAddress = async (nftAddress) => {
    try {
        if (!nftAddress) {
            throw new Error("NFT Address is required");
        }

        const bonuses = await InvestorBonus.find({ nftAddress })
            .select("decentralizedWalletAddress")
            .lean();

        if (!bonuses.length) {
            console.log(`⚠️ No investor bonuses found for NFT address: ${nftAddress}`);
            return [];
        }

        console.log(`✅ Investor bonuses fetched for NFT address ${nftAddress}:`, bonuses);
        return bonuses;
    } catch (error) {
        console.error("❌ Error fetching investor bonuses by NFT address:", error.message);
        throw error;
    }
};

export const fetch30DayBonusWalletsByNFTAddress = async (nftAddress) => {
    try {
        if (!nftAddress) {
            throw new Error("NFT Address is required");
        }

        // Fetch only `decentralizedWalletAddress` and convert to a plain array
        const wallets = await InvestorBonus.find({ nftAddress })
            .select("decentralizedWalletAddress -_id") // Exclude `_id`
            .lean();

        // Extract only the wallet addresses into an array
        const walletAddresses = wallets.map(bonus => bonus.decentralizedWalletAddress);

        console.log(`✅ Wallets for NFT address ${nftAddress}:`, walletAddresses);
        return walletAddresses;
    } catch (error) {
        console.error("❌ Error fetching wallets:", error.message);
        throw error;
    }
};
