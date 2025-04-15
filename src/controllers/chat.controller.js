import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import Chat from '../models/chat.model.js';
import mongoose from 'mongoose';
import Admin from '../models/admin.model.js';

// Send a message
const sendMessage = catchAsync(async (req, res) => {
  let { senderId, senderType, receiverId, receiverType, message } = req.body;

  // If receiver is admin, get admin ID from Admin model
  if (receiverType === 'Admin') {
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Admin not found'
      });
    }
    receiverId = admin._id;
  }

  // If sender is admin, get admin ID from Admin model
  if (senderType === 'Admin') {
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Admin not found'
      });
    }
    senderId = admin._id;
  }

  const newMessage = await Chat.create({
    sender: { id: senderId, type: senderType },
    receiver: { id: receiverId, type: receiverType },
    message,
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Message sent successfully',
    data: newMessage,
  });
});

// Get chat history between a user and admin
const getChatHistory = catchAsync(async (req, res) => {
  const { userId } = req.body;

  // Get the admin ID from Admin model
  const admin = await Admin.findOne();
  if (!admin) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: 'Admin not found'
    });
  }

  // Ensure userId is provided
  if (!userId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'userId is required to fetch chat history.',
    });
  }

  // Ensure ID is ObjectId type
  const userObjectId = mongoose.Types.ObjectId(userId);
  const adminObjectId = admin._id;

  // Fetch chat messages where the admin is either the sender or receiver
  const chatHistory = await Chat.find({
    $or: [
      { 'sender.id': userObjectId, 'receiver.id': adminObjectId }, // User sent a message to admin
      { 'sender.id': adminObjectId, 'receiver.id': userObjectId }, // Admin sent a message to user
    ],
  })
    .sort({ createdAt: 1 }) // Sort messages by creation time (oldest first)
    .populate('sender.id', 'name email') // Populate sender details
    .populate('receiver.id', 'name email'); // Populate receiver details

  res.status(httpStatus.OK).json({
    success: true,
    data: chatHistory,
  });
});

// Receive messages for a specific user or admin
const receiveMessages = catchAsync(async (req, res) => {
  const { receiverId, receiverType } = req.params;

  // Fetch all messages where the receiver matches the given ID and type
  const messages = await Chat.find({
    'receiver.id': receiverId,
    'receiver.type': receiverType,
  })
    .sort({ createdAt: 1 }) // Sort messages by creation time
    .lean(); // Convert Mongoose documents to plain JavaScript objects

  // Dynamically populate sender and receiver details
  const populatedMessages = await Promise.all(
    messages.map(async (message) => {
      // Populate sender details
      if (message.sender.type === 'User') {
        message.sender.details = await mongoose.model('User').findById(message.sender.id).select('name email').lean();
      } else if (message.sender.type === 'Admin') {
        message.sender.details = await mongoose.model('Admin').findById(message.sender.id).select('name email').lean();
      }

      // Populate receiver details
      if (message.receiver.type === 'User') {
        message.receiver.details = await mongoose.model('User').findById(message.receiver.id).select('name email').lean();
      } else if (message.receiver.type === 'Admin') {
        message.receiver.details = await mongoose.model('Admin').findById(message.receiver.id).select('name email').lean();
      }

      return message;
    })
  );

  res.status(httpStatus.OK).json({
    success: true,
    data: populatedMessages,
  });
});

// Delete a specific message
const deleteMessage = catchAsync(async (req, res) => {
  const { messageId } = req.params;

  const deletedMessage = await Chat.findByIdAndDelete(messageId);

  if (!deletedMessage) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: 'Message not found',
    });
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Message deleted successfully',
  });
});

// Get all users who have initiated chats with admin
const getUsersWithChats = catchAsync(async (req, res) => {
  // Find all unique user IDs who have sent messages to admin
  const usersWithChats = await Chat.aggregate([
    {
      $match: {
        'sender.type': 'User',
        'receiver.type': 'Admin'
      }
    },
    {
      $group: {
        _id: '$sender.id',
        lastMessage: { $last: '$message' },
        lastMessageTime: { $last: '$createdAt' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: '$userDetails'
    },
    {
      $project: {
        userId: '$_id',
        name: '$userDetails.name',
        email: '$userDetails.email',
        lastMessage: 1,
        lastMessageTime: 1
      }
    },
    {
      $sort: { lastMessageTime: -1 }
    }
  ]);

  res.status(httpStatus.OK).json({
    success: true,
    data: usersWithChats
  });
});

export default {
  sendMessage,
  getChatHistory,
  receiveMessages,
  deleteMessage,
  getUsersWithChats
};