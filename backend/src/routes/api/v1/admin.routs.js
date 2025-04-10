const express = require("express");
const adminController = require("../../../controller/admin.controller");
const router = express.Router();

// Register new user
router.post('/register', adminController.register);

// Login user
router.post('/login', adminController.login);

// Refresh token
router.post('/token', adminController.refreshToken);

// Logout user
router.post('/logout', adminController.logout);

module.exports = router;
