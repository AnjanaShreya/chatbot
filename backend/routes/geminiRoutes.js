const express = require('express');
const router = express.Router();
const GeminiController = require('../controllers/geminiController');
const authMiddleware = require('../middleware/auth');

router.post('/generate-response', authMiddleware, GeminiController.generateResponse);

module.exports = router;