const Chat = require('../models/Chat');

class ChatController {
  static async getChatHistory(req, res) {
    try {
      const { chatId } = req.params;
      const chatHistory = await Chat.findByChatId(chatId);
      res.status(200).json(chatHistory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
    }
  }

  static async getSharedChatHistory(req, res) {
    try {
      const { chatId } = req.params;
      const chatHistory = await Chat.findByChatId(chatId);
      res.status(200).json(chatHistory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
    }
  }

  static async saveChat(req, res) {
    try {
      const { chatId, userMessage, botResponse } = req.body;
      
      if (!chatId || (!userMessage && !botResponse)) {
        return res.status(400).json({ message: 'Invalid input data' });
      }

      await Chat.saveMessage({ chatId, userMessage, botResponse });
      res.status(200).json({ message: 'Chat saved successfully', chatId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
    }
  }

  static async deleteChat(req, res) {
    try {
      const { chatId } = req.params;
      await Chat.deleteChat(chatId);
      res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
    }
  }
}

module.exports = ChatController;