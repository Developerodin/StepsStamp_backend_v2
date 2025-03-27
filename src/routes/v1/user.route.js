import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as userValidation from '../../validations/user.validation.js';
import * as userController from '../../controllers/user.controller.js';
import { otpRateLimiter } from '../../middlewares/otpRateLimit.js';
import jwt from 'jsonwebtoken';
const router = express.Router();

const authMiddleware = (requiredRole = null) => async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
      }
  
      const token = authHeader.split(' ')[1];
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Attach user data to request
      req.userId = decoded.userId;
      req.email = decoded.email;
      req.role = decoded.role;  // Attach role
  
      // Check for admin access if required
      if (requiredRole && req.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }
  
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired, please login again' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


/*********************/
/*Mobile app Routes*/
/*******************/

router.post('/check-email',validate(userValidation.checkEmail), userController.checkEmail);
router.post('/check-username',validate(userValidation.checkUsername), userController.checkUsername);

router.post('/verify-otp',validate(userValidation.verifyOtp), userController.verifyOtpController);
router.post('/register', validate(userValidation.register), userController.registerUser);
router.post('/login', validate(userValidation.login), userController.loginUser);

router.get('/all-users', userController.getAllUsers);

router.get('/get-user/:userId',authMiddleware(),validate(userValidation.getUser) ,userController.getUser);

router.get('/active-blockchain/:userId',authMiddleware(),validate(userValidation.getUser) ,userController.getActiveBlockchain);

router.post('/activate-blockchain',authMiddleware(),validate(userValidation.activateBlockchain) ,userController.activateBlockchain);


//deletes all data
router.post('/test', userController.test);

router.patch('/update-profile',authMiddleware(),validate(userValidation.updateUser),userController.updateUser);
router.patch('/update-user-wallet',authMiddleware(),validate(userValidation.updateUserWallet),userController.updateUserWallet);
router.post('/forgot-password' ,validate(userValidation.checkEmail), userController.forgotPassword);
router.post('/verify-reset-otp' ,validate(userValidation.verifyResetOtp), userController.verifyResetOtpController);

router.post('/reset-password', validate(userValidation.resetPassword), userController.resetUserPassword);

router.post('/delete-account',authMiddleware(), validate(userValidation.deleteAccount), userController.deleteAccount);


/**
 * @route GET /users/followers/:userId
 * @desc Fetch users who signed up using the given user's referral code
 * @access Public
 */
router.get('/followers/:userId', validate(userValidation.getFollowers), userController.getFollowers);

//get user by refferal code
router.get('/user-by-refferal-code/:refferalCode',authMiddleware(), validate(userValidation.refCode), userController.getUserByRefferalCode);

//get watches by userID
router.get('/watches/:decentralizedWalletAddress',authMiddleware(), validate(userValidation.getWatches), userController.getWatchesByUserId);


export default router;
