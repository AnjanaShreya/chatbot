const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const cors = require('cors'); 
const app = express();
const port = 5000;

// Middleware
app.use(express.json()); // Parse incoming JSON data
app.use(cors()); // Enable CORS for all routes

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        
  password: 'roots',        
  database: 'chatbot2' 
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], async (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Database query error' });

      if (result.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into DB
      const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      db.query(insertUserQuery, [username, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Error inserting user into DB' });
        return res.json({ success: true, message: 'Registration successful' });
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    // Check if user exists in DB
    const findUserQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(findUserQuery, [username], async (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Database query error' });

      if (result.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid username or password' });
      }

      const user = result[0];

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid username or password' });
      }

      res.json({ success: true, message: 'Login successful' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
