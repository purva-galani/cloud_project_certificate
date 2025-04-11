const jwt = require('jsonwebtoken');
const Admin = require('../model/admin.model');
const User = require('../model/user.model');

const authenticate = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "randome#certificate"
    );

    const role = decoded.role || 'user'; // default to user if not present

    // Choose the correct model *after* decoding the token
    const Model = role === 'admin' ? Admin : User;

    const user = await Model.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found or token revoked' });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = authenticate;
