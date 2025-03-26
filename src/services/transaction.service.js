import TransactionHistory from '../models/transactions.model.js';

/**
 * Save a new transaction
 * @param {Object} transactionData
 * @returns {Promise<TransactionHistory>}
 */
const saveTransaction = async (transactionData) => {
  return TransactionHistory.create(transactionData);
};

/**
 * Get transactions by userId
 * @param {String} userId
 * @param {Object} filters - Additional filters (e.g., type, status)
 * @returns {Promise<Array>}
 */
const getTransactionsByUser = async (userId, filters = {}) => {
  return TransactionHistory.find({ userId, ...filters }).sort({ timestamp: -1 });
};

/**
 * Get transaction by transactionId
 * @param {String} transactionId
 * @returns {Promise<TransactionHistory>}
 */
const getTransactionById = async (transactionId) => {
  return TransactionHistory.findById(transactionId);
};

/**
 * List all transactions (Admin usage)
 * @param {Object} filters - Filters like type, currency, status
 * @returns {Promise<Array>}
 */
const getAllTransactions = async (filters = {}) => {
  return TransactionHistory.find(filters).sort({ timestamp: -1 });
};

const fetchTransactionsByUserAndType = async (userId, transactionType) => {
  return await TransactionHistory.find({ userId, transactionType }).sort({ createdAt: -1 });
};

export default { saveTransaction, getTransactionsByUser, getTransactionById, getAllTransactions, fetchTransactionsByUserAndType };
