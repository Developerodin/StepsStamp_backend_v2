import Joi from 'joi';
import User from '../models/user.model.js';

const checkEmail = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const refCode = {
  params: Joi.object().keys({
    refferalCode: Joi.string().required(),
  }),
};

const checkUsername = {
  body: Joi.object().keys({
    username: Joi.string().required(),
  }),
};

const getFollowers = {
  params: Joi.object().keys({
    userId: Joi.string().required().length(24).message('Invalid User ID'),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().required().length(24).message('Invalid User ID'),
  }),
};

const deleteAccount = {
  body: Joi.object().keys({
    userId: Joi.string().required().length(24).message('Invalid User ID'),
  }),
};


const googleLogin = {
  body: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const updateUser = {
  body: Joi.object().keys({
    name: Joi.string().trim().optional(),
    userId:Joi.string().trim().required(),
    username: Joi.string().alphanum().min(3).max(20).optional(),
    height: Joi.number().integer().min(50).max(250).optional(),
    weight: Joi.number().integer().min(20).max(300).optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
    profilePicture: Joi.string().uri().optional(),
    dailyGoals: Joi.number().integer().optional()
  }),
};

const updateUserWallet = {
  body: Joi.object().keys({
    decentralizedWalletAddress: Joi.string().required(),
    userId: Joi.string().required(),
  }),
};

const activateBlockchain = {
  body: Joi.object().keys({
    blockchainId: Joi.string().required(),
    nftAddress: Joi.string().required(),
    userId: Joi.string().required(),
  }),
};




const sendOtp = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const verifyOtp = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  }),
};

/**Password reset OTP verification */

const verifyResetOtp = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    userId: Joi.string().required(),
    otp: Joi.string().length(6).required(),
  }),
};


const resetPassword = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    password: Joi.string().min(8).required()
  }),
};


// Function to calculate age
const isAbove18 = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  return age >= 18;
};

const register = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    username: Joi.string()
    .min(3)
    .max(30)
    .required()
    .external(async (value) => {
        // Check if username is already taken
        const existingUser = await User.findOne({ username: value });
        if (existingUser) {
            throw new Joi.ValidationError('Username already taken');
        }
        return value;
    }),
    phoneNumber: Joi.string(),
    password: Joi.string().min(8).required(),
    userId:Joi.string().min(4).required(),
    dateOfBirth: Joi.date().min('1-1-1940').required().custom((value, helpers) => {
      if (!isAbove18(value)) {
          return helpers.message('You must be at least 18 years old to register.');
      }
      return value;
     }),
    referredBy:Joi.string().optional().allow(''),
    decentralizedWalletAddress: Joi.string().optional().allow('')

  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const getWatches = {
  params: Joi.object().keys({
    decentralizedWalletAddress: Joi.string().required(),
  })
}
export { sendOtp, verifyOtp, getWatches,
  getUser,deleteAccount, checkUsername, 
  getFollowers, googleLogin, updateUserWallet, updateUser, resetPassword, 
  verifyResetOtp, checkEmail, register, login, activateBlockchain };
