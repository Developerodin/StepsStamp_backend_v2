import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
  {
    purchaseId: {
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
    blockchainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blockchain',
      required: true,
      index: true,
    },
    nftAddress:{
      type: String,
      default: null,
    },
    paymentDate: {
      type: Date,
      default: Date.now, // Stores the time of payment
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    country: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    totalAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true, // Ensures the amount is always recorded
    },
    currency: {
      type: String,
      enum: ['USDT', 'SSB', 'BUSD', 'USD'],
      required: true,
    },
    note: {
      type: String,
      default: null,
    },
    testByDeveloper: {
      type: Boolean,
      default: false, // Identifies test transactions
    },
    logs: {
      type: String,
      default: null, // Stores API response logs or errors
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'crypto_wallet', 'bank_transfer'],
      default: 'crypto_wallet',
    },
    paymentGateway: {
      type: String,
      default: null, // Example: Stripe, PayPal, MetaMask
    },
    transactionHash: {
      type: String,
      unique: true,
      sparse: true, // Ensures uniqueness when present
    },
    invoiceId: {
      type: String,
      unique: true,
      sparse: true, // Ensures uniqueness when present
    },
    isWatchGiven: {
      type: Boolean,
      default: false, // Tracks if a watch bonus was given
    },
    // Wallet details for payments
    senderWalletId: {
      type: String,
      default: null, // Wallet ID of the sender (crypto or bank)
    },
    receiverWalletId: {
      type: String,
      default: null, // Wallet ID where payment was received
    },
  },
  { timestamps: true, collection: 'purchases' }
);

const Purchase = mongoose.model('Purchases', purchaseSchema);

export default Purchase;
