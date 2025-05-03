const Chat = require('../models/Chat');

class ChatController {
  static async getChatHistory(req, res) {
    try {
      const { chatId } = req.params;
      const chatHistory = await Chat.findByChatId(chatId);
      res.status(200).json(chatHistory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
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
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async deleteChat(req, res) {
    try {
      const { chatId } = req.params;
      const affectedRows = await Chat.deleteChat(chatId);
      
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = ChatController;