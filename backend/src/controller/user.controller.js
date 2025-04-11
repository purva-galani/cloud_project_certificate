const bcrypt = require('bcryptjs');
const Admin = require('../model/admin.model');
const Users = require('../model/user.model');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

let loggedInUsersCount = 0;
const MAX_LOGINS = 10;


const register = async (req, res) => {
  try {
    const { name, email, password, contact } = req.body;

    const userCount = await Users.countDocuments();
    if (userCount >= MAX_LOGINS) {
      return res.status(403).json({ message: 'Registration limit reached. Please try again later.' });
    }

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Users({
      name,
      email,
      password: hashedPassword,
      contact,
    });

    await user.save();

    console.log('User registered:', user);
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: error.message });
  }
};


// Assuming you have the necessary imports
const getUsers = async (req, res) => {
  try {
    const users = await Users.find().select('-password -refreshToken'); // Exclude sensitive fields
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};



const getUserById = async (req, res) => {
  try {
    const user = await Users.findById(req.params.id).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};




// Delete user by ID
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAccount = await Users.findByIdAndDelete(id);

    if (!deletedAccount) {
      return res.status(404).json({
        success: false,
        message: "Account not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      data: deletedAccount
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if they exist in the request body
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.contact) user.contact = req.body.contact;
    if (req.body.password) user.password = req.body.password; // Only if you want to allow password updates

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact,
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const normalizedEmail = email.toLowerCase();
    const user = await Users.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Token generation with expiration
    const accessToken = jwt.sign(
      { userId: user._id , role: 'user' },
      process.env.JWT_SECRET || "randome#certificate",
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || "refresh#secret",
      { expiresIn: '7d' } // Refresh token expires in 7 days
    );

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Return tokens and user data (excluding sensitive info)
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "refresh#secret"
    );

    const user = await Users.findOne({
      _id: decoded.userId,
      refreshToken
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "randome#certificate",
      { expiresIn: '1h' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};
const logout = async (req, res) => {
  const { token } = req.body;

  const user = await Users.findOne({ refreshToken: token });
  if (!user) return res.sendStatus(404);

  user.refreshToken = null;
  await user.save();

  loggedInUsersCount--;

  res.sendStatus(204);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check both User and Admin collections
    const user = await Users.findOne({ email }) || await Admin.findOne({ email });

    if (user) {
      const token = createToken(user._id, { expiresIn: '1h' });
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000;
      await user.save();

      const resetLink = `http://localhost:3000/Resetpassword/${token}?email=${encodeURIComponent(user.email)}`;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Password Reset Request",
        html: generateResetEmailHtml(user.name, resetLink)
      });
    }

    // Return same response whether user exists or not (security best practice)
    res.json({
      success: true,
      message: "If an account exists with this email, you'll receive a password reset link."
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request"
    });
  }
};

// Helper function for email template
const generateResetEmailHtml = (name, resetLink) => {
  return `
    <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset Request</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                            background-color: #f9f9f9;
                        }
                        .email-container {
                            max-width: 600px;
                            margin: 20px auto;
                            padding: 25px;
                            background-color: #ffffff;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        }
                            .alert {
                                background-color: #e6f2ff;
                                color: #0056b3;
                                padding: 12px;
                                border-radius: 5px;
                                text-align: center;
                                font-weight: bold;
                                margin-bottom: 15px;
                                border: 1px solid #0056b3;
                            }
                        h4 {
                            color: #333;
                            font-size: 18px;
                            margin: 0 0 15px 0;
                        }
                        p {
                            font-size: 14px;
                            color: #555;
                            margin-bottom: 15px;
                            line-height: 1.5;
                        }
                        .footer {
                            margin-top: 20px;
                            font-size: 13px;
                            color: #777;
                        }
                        hr {
                            border: 0;
                            height: 1px;
                            background: #ddd;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="alert">🔑 Password Reset Request</div>
                        <h4>Hello ${name},</h4>
                        <hr> <!-- Visual separation -->
                        <p>We received a request to reset your password for your  account. If you made this request, you can reset your password by clicking the button below.</p>
                        
                        <p><strong>This link can be used only once and will expire in 1 hour.</strong></p>

                        <div >
                            <p><a href="${resetLink}"     
                            style =                         
                            "background-color: #0056b3;
                            color: white;
                            padding: 6px 20px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                            display: inline-block;">Reset Password</a></p>
                        </div>

                        <p>If you didn’t request this, ignore this email, and your account will remain secure.</p>
                        
                        <p>Need help? Contact us at <a href="mailto:support@crmteam.com">support@crmteam.com</a>.</p>

                        <div class="footer">
                            <p>Best regards,<br><strong>The CRM Team</strong></p>
                        </div>
                    </div>
                </body>
                </html>
  `;
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check both collections for the user
    let user = await Users.findById(decoded.id);
    if (!user) {
      user = await Admin.findById(decoded.id);
    }

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ 
      success: true, 
      message: "Password reset successfully", 
      email: user.email,
      userType: user instanceof Users ? 'user' : 'admin' // Indicate which type of user was reset
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getUsers,
  deleteUser,
  updateUser,
  getUserById,
  forgotPassword,
  resetPassword,
};