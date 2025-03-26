import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { validateDiscount, applyDiscount } from '../services/discount.service.js';

const checkDiscount = catchAsync(async (req, res) => {
  const { code } = req.body;
  const discount = await validateDiscount(code);
  res.status(httpStatus.OK).json({ valid: true, discount });
});

const applyDiscountCode = catchAsync(async (req, res) => {
  const { code, totalAmount } = req.body;
  const { discountedAmount, discount } = await applyDiscount(code, totalAmount);
  res.status(httpStatus.OK).json({ discountedAmount, discount });
});

export { checkDiscount, applyDiscountCode };
