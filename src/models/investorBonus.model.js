import mongoose from 'mongoose';

const investorBonusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    blockchainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blockchain',
      required: true,
      index: true,
    },
    totalDays: { type: Number, default: 30 },
    daysRemaining: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ['active', 'completed', 'expired'],
      default: 'active',
    },
    nftAddress: { type: String, required: true },
    decentralizedWalletAddress: { type: String, required: true },
    tokenId: { type: String, required: true },
    lastProcessedDate: { type: Date, default: null },
  },
  { timestamps: true, collection: 'investor_bonuses' }
);

const InvestorBonus = mongoose.model('InvestorBonus', investorBonusSchema);

export default InvestorBonus;
