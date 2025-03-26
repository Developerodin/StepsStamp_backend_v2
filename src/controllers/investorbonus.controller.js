import * as investorBonusService from '../services/investorbonus.service.js'

/**
 * Create a new InvestorBonus
 */
export const createInvestorBonus = async (req, res) => {
    try {
        const investorBonus = await investorBonusService.saveInvestorBonus(req.body);
        res.status(201).json({ message: "InvestorBonus created successfully", investorBonus });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Get all InvestorBonuses
 */
export const getAllInvestorBonuses = async (req, res) => {
    try {
        const bonuses = await investorBonusService.fetchAllInvestorBonuses();
        res.status(200).json(bonuses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get an InvestorBonus by ID
 */
export const getInvestorBonusById = async (req, res) => {
    try {
        const { id } = req.params;
        const investorBonus = await investorBonusService.fetchInvestorBonusById(id);
        if (!investorBonus) {
            return res.status(404).json({ error: "InvestorBonus not found" });
        }
        res.status(200).json(investorBonus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update an InvestorBonus by ID
 */
export const updateInvestorBonus = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedInvestorBonus = await investorBonusService.updateInvestorBonus(id, req.body);
        res.status(200).json({ message: "InvestorBonus updated successfully", updatedInvestorBonus });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Delete an InvestorBonus by ID
 */
export const deleteInvestorBonus = async (req, res) => {
    try {
        const { id } = req.params;
        await investorBonusService.deleteInvestorBonus(id);
        res.status(200).json({ message: "InvestorBonus deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getInvestorBonusesByNFTAddress = async (req, res) => {
    try {
        const { nftAddress } = req.params;
        
        const investorBonuses = await investorBonusService.fetch30DayBonusWalletsByNFTAddress(nftAddress);
        res.status(200).json(investorBonuses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};