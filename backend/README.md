# Trustworthy AI Chatbot - Backend Server

This is the backend REST API server powering the **Trustworthy AI Chatbot** application. It handles user management, Prisma database connections to Neon PostgreSQL, chat logging, public page sharing, and direct integrations with the Google Gemini AI generation engine.

## Tech Stack

* **Runtime**: Node.js (v26+)
* **Server Framework**: Express.js
* **Database client**: Prisma ORM (connecting to Neon Serverless PostgreSQL)
* **Encryption**: Bcrypt.js — hashes user passwords before database storage.
* **Authentication**: JWT (JSON Web Tokens) — verifies user access tokens for secure endpoints.
* **Mailing Client**: Nodemailer — manages password reset invitation cards (Yahoo Mail SMTP + dynamic Ethereal test inbox fallback).
* **AI engine**: Google Gen AI SDK (`@google/genai`) — processes chats with `gemini-2.5-flash` and `gemini-2.0-flash`.

---

## Folder Structure

```
backend/
├── config/
│   ├── db.js                 # Prisma client instance exports
│   └── gemini.js             # GoogleGenAI client setup
├── controllers/
│   ├── authController.js     # Signup, Signin, Password Update/Reset
│   ├── ChatController.js     # Loading, saving, and deleting chats
│   └── geminiController.js   # Gemini 2.5 context processing & fallback
├── middleware/
│   └── auth.js               # JWT verification router middleware
├── models/
│   ├── Chat.js               # Prisma database layer CRUD for chats
│   └── User.js               # Prisma database layer CRUD for users
├── prisma/
│   ├── schema.prisma         # Postgres model schemas definitions
│   └── dev.db (Optional)
├── routes/
│   ├── authRoutes.js         # /api/auth routing declarations
│   ├── chatRoutes.js         # /api/chat-history routing declarations
│   └── geminiRoutes.js       # /api/generate-response routing declarations
├── .env                      # Database, Server and API keys configuration
├── package.json              # Backend script dependencies declarations
└── server.js                 # Server listener entry and DB handshake check
```

---

## Detailed REST API Endpoints

### 1. Authentication (`/api/auth`)
* `POST /register`: Creates a new account. Ensures that both the **email** and **username** are unique in the database. Hashes the password and returns a JWT token.
* `POST /login`: Validates the username/email and password credentials. Returns user profile details and a JWT token.
* `POST /update-password` (Secure): Changes the password for the currently logged-in user. Requires validating their current password.
* `POST /forgot-password`: Looks up the email. If registered, signs a 15-minute JWT, sends the reset link using the configured transport, and logs the link to the terminal.
* `POST /reset-password`: Decodes the token, extracts the email, verifies the user in the database, hashes the new password, and saves it.

### 2. Chat History Management (`/api/chat-history`)
* `GET /:chatId` (Secure): Loads the full message logs matching the selected chat ID.
* `POST /` (Secure): Creates or logs a user message and the bot's response in the history table.
* `DELETE /:chatId` (Secure): Deletes the chat history matching the ID. Handles empty state responses gracefully.
* `GET /share/:chatId`: A public, read-only endpoint returning message logs so unregistered users can view a shared chat page.

### 3. Gemini Response Processing (`/api/generate-response`)
* `POST /` (Secure): Receives the prompt message and chat history.
  - Slices the payload to the last 10 messages to limit token usage.
  - Cleans the history by removing connection error messages.
  - Submits to **`gemini-2.5-flash`**. If the model responds with an error or is blocked, falls back automatically to **`gemini-2.0-flash`**.

---

## Database Schema (Prisma)

```prisma
model User {
  id          Int      @id @default(autoincrement())
  username    String   @unique @db.VarChar(255)
  email       String   @unique @db.VarChar(255)
  password    String   @db.VarChar(255)
  createdAt   DateTime @default(now()) @db.Timestamptz @map("created_at")

  @@map("users")
}

model ChatHistory {
  id            Int      @id @default(autoincrement())
  chatId        Int      @map("chat_id")
  userMessage   String?  @map("user_message")
  botResponse   String?  @map("bot_response")
  createdAt     DateTime @default(now()) @db.Timestamptz @map("created_at")

  @@map("chat_history")
}
```

---

## Configuration & Environment Setup

Create a `.env` file in the root of the `backend/` directory:
```ini
# Neon Database Connection String
DATABASE_URL="postgresql://username:password@pooler-address/neondb?sslmode=require"

# Server Port configuration
PORT=5000

# JSON Web Token Secret
JWT_SECRET=your-secure-jwt-secret-key

# Google AI Studio Gemini API Key
GEMINI_API_KEY=your-gemini-studio-api-key

# Yahoo SMTP Mail Server Configuration (Optional - falling back to Ethereal otherwise)
YAHOO_EMAIL=your-yahoo-account@yahoo.com
YAHOO_APP_PASSWORD=your-yahoo-smtp-app-password
```

---

## Running the Server

1. **Install Packages**:
   ```bash
   npm install
   ```
2. **Apply Database Migrations (Prisma)**:
   ```bash
   npx prisma db push
   ```
3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:5000`.
