import mongoose from 'mongoose';

const watchTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    watchType: {
        type: String,
        enum: ['Silver', 'Gold', 'Green'], // Add more if needed
        required: true,
    },
    nftAddress: {
        type: String,
        required: true,
    },
    tokenId: {
        type: String,
        required: true,
        unique: true,
    },
    purchaseDate: {
        type: Date,
        default: Date.now,
    },
});

const WatchTransaction = mongoose.model('WatchTransaction', watchTransactionSchema);
export default WatchTransaction;
