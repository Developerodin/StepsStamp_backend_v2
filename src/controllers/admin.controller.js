import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import Admin from '../models/admin.model.js';
import User from '../models/user.model.js';
import Notifications from '../models/notifications.model.js';
import crypto from 'crypto';
import { distributeBonusForAllNFTs, distribute50kDailyRewards } from '../services/cronJobs/50kDistributation.service.js';

// Generate unique referral code
const generateReferralCode = async () => {
  let code;
  let exists;
  do {
    code = crypto.randomBytes(2).toString('hex').toUpperCase(); // Generates a 4-character alphanumeric code
    exists = await User.findOne({ referralCode: code });
  } while (exists);
  
  return code;
};

// Admin login
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  
  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  if (!admin.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Admin account is deactivated');
  }

  const isPasswordMatch = await bcrypt.compare(password, admin.password);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save();

  const token = jwt.sign(
    { adminId: admin._id, email: admin.email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(httpStatus.OK).json({
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin,
    },
    token,
  });
});

// Admin registration (only existing admins can create new admins)
const register = catchAsync(async (req, res) => {
  const { email, password, name } = req.body;

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await Admin.create({
    email,
    password: hashedPassword,
    name,
    isActive: true,
  });

  const token = jwt.sign(
    { adminId: admin._id, email: admin.email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(httpStatus.CREATED).json({
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      isActive: admin.isActive,
    },
    token,
  });
});

// Change password
const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const admin = await Admin.findById(req.adminId);

  const isPasswordMatch = await bcrypt.compare(oldPassword, admin.password);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect old password');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  admin.password = hashedPassword;
  await admin.save();

  res.status(httpStatus.OK).json({ message: 'Password changed successfully' });
});

// Get all users
const getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(httpStatus.OK).json(users);
});

// Get user details
const getUserDetails = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId).select('-password');
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).json(user);
});

// Update user
const updateUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  Object.assign(user, req.body);
  await user.save();

  res.status(httpStatus.OK).json(user);
});

// Delete user
const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  await user.remove();
  res.status(httpStatus.NO_CONTENT).send();
});

// Register user by admin
const registerUserByAdmin = catchAsync(async (req, res) => {
  const { name, email, password, username, dateOfBirth } = req.body;

  // Check if username is unique
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }

  // Check if email is unique
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // Check age validation
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (today.getMonth() < birthDate.getMonth() || 
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      age--;
  }

  if (age < 18) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You must be at least 18 years old to register.');
  }

  // Generate unique referral code
  const referralCode = await generateReferralCode();

  // Create user
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    username,
    dateOfBirth,
    isEmailVerified: true,
    role: 'user',
    referralCode,
  });

  // Create notifications settings
  await Notifications.create({
    userId: user._id,
    emailNotification: false,
    earningNotification: false,
    poolNotification: false,
    achievementNotification: false,
    goalCompleteNotification: false,
  });

  // Generate token
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(httpStatus.CREATED).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      dateOfBirth: user.dateOfBirth,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
      referralCode: user.referralCode,
    },
    token,
  });
});

// Trigger distribution functions
const triggerDistributions = catchAsync(async (req, res) => {
  try {
    await distribute50kDailyRewards();
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Distribution functions triggered successfully'
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
});

export {
  login,
  register,
  changePassword,
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  registerUserByAdmin,
  triggerDistributions,
}; 