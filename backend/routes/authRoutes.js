// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Make sure these routes match what your frontend is calling
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);  // This should match your frontend call

module.exports = router;