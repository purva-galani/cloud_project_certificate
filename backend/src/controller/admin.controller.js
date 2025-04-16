const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../model/admin.model');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Users({
      name,
      email,
      password: hashedPassword,
    });
    await admin.save();
    console.log('Admin registered:', admin);
    res.status(201).json({ message: 'Admin registered successfully!' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt with email:', email);
  const JWT_SECRET = "randome#certificateadmin";
  try {
    const user = await Users.findOne({ email });
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log('User found:', user);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Incorrect password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log('User ID:', user._id);
    const accessToken = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Access token generated successfully!');
    const refreshToken = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('Refresh token generated successfully!');
    user.refreshToken = refreshToken;
    await user.save();
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);
  const user = await Users.findOne({ refreshToken: token });
  if (!user) return res.sendStatus(403);
  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ accessToken });
  });
};

exports.logout = async (req, res) => {
  const { token } = req.body;
  await Users.updateOne({ refreshToken: token }, { $set: { refreshToken: null } });
  res.sendStatus(204);
};
