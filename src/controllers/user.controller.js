import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';
import { sendOtp,sendOtp2, verifyOtp, verifyResetOtp, loginUserWithEmailAndPassword, loginUserWithGoogle, getUserByEmail } from '../services/auth.service.js';


import { createUser, completeRegistration, deleteUser, 
  activateBlockchainService, getFollowersService, getUserByReferredby, 
  getAllUsersService, resetPassword, getUserByUsername, 
  userByRefferalCode, updateUserById, getUserById, getUsersBlockchain, getUserWatches } from '../services/user.service.js';
import { OAuth2Client } from 'google-auth-library';
import Notifications from '../models/notifications.model.js';



import mongoose from 'mongoose';
import User from '../models/user.model.js';


// Google OAuth Client (Replace with your Google Client ID)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Google Login
 */
const googleLogin = catchAsync(async (req, res) => {
  const { googleToken } = req.body;

  if (!googleToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Google token is required');
  }

  // Verify Google Token
  const ticket = await client.verifyIdToken({
    idToken: googleToken,
    audience: process.env.GOOGLE_CLIENT_ID, // Ensure it's the right client ID
  });

  const { email, name, sub: googleId } = ticket.getPayload(); // Extract user details

  console.log(`✅ Google login verified for: ${email}`);

  // Check if user exists
  let userData = await getUserByEmail(email);

  if (!userData) {
    console.log('👤 New user detected, creating...');
    userData = await createUser({
      email,
      name,
      isEmailVerified: true, // No OTP needed
      registeredVia: 'google',
    });

    return res.status(httpStatus.OK).json({
      newUser: true,
      message: 'Redirecting to registration page',
      userData,
    });
  }

  // If user exists, log them in
  console.log('✅ Existing user, logging in...');
 
  const { user, token } = await loginUserWithGoogle(email);

  res.status(httpStatus.OK).json({ message: 'Login successful', user, token });
 
  
});



/**
 * Step 1: Check if email exists
 */
const checkEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await getUserByEmail(email);
   
  if (user) {
    let partial = (user.name && user.password ) ? false : true ;
    if(partial){
      await sendOtp(email);
      res.status(httpStatus.OK).send({ exists: true, partial:partial, message: 'old user, with partial info, Redirecting to OTP verification.' });
    }
    // If user exists, send them to login
    res.status(httpStatus.OK).send({ exists: true, partial:partial, message: 'User exists. Redirecting to login.' });
  } else {
    // If user is new, proceed to OTP verification
    await sendOtp(email);
    res.status(httpStatus.OK).send({ exists: false, message: 'New user. Redirecting to OTP verification.' });
  }
});



const checkUsername = catchAsync(async (req, res) => {
  const { username } = req.body;
  const user = await getUserByUsername(username);
   
  if (user) {
    res.status(httpStatus.OK).send({ exists: true, message: 'User exists' });
  } else {
    res.status(httpStatus.OK).send({ exists: false, message: 'User does not exists'});
  }
});

/**get watches by user id***/

const getWatchesByUserId = catchAsync(async (req, res) => {
  const { decentralizedWalletAddress } = req.params;
  const watches = await getUserWatches(decentralizedWalletAddress);
   
  if (watches) {
    res.status(httpStatus.OK).send({ exists: true, message: 'watches exists', watches });
  } else {
    res.status(httpStatus.OK).send({ exists: false, message: 'watches does not exists'});
  }
})

/***Forgot password */
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const  user  = await getUserByEmail(email);
  
  console.log(user);

  if (user) {
   
    // If user exists, send them to login
    await sendOtp2(email);
    res.status(httpStatus.OK).send({ exists: true, message: 'User exists. OTP to reset pass sent to registered email.', data:user });
  } else {
    // If no email id, register first
    res.status(httpStatus.OK).send({ exists: false, message: 'This email is not registered with us.' });
  }
});

/**
 * Verify OTP
 */
const verifyOtpController = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const { user, isNewUser } = await verifyOtp(email, otp);
  let newUser = user;
  if(isNewUser){
     newUser = await createUser({
      "email":email,
      "isEmailVerified":"true",
      "role":"user",
      "registeredVia":"email"
    });
  }

  res.status(httpStatus.OK).json({ message: 'OTP verified successfully, email saved', data: newUser });
});

/*** verify reset OTP */
const verifyResetOtpController = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const { user } = await verifyResetOtp(email, otp);
  let newUser = user;
  
  res.status(httpStatus.OK).json({ message: 'OTP verified successfully, email saved', data: newUser });
});

/**
 * Register a user
 */
const registerUser = catchAsync(async (req, res) => {
  
  const { username, email, password, dateOfBirth } = req.body;

  // **Check if username is unique**
  const existingUser = await getUserByUsername( req.body.username );
  if (existingUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }

  // **Check age validation**
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

  const user = await completeRegistration(req.body);
  await Notifications.create({
    userId: user._id,
    emailNotification: false,
    earningNotification: false,
    poolNotification: false,
    achievementNotification: false,
    goalCompleteNotification: false,
  });

  let referredByUser = null;
  if (user.referredBy) {
    referredByUser = await getUserByReferredby(user.referredBy);
  }
  const regToken = jwt.sign({ userId: user._id, email: user.email,role:"user" }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.status(httpStatus.CREATED).json({
    user,
    regToken,
    referredBy: referredByUser ? {
      _id: referredByUser._id,
      name: referredByUser.name,
      email: referredByUser.email,
      referralCode: referredByUser.referralCode,
      decentralizedWalletAddress: referredByUser.decentralizedWalletAddress
    } : null,
  });
});

const test = catchAsync(async (req, res) => {
  const collections = Object.keys(mongoose.connection.collections);

  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    try {
      await collection.deleteMany({});
      console.log(`✅ Cleared collection: ${collectionName}`);
    } catch (error) {
      console.error(`❌ Failed to clear collection: ${collectionName}`, error);
    }
  }

  console.log("🚀 All collections flushed successfully!");
  res.status(httpStatus.OK).json({ message: 'All collections flushed successfully!' });
});

