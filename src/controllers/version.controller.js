import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import Version from '../models/version.model.js';

// Create or update the version (for all users)
const createOrUpdateVersion = catchAsync(async (req, res) => {
  const { appLink, updateAvailable, version } = req.body;

  // Create or update the single global version document
  const updatedVersion = await Version.findOneAndUpdate(
    {}, // Empty filter to match the single global document
    { appLink, updateAvailable, version }, // Update fields
    { new: true, upsert: true, runValidators: true } // Create if not exists
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Version created/updated successfully',
    data: updatedVersion,
  });
});

// Get the version (for all users)
const getVersion = catchAsync(async (req, res) => {
  const version = await Version.findOne(); // Fetch the single global document

  if (!version) {
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'No version found. Please initialize the collection.',
      data: null,
    });
  }

  res.status(httpStatus.OK).json({
    success: true,
    data: version,
  });
});

const checkAppVersion = catchAsync(async (req, res) => {
    const { AppVersion } = req.body;
  
    // Fetch the single global version document
    const version = await Version.findOne();
  
    if (!version) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'No version found. Please initialize the collection.',
      });
    }
  
    // Compare AppVersion with the global version
    const isMatch = version.version === AppVersion;
  
    res.status(httpStatus.OK).json({
      success: true,
      isMatch,
      appLink: version.appLink,
      updateAvailable: version.updateAvailable,
      version: version.version,
      message: isMatch
        ? 'AppVersion matches the global version.'
        : 'AppVersion does not match the global version.',
    });
  });

export default {
  createOrUpdateVersion,
  getVersion,
    checkAppVersion
};