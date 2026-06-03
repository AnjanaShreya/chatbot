// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

const authMiddleware = require('../middleware/auth');

// Make sure these routes match what your frontend is calling
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);  // This should match your frontend call
router.post('/update-password', authMiddleware, AuthController.updatePassword);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;