/**Reset password */
const resetUserPassword = catchAsync(async (req, res) => {
  const {userId, password} = req.body;
  const user = await resetPassword(userId, password);
  if(user){
    res.status(httpStatus.CREATED).json({message:"Password Reset Successful.", user });
  }
  
});


/**deleteAccount */
const deleteAccount = catchAsync(async (req, res) => {
  const {userId} = req.body;
  const response = await deleteUser(userId);
  
  if(response){
    res.status(200).json({ message: "User account and all related data deleted successfully" });
  }else{
    res.status(404).json({ message: "User not found" })
  }
  
});


/**
 * Login user
 */
const loginUser = catchAsync(async (req, res) => {
  console.log("🛠️ Login request received with data:", req.body);  // Debugging log

  const { email, password } = req.body;

  const { user, token } = await loginUserWithEmailAndPassword(email, password);

  res.status(httpStatus.OK).json({ message: 'Login successful', user, token });
});


const updateUser = catchAsync(async (req, res) => {
  const userId = req.body.userId;
  const updatedUser = await updateUserById(userId, req.body);
  
  res.status(httpStatus.OK).json({
    message: 'Profile updated successfully',
    user: updatedUser
  });
});


/***update user wallet */
const updateUserWallet = catchAsync(async (req, res) => {
  const userId = req.body.userId;

  const updated = await updateUserById(userId, req.body);
  
  res.status(httpStatus.OK).json({
    message: 'Wallet updated successfully',
    user: updated
  });
});

 const getAllUsers = catchAsync(async (req, res) => {
  const users = await getAllUsersService();
  res.status(httpStatus.OK).json({ users });
})


/**
 * Get all users referred by a specific user
 */
const getFollowers = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const followers = await getFollowersService(userId);
  res.status(httpStatus.OK).json({ success: true, data: followers });
});

const getUserByRefferalCode = catchAsync(async (req, res) => {
  const { refferalCode } = req.params;
  console.log(refferalCode);
  const user =  await userByRefferalCode(refferalCode);

  res.status(httpStatus.OK).json({ success: true, user });
})

const getActiveBlockchain = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const activeBlockchainId = await getUsersBlockchain(userId);
  if (activeBlockchainId) {
    res.status(httpStatus.OK).send({ exists: true, message: 'User exists', activeBlockchainId });
  } else {
    res.status(httpStatus.OK).send({ exists: false, message: 'User does not exists'});
  }
})
const getUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await getUserById(userId);
  if (user) {
    res.status(httpStatus.OK).send({ exists: true, message: 'User exists', user });
  } else {
    res.status(httpStatus.OK).send({ exists: false, message: 'User does not exists'});
  }
})

const activateBlockchain= catchAsync(async (req, res) => {
  const { userId, blockchainId, nftAddress } = req.body;
  const user = await activateBlockchainService(userId, blockchainId, nftAddress);
  if (user) {
    res.status(httpStatus.OK).send({ exists: true, message: 'User blockchain updated', user });
  } else {
    res.status(httpStatus.OK).send({ exists: false, message: 'User blockchain does not exists'});
  }
})

const toggleMiningStatus = async (req, res) => {
  try {
    const { userId, type, status } = req.body;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update Free Mining status
    if (type === 'free') {
      user.freeMiningActivate = status;

      // Set the date only when activating
      if (status === true) {
        user.freeMiningActivateDate = new Date();
      }
    }

    // Update Blockchain Mining status
    if (type === 'blockchain') {
      user.blockchainMiningActivate = status;

      // Set the date only when activating
      if (status === true) {
        user.blockchainMiningActivateDate = new Date();
      }
    }

    await user.save();
    res.status(200).json({ message: 'Mining status updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getMiningStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch only the mining-related fields
    const user = await User.findOne({ userId }).select(
      'freeMiningActivate freeMiningActivateDate blockchainMiningActivate blockchainMiningActivateDate'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const miningStatus = {
      freeMiningActivate: user.freeMiningActivate,
      freeMiningActivateDate: user.freeMiningActivateDate,
      blockchainMiningActivate: user.blockchainMiningActivate,
      blockchainMiningActivateDate: user.blockchainMiningActivateDate,
    };

    res.status(200).json(miningStatus);
  } catch (error) {
    console.error('Error fetching mining status:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export { verifyOtpController, getWatchesByUserId,
   activateBlockchain, getUserByRefferalCode, getActiveBlockchain, getUser, deleteAccount, checkUsername, getFollowers, getAllUsers, googleLogin, test, updateUserWallet, updateUser, verifyResetOtpController, resetUserPassword, forgotPassword, registerUser, loginUser, checkEmail
  ,toggleMiningStatus,getMiningStatus
  };
