const bcrypt = require('bcryptjs');
const Users = require('../model/admin.model');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Check if the email already exists
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new admin (user)
      const admin = new Users({
        name,
        email,
        password: hashedPassword,
      });
  
      // Save the admin to the database
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
  
    // Secret for JWT signing
    const JWT_SECRET = "randome#certificateadmin";
  
    try {
      // Find the user by email
      const user = await Users.findOne({ email });
  
      // If user not found, return error
      if (!user) {
        console.log('No user found with email:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      console.log('User found:', user);
  
      // Compare provided password with stored hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log('Incorrect password for user:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // If user is found and password is valid, proceed with token generation
      console.log('User ID:', user._id);
  
      // Generate Access Token (1 hour expiration)
      const accessToken = jwt.sign(
        { userId: user._id },
        JWT_SECRET, // Secret key used to sign the JWT
        { expiresIn: '1h' } // Expiration time for the access token
      );
      console.log('Access token generated successfully!');
  
      // Generate Refresh Token (7 days expiration)
      const refreshToken = jwt.sign(
        { userId: user._id },
        JWT_SECRET, // Secret key used to sign the JWT
        { expiresIn: '7d' } // Expiration time for the refresh token
      );
      console.log('Refresh token generated successfully!');
  
      // Save the refresh token in the user document
      user.refreshToken = refreshToken;
      await user.save();
  
      // Send the access token and refresh token as a response
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
