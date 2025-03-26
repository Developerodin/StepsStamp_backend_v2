import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { createUser, getUserByReferredby } from '../services/user.service.js';
import { generateAuthTokens, generateResetPasswordToken, generateVerifyEmailToken } from '../services/token.service.js';
import { sendResetPasswordEmail, sendVerificationEmail } from '../services/email.service.js';

import { 
  loginUserWithEmailAndPassword, 
  sendOtp, 
  verifyOtp, 
  logout, 
  refreshAuth, 
  resetPassword, 
  verifyEmail 
} from '../services/auth.service.js';


const register = catchAsync(async (req, res) => {
  const user = await createUser(req.body);
  const tokens = await generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await loginUserWithEmailAndPassword(email, password);
  const tokens = await generateAuthTokens(user);
  res.send({ user, tokens });
});

const logoutUser = catchAsync(async (req, res) => {
  await logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await generateResetPasswordToken(req.body.email);
  await sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPasswordHandler = catchAsync(async (req, res) => {
  await resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmailHandler = catchAsync(async (req, res) => {
  const verifyEmailToken = await generateVerifyEmailToken(req.user);
  await sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmailHandler = catchAsync(async (req, res) => {
  await verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const getWalletByRefId = catchAsync(async (req, res) => {
  const user = await getUserByReferredby(req.query.referredBy);

  res.send({ user });
});


export {
  register,
  login,
  logoutUser as logout,
  refreshTokens,
  forgotPassword,
  resetPasswordHandler as resetPassword,
  sendVerificationEmailHandler as sendVerificationEmail,
  verifyEmailHandler as verifyEmail,
  getWalletByRefId
};
