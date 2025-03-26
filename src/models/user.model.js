import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import toJSON from './plugins/toJSON.plugin.js';
import paginate from './plugins/paginate.plugin.js';
import { roles } from '../config/roles.js';

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true,
      default: function () {
        return this._id.toString(); // Assigns `_id` as `userId`
      },
    },
    name: { type: String, trim: true },
    username: { type: String, trim: true, sparse: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      trim: true,
      minlength: 8,
      match: [/(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain at least one letter and one number'],
      private: true,
    },
    phoneNumber: { type: String, trim: true },
    profilePicture: { type: String, default: null },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
    country: { type: String, trim: true },
    timezone: { type: String, default: 'UTC' },
    height: { type: Number, default: null },
    dailyGoals: { type: Number, default: null },
    weight: { type: Number, default: null },
    BMI: { type: Number, default: null },
    totalSteps: { type: Number, default: 0 },
    role: { type: String, enum: roles, default: 'user' },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    watchOwner: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },
    dailyStreak: { type: Number, default: 0 },
    lastStreakUpdate: { type: Date, default: null },
    decentralizedWalletAddress: { type: String, trim: true, default: null },

    // Referral & Registration
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: null },
    registeredVia: { type: String, enum: ['email', 'google', 'facebook', 'metamask'], default: 'email' },
    loginVia: { type: String, enum: ['email', 'google', 'facebook', 'metamask'], default: 'email' },
    isTermAndConditionAccepted: { type: Boolean, default: true },

    // Blockchain-related fields
    blockchainIds: [
      {
          blockchainId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Blockchain',
              required: true,
              index: true,
          },
          tokenId: {
              type: String, // Store the token ID as a string (adjust if needed)
              required: true,
          },
      }
  ],
// Array to store multiple blockchains
  
    activeBlockchainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blockchain',
      default: null,
      index: true,
    }, // Currently active blockchain

    completedBlocks: {
      type: Number,
      default: 0,
    },

    // NFT details of active blockchain
    nftAddress: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ userId: 1 }, { unique: true });
userSchema.index({ activeBlockchainId: 1 });

// Add plugins for JSON conversion and pagination
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

const User = mongoose.model('User', userSchema);
export default User;
