import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Otp from '../models/otp.model.js';
import Token from '../models/token.model.js'; 
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import { verifyToken, generateAuthTokens } from './token.service.js'; 
import { sendEmail } from './email.service.js'
import otpEmailTemplate from '../templates/otpEmailTemplate.js';
import forgotPassowrd from '../templates/forgotPassowrd.js'

/**Get user by email */
const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user || null;  // Explicitly return null if user is not found
  } catch (error) {
    console.error("❌ Error fetching user by email:", error);
    return null;
  }
};


/**
 * Login user with email and password
 */

const loginUserWithEmailAndPassword = async (email, password) => {
  console.log("🔍 Checking user login for:", email);  // Debugging log

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  console.log("✅ User found in DB:", user.email); // Debugging log
  console.log("🔍 Stored User Password Hash:", user.password);

  // Verify password
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  
  if (!isPasswordMatch) {
    console.log("❌ Password mismatch!");  // Debugging log
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  console.log("✅ Password matches. Generating JWT...");

  // Generate JWT token
  const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

  console.log("🔑 JWT Generated:", token);  // Debugging log

  return { user, token };
};


const loginUserWithGoogle = async(email) =>{
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }
    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log("🔑 JWT Generated:", token);  // Debugging log

    return { user, token };
}

/**
 * Generate and send OTP to email
 */
const sendOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  await Otp.create({ email, otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // OTP valid for 10 mins
   // ✅ Use the built-in email service to send the OTP
   const subject = `${otp} OTP For StepsStamp Mobile App Login`;
   const htmlContent = otpEmailTemplate(otp);
 
   await sendEmail(email, subject, htmlContent);
 
   return { message: 'OTP sent successfully' };
 
};


const sendOtp2 = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  await Otp.create({ email, otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // OTP valid for 10 mins
   // ✅ Use the built-in email service to send the OTP
   const subject = `${otp} OTP For StepsStamp Mobile App Password Reset`;
   const htmlContent = forgotPassowrd(otp);
 
   await sendEmail(email, subject, htmlContent);
 
   return { message: 'OTP sent successfully' };
 
};

/**
 * Verify OTP
 */
const verifyOtp = async (email, otp) => {
  const validOtp = await Otp.findOne({ email, otp, expiresAt: { $gt: Date.now() } });

  if (!validOtp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP');
  }

  await Otp.deleteMany({ email }); // Remove OTP from DB

  let user = await User.findOne({ email });

  if (user) {
    // If user exists, mark email as verified
    user.isEmailVerified = true;
    await user.save();
    return { user, isNewUser: false };
  } else {
    // If new user, return flag to proceed to registration
    return { user: { email }, isNewUser: true };
  }
};


/**
 * Verify Reset OTP
 */
const verifyResetOtp = async (email, otp) => {
  const validOtp = await Otp.findOne({ email, otp, expiresAt: { $gt: Date.now() } });

  if (!validOtp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP');
  }

  await Otp.deleteMany({ email }); // Remove OTP from DB

  let user = await User.findOne({ email });

  if (user) {
    return { user };
  } 
};


/**
 * Logout user by removing refresh token
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: 'refresh', blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Token not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh authentication tokens
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await verifyToken(refreshToken, 'refresh');
    const user = await User.findById(refreshTokenDoc.user);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
    }
    await refreshTokenDoc.remove();
    return generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 */
const resetPassword = async (email, newPassword) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  user.password = await bcrypt.hash(newPassword, 8);
  await user.save();
  return user;
};

/**
 * Verify email
 */
const verifyEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  user.isEmailVerified = true;
  await user.save();
  return user;
};

// ✅ Ensure everything is correctly exported
export { loginUserWithEmailAndPassword, sendOtp2, loginUserWithGoogle, verifyResetOtp, getUserByEmail, sendOtp, verifyOtp, logout, refreshAuth, resetPassword, verifyEmail };
