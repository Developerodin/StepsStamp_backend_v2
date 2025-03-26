import mongoose from 'mongoose';

const stakingSchema = new mongoose.Schema({
  stakedAmount: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
  },
  durationDays: {
    type: Number, // Staking duration (30, 60, 120 days)
    required: true,
  },
  autoStakingEnabled: {
    type: Boolean,
    default: false,
  },
  rewardRate: {
    type: mongoose.Schema.Types.Decimal128, // Example: 6% APY
    required: true,
  },
  stakedAt: {
    type: Date,
    default: Date.now,
  },
  unstakeAt: {
    type: Date,
    required: true, // Auto-calculated based on `stakedAt` + `durationDays`
  },
});

const walletSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true, // Automatically generates unique wallet ID
      unique: true,
      required: true,
      index: true, // Allows fast lookups
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    totalBalanceUSD: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
    tokens: {
      SSB: {
        balance: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        staked: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        manualStacking: { type: stakingSchema, default: null },
        autoStacking: { type: stakingSchema, default: null },
      },
      USDT: {
        balance: { type: mongoose.Schema.Types.Decimal128, default: 0 },
      },
      BUSD: {
        balance: { type: mongoose.Schema.Types.Decimal128, default: 0 },
      },
    },
    walletAddresses: {
      SSB: { type: String, default: null },
      USDT: { type: String, default: null },
      BUSD: { type: String, default: null },
    },
    withdrawableBalance: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
    blockchain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blockchain', // Refers to the Blockchain schema
      default: null,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, collection: 'user_wallets' }
);

walletSchema.index({ userId: 1 });

const UserWallet = mongoose.model('UserWallet', walletSchema);

export default UserWallet;
