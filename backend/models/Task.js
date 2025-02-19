const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    deadline: {
      type: Date,
    },
    priority: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    blockchainTaskHash: {
      type: String,
    },
    completedBy: {
      type: String,
      trim: true,
    },
    isVerifiedOnChain: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
