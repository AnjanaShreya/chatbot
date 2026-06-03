const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const geminiRoutes = require('./routes/geminiRoutes');
const prisma = require('./config/db');
require('dotenv').config();
console.log("Gemini key loaded:", !!process.env.GEMINI_API_KEY);

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat-history', chatRoutes);
app.use('/api', geminiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something broke!', 
    error: err.message, 
    stack: err.stack 
  });
});

const initializeDb = async () => {
  try {
    await prisma.$connect();
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        await prisma.$executeRawUnsafe(statement);
      }
      console.log('Database tables initialized/verified successfully');
    } else {
      console.warn('schema.sql not found at', schemaPath);
    }
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
  }
};

const PORT = process.env.PORT || 5000;
let server;

if (!process.env.VERCEL) {
  const startServer = async () => {
    await initializeDb();
    server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  };
  startServer();
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

module.exports = app;