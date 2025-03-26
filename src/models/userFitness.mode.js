import mongoose from 'mongoose';

const stepEntrySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now, // Stores exact time of step entry
  },
  walkingSteps: {
    type: Number,
    default: 0,
    required: true,
  },
  rewardSteps: {
    type: Number,
    default: 0,
    required: true,
  },
});

const userFitnessSchema = new mongoose.Schema(
  {
  
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    monthYear: {
      type: String, // Format: "YYYY-MM", ensuring one record per user per month
      required: true,
    },
    dailyWalkingSteps: {
      type: Number, // Summary of daily walking steps (reset at GMT-00 daily)
      default: 0,
    },
    dailyRewardSteps: {
      type: Number, // Summary of real steps tracked (reset at GMT-00 daily)
      default: 0,
    },
    lastStepUpdate: {
      type: Date,
      default: Date.now,
    },
    fitnessSource: {
      type: String,
      enum: ['Google Fit', 'Apple HealthKit', 'Manual'],
      default: 'Manual',
    },
    stepHistory: {
      type: Map,
      of: [stepEntrySchema], // Each key is a **date (DD/MM/YY)** storing an array of step records
      default: {},
    },
  },
  { timestamps: true }
);

// Ensures one entry per user per month
userFitnessSchema.index({ userId: 1, monthYear: 1 }, { unique: true });

const UserFitness = mongoose.model('UserFitness', userFitnessSchema);

export default UserFitness;
