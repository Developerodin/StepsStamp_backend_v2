import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema(
  {
    appLink: {
      type: String,
      required: true,
      trim: true,
    },
    updateAvailable: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Version = mongoose.model('Version', versionSchema);

export default Version;