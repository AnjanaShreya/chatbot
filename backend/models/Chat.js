const prisma = require('../config/db'); 

class Chat {
    static async findByChatId(chatId, userId = null) {
      const whereClause = { chatId: parseInt(chatId, 10) };
      if (userId !== null) {
        whereClause.userId = userId;
      }
      return await prisma.chatHistory.findMany({
        where: whereClause,
        orderBy: { createdAt: 'asc' }
      });
    }
  
    static async saveMessage({ chatId, userId, userMessage, botResponse }) {
      return await prisma.chatHistory.create({
        data: {
          chatId: parseInt(chatId, 10),
          userId: userId,
          userMessage: userMessage,
          botResponse: botResponse
        }
      });
    }
  
    static async deleteChat(chatId, userId) {
      const result = await prisma.chatHistory.deleteMany({
        where: { 
          chatId: parseInt(chatId, 10),
          userId: userId
        }
      });
      return result.count;
    }
  }
  
  module.exports = Chat;