import mongoose from 'mongoose';

const poolSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    poolType: {
      type: String,
      enum: ['PoolA', 'PoolB'],
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    stepsRecorded: {
      type: Number,
      required: true,
    },
    rewardTokens: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
  },
  { timestamps: true }
);

poolSchema.index({ userId: 1, poolType: 1, date: 1 }, { unique: true });

const Pool = mongoose.model('Pool', poolSchema);

export default Pool;
