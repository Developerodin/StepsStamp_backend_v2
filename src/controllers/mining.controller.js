import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import Mining from '../models/mining.model.js';

// Get global mining status
const getGlobalMiningStatus = catchAsync(async (req, res) => {
  const miningStatus = await Mining.findOne(); // Fetch the single global document

  if (!miningStatus) {
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'No mining status found. Please initialize the collection.',
      data: null,
    });
  }

  res.status(httpStatus.OK).json({ success: true, data: miningStatus });
});

// Update global mining status
const updateGlobalMiningStatus = catchAsync(async (req, res) => {
  const { freeMining, blockchainMining } = req.body;

 

  // Update or create the single global document
  const updatedMiningStatus = await Mining.findOneAndUpdate(
    {}, // Empty filter to match the single global document
    { freeMining, blockchainMining }, // Update fields
    { new: true, upsert: true } // Create the document if it doesn't exist
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Global mining status updated successfully',
    data: updatedMiningStatus,
  });
});

export default {
  getGlobalMiningStatus,
  updateGlobalMiningStatus,
};