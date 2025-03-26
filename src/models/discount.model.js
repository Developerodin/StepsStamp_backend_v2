import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true, // Ensures coupon codes are unique
      trim: true,
      uppercase: true,
    },
    amount: {
      type: Number, // Discount value (can be a percentage or fixed amount)
      required: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'], // Discount type
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true, // Expiry date for coupon validity
    },
    usageLimit: {
      type: Number,
      default: 1, // Number of times a coupon can be used
    },
    usedCount: {
      type: Number,
      default: 0, // Number of times the coupon has been used
    },
    isActive: {
      type: Boolean,
      default: true, // Whether the coupon is active
    },
  },
  { timestamps: true }
);

const Discount = mongoose.model('Discount', discountSchema);

export default Discount;
