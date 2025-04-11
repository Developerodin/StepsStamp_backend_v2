import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import Admin from '../models/admin.model.js';
import User from '../models/user.model.js';

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

export {
  login,
  register,
  changePassword,
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
}; 