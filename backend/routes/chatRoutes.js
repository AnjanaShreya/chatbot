const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');
const authMiddleware = require('../middleware/auth');

router.get('/share/:chatId', ChatController.getSharedChatHistory);
router.get('/:chatId', authMiddleware, ChatController.getChatHistory);
router.post('/', authMiddleware, ChatController.saveChat);
router.delete('/:chatId', authMiddleware, ChatController.deleteChat);

module.exports = router;