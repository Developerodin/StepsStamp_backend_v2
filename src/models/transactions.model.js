import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
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
    transactionType: {
      type: String,
      enum: [
        'deposit',
        'withdrawal',
        'staking',
        'unstaking',
        'swap',
        'referral_bonus',
        'investor_bonus',
        'watch_bonus',
        'phase_bonus',
        'daily_reward',
        'pool_A_reward',
        'pool_B_reward',
        'purchase',
        'deposite_against_purchase'
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ['SSBT', 'USDT', 'BUSD', 'USD'],
      required: true,
    },
    transactionStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed' ,'claimed'],
      default: 'completed',
    },
    blockchainId: {
      type: String,
      default: null,
    },
    tokenId:{
      type: String,
      default: null,
    },
    watchGiven:{
      type:Boolean,
      default:false
    },
    transactionHash: {
      type: String,
      sparse: true, // Only required for blockchain transactions
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null, // Links to Payment if it's a purchase transaction
    },
    senderWalletId: {
      type: String,
      default: null, // Wallet ID of the sender (for transfers, swaps, etc.)
    },
    receiverWalletId: {
      type: String,
      default: null, // Wallet ID of the receiver (if applicable)
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Additional data (e.g., staking period, swap details)
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, collection: 'transaction_history' }
);

transactionSchema.index({ userId: 1, transactionType: 1 });

const TransactionHistory = mongoose.model('TransactionHistory', transactionSchema);

export default TransactionHistory;
