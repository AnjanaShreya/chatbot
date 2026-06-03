const prisma = require('../config/db'); 

class Chat {
    static async findByChatId(chatId) {
      return await prisma.chatHistory.findMany({
        where: { chatId: parseInt(chatId, 10) },
        orderBy: { createdAt: 'asc' }
      });
    }
  
    static async saveMessage({ chatId, userMessage, botResponse }) {
      return await prisma.chatHistory.create({
        data: {
          chatId: parseInt(chatId, 10),
          userMessage: userMessage,
          botResponse: botResponse
        }
      });
    }
  
    static async deleteChat(chatId) {
      const result = await prisma.chatHistory.deleteMany({
        where: { chatId: parseInt(chatId, 10) }
      });
      return result.count;
    }
  }
  
  module.exports = Chat;