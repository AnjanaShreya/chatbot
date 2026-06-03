# Trustworthy AI Chatbot - Frontend App

This is the frontend React client for the **Trustworthy AI Chatbot** platform. It provides a premium, responsive Dashboard interface styled in modern, minimalist aesthetics resembling state-of-the-art SaaS applications.

## Tech Stack

* **Core Framework**: React (v18+)
* **Routing**: React Router DOM (v6+) — manages routes for Auth, Dashboard, Password Resetting, and Shared Views.
* **HTTP Client**: Axios — for communications with the Node.js API server.
* **Icons**: React Icons (`fa` suite) for vector status symbols.
* **Styling**: Pure Vanilla CSS (Curated HSL palettes, smooth sliding animations, glassmorphism, responsive grid/flex systems).

---

## Folder Structure

```
frontend/
├── public/                 # Static assets & HTML entry
└── src/
    ├── components/
    │   ├── Chatbot.js      # Main chat canvas, messages, speech API, emojis
    │   ├── chatbot.css     # Bubble layouts, prompt bars, Voice UI
    │   ├── Dashboard.js    # Parent component wrapper
    │   ├── LoginRegister.js# Sliding auth panel, forgot password modal
    │   ├── LoginRegister.css# Double-slide animation grid, badges
    │   ├── Navbar.js       # Pill tabs controller, stats, SecurityPage, Help modal
    │   ├── Navbar.css      # History grids, pill selector states, centered card css
    │   ├── PrivateRoute.js # JWT check router guard
    │   ├── ResetPassword.js# SaaS mockup page (password eye toggles, length validation)
    │   └── SharedChat.js   # Read-only static conversation view
    ├── App.js              # Routing controller
    ├── index.js            # React DOM mounting entry
    └── .env                # API configuration URL endpoints
```

---

## Detailed Functionality

### 1. Authentication Portal (`LoginRegister.js`)
* **Sliding Panel Layout**: Switches between registration and login using custom CSS transition timing.
* **Input Protection**: Client-side validation for required fields.
* **Forgot Password**: Opens a modal requesting user email. Connects to `/api/auth/forgot-password` to trigger the reset code link.

### 2. Main Dashboard Interface (`Navbar.js` & `Chatbot.js`)
* **Navigation pill selector**: A slate grey track tab bar representing Chat, History, and Security. Active states slide with subtle drop shadows.
* **Chat Sidebar**: Create new chats, delete, and rename inline conversation titles. Logs all sessions locally and in the database.
* **Dialogue Panel**:
  - Direct Google Gemini response generator with message indicators.
  - Context truncation (slices last 10 messages) and clean-up of connection error logs.
  - **Inline Emoji Picker**: Custom selector overlay to insert emojis directly into the text input cursor.
  - **Speech-to-Text Voice Input**: Integrates HTML5 Web Speech API to dictate messages.
  - **Shareable Chat**: Click-to-copy unique URL generating a public, read-only version of the current chat.
* **Help Modal**: Triggered by clicking the `?` icon, explaining security credentials and capabilities.

### 3. Conversations History Panel (`Navbar.js`)
* Total Chat metrics and Message Counters.
* A tabular layout displaying conversation titles, clicking on them redirects directly to the chat session in progress.
* Actions to Rename or Delete.

### 4. Security Panel & Password Resetting (`ResetPassword.js`)
* **Security Tab**: Centered form to update passwords with real-time feedback.
* **Reset Password Page**:
  - Matches premium SaaS visual mockups.
  - Toggles password visibility dynamically using SVG eye icons.
  - Validates constraints (checks minimum length of 6 characters and matches confirm-password fields).

---

## Installation & Setup

1. **Configure Environment Variables**:
   Create a `.env` file in the root of the `frontend/` directory:
   ```ini
   REACT_APP_API_URL=http://localhost:5000
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Dev Server**:
   ```bash
   npm start
   ```
   The client will host locally at `http://localhost:3000`.