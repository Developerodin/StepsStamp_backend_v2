import mongoose from "mongoose";

const dailyRewardSchema = new mongoose.Schema(
  {
    decentralizedWalletAddress: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
      default: "free"
    },
    nftAddress: {
      type: String,
      required: true,
      trim: true,
    },
    poolType: {
      type: String,
      enum: ["A", "B"], // Example pool types, update as needed
      required: true,
    }
    
  },
  { timestamps: true } // Adds createdAt & updatedAt fields
);

const DailyReward = mongoose.model("DailyReward", dailyRewardSchema);
export default DailyReward;
