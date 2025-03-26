import Discount from '../models/discount.model.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

/**
 * Validate a discount code
 * @param {string} code - The discount code
 * @returns {Promise<Discount>}
 */
const validateDiscount = async (code) => {
  const discount = await Discount.findOne({ code });

  if (!discount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid discount code');
  }

  if (!discount.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This discount code is no longer active');
  }

  if (discount.expiryDate < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This discount code has expired');
  }

  if (discount.usedCount >= discount.usageLimit) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This discount code has reached its usage limit');
  }

  return discount;
};

/**
 * Apply a discount code
 * @param {string} code - The discount code
 * @param {number} totalAmount - The total amount before discount
 * @returns {Promise<{discountedAmount: number, discount: Discount}>}
 */
const applyDiscount = async (code, totalAmount) => {
  const discount = await validateDiscount(code);

  let discountedAmount = totalAmount;
  if (discount.type === 'percentage') {
    discountedAmount = totalAmount - (totalAmount * discount.amount) / 100;
  } else if (discount.type === 'fixed') {
    discountedAmount = totalAmount - discount.amount;
  }

  if (discountedAmount < 0) discountedAmount = 0; // Prevent negative amounts

  // Update discount usage
  await Discount.updateOne({ code }, { $inc: { usedCount: 1 } });

  return { discountedAmount, discount };
};

export { validateDiscount, applyDiscount };
