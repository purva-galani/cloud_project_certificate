const express = require("express");
const userController = require("../../../controller/user.controller");
const router = express.Router();


router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/token', userController.refreshToken);
router.post('/logout', userController.logout);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);
router.get('/getusers', userController.getUsers);
router.delete('/deleteuser/:id', userController.deleteUser); 
router.put('/updateuser/:id', userController.updateUser); 
router.get('/getuser/:id', userController.getUserById);


module.exports = router;
