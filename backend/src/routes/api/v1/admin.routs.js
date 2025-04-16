const express = require("express");
const router = express.Router();
const adminController = require("../../../controller/admin.controller");

router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.post('/token', adminController.refreshToken);
router.post('/logout', adminController.logout);

module.exports = router;
