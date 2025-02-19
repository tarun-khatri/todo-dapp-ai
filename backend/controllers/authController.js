const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.login = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      user = await User.create({ walletAddress: walletAddress.toLowerCase() });
    }

    // Create a JWT token
    const token = jwt.sign(
      { walletAddress: user.walletAddress, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        walletAddress: user.walletAddress,
        id: user._id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
