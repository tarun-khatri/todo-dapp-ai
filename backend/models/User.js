const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Optional nonce field for message signing challenge
    nonce: {
      type: Number,
      default: () => Math.floor(Math.random() * 10000),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
