const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost', // Replace with your MySQL host
  user: 'root',      // Replace with your MySQL user
  password: 'roots',      // Replace with your MySQL password
  database: 'chatbot2'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('MySQL connected');
});

// Save chat endpoint
app.post('/api/save-chat', (req, res) => {
    const { chatId, userMessage, botResponse } = req.body;
  
    if (!chatId || (!userMessage && !botResponse)) {
      return res.status(400).json({ message: 'Invalid input data' });
    }
  
    const query = 'INSERT INTO chat_history (chat_id, user_message, bot_response) VALUES (?, ?, ?)';
    db.query(query, [chatId, userMessage, botResponse], (err, result) => {
      if (err) {
        console.error('Error inserting into MySQL:', err);
        return res.status(500).json({ message: 'Database error' });
      }
  
      res.status(200).json({ message: 'Chat saved successfully', chatId });
    });
  });

// Endpoint to fetch chat history for a specific chat ID
app.get('/api/chat-history/:chatId', (req, res) => {
    const { chatId } = req.params;
  
    const query = 'SELECT * FROM chat_history WHERE chat_id = ? ORDER BY created_at';
    db.query(query, [chatId], (err, results) => {
      if (err) {
        console.error('Error fetching from MySQL:', err);
        return res.status(500).json({ message: 'Database error' });
      }
  
      res.status(200).json(results);
    });
  });

  
  // DELETE chat by chat_id
app.delete('/api/chats/:chatId', (req, res) => {
    const { chatId } = req.params;
    
    const deleteQuery = 'DELETE FROM chat_history WHERE chat_id = ?';
  
    db.query(deleteQuery, [chatId], (err, result) => {
      if (err) {
        console.error('Error deleting chat:', err);
        return res.status(500).json({ message: 'Database error' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Chat not found' });
      }
  
      res.status(200).json({ message: 'Chat deleted successfully' });
    });
  });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
