import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin.js';
import paginate from './plugins/paginate.plugin.js';

const miningSchema = new mongoose.Schema(
  {
    freeMining: {
      type: Boolean,
      required: true,
      default: false,
    },
    blockchainMining: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

miningSchema.plugin(toJSON);
miningSchema.plugin(paginate);

const Mining = mongoose.model('Mining', miningSchema);
export default Mining;