const pool = require('../config/db'); 

class Chat {
    static async findByChatId(chatId) {
      const [rows] = await pool.query(
        'SELECT * FROM chat_history WHERE chat_id = ? ORDER BY created_at',
        [chatId]
      );
      return rows;
    }
  
    static async saveMessage({ chatId, userMessage, botResponse }) {
      const [result] = await pool.query(
        'INSERT INTO chat_history (chat_id, user_message, bot_response) VALUES (?, ?, ?)',
        [chatId, userMessage, botResponse]
      );
      return result;
    }
  
    static async deleteChat(chatId) {
      const [result] = await pool.query(
        'DELETE FROM chat_history WHERE chat_id = ?',
        [chatId]
      );
      return result.affectedRows;
    }
  }
  
  module.exports = Chat;