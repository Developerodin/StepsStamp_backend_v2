import express from "express";
import * as investorBonusController from "../../controllers/investorbonus.controller.js";
import validate from "../../middlewares/validate.js";
import * as investorBonusValidation from "../../validations/investorbonus.validation.js";

const router = express.Router();

// Create InvestorBonus
router.post("/", validate(investorBonusValidation.createInvestorBonus), investorBonusController.createInvestorBonus);

// Get All Investor Bonuses
router.get("/", investorBonusController.getAllInvestorBonuses);

// Get InvestorBonus by ID
router.get("/:id", validate(investorBonusValidation.getInvestorBonusById), investorBonusController.getInvestorBonusById);

// Update InvestorBonus
router.patch("/:id", validate(investorBonusValidation.updateInvestorBonus), investorBonusController.updateInvestorBonus);

// Delete InvestorBonus
router.delete("/:id", validate(investorBonusValidation.deleteInvestorBonus), investorBonusController.deleteInvestorBonus);

router.get("/nft/:nftAddress", investorBonusController.getInvestorBonusesByNFTAddress);

export default router;
