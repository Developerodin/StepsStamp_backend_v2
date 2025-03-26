import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import transactionService from '../services/transaction.service.js';
import { distributeBonusForAllNFTs, distribute50kDailyRewards } from '../services/cronJobs/50kDistributation.service.js';

const getAllTransactions = catchAsync(async (req, res) => {
  const transactions = await transactionService.getAllTransactions();
  res.status(httpStatus.OK).json({ success: true, data: transactions });
});

const getTransactionsByUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const transactions = await transactionService.getTransactionsByUser(userId);
  res.status(httpStatus.OK).json({ success: true, data: transactions });
});

const getTransactionsByUserAndType = catchAsync(async (req, res) => {
  const { userId, transactionType } = req.params;
  const transactions = await transactionService.fetchTransactionsByUserAndType(userId, transactionType);
  res.status(httpStatus.OK).json({ success: true, data: transactions });
});

const distribute30day = catchAsync(async (req, res) => {
  const x = distributeBonusForAllNFTs();
  res.status(httpStatus.OK).json({ success: true, data: x });
})

const distribute50k = catchAsync(async (req, res) => {
 const x = distribute50kDailyRewards();
  res.status(httpStatus.OK).json({ success: true, data: x });
})




export default {
  getAllTransactions,
  getTransactionsByUser,
  getTransactionsByUserAndType,
  distribute30day,
  distribute50k
};
