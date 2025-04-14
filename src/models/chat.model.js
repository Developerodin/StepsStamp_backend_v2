import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    sender: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'sender.type', // Dynamically reference 'User' or 'Admin'
        required: true,
      },
      type: {
        type: String,
        enum: ['User', 'Admin'], // Specify whether the sender is a User or Admin
        required: true,
      },
    },
    receiver: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'receiver.type', // Dynamically reference 'User' or 'Admin'
        required: true,
      },
      type: {
        type: String,
        enum: ['User', 'Admin'], // Specify whether the receiver is a User or Admin
        required: true,
      },
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;