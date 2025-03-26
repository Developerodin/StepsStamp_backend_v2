import Joi from "joi";

/**
 * InvestorBonus validation schema
 */
const investorBonusSchema = Joi.object({
    userId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    blockchainId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    totalDays: Joi.number().integer().positive().default(30),
    daysRemaining: Joi.number().integer().positive().default(30),
    status: Joi.string().valid("active", "completed", "expired").default("active"),
    nftAddress: Joi.string().required(),
    decentralizedWalletAddress: Joi.string().required(),
    tokenId: Joi.string().required(),
    lastProcessedDate: Joi.date().optional(),
});

/**
 * Individual validation schemas for API routes
 */
export const createInvestorBonus = investorBonusSchema;
export const updateInvestorBonus = investorBonusSchema;
export const getInvestorBonusById = Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
});
export const deleteInvestorBonus = getInvestorBonusById;
