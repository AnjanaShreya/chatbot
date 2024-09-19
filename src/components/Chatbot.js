import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaPaperclip } from 'react-icons/fa';
import './chatbot.css';

const Chatbot = ({ currentChatId, chatHistory }) => {
  const [userInput, setUserInput] = useState('');
  const [file, setFile] = useState(null);
  const [voiceMessage, setVoiceMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null); // Reference for auto-scrolling

  // Handle text input change
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle voice message (for demo, we simulate voice input as text)
  const handleVoiceInput = () => {
    setVoiceMessage('Simulated voice message');
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim() || file || voiceMessage) {
      const newMessages = [...messages];
      // Add user message
      if (userInput.trim()) {
        newMessages.push({ type: 'user', content: userInput });
      }
      if (file) {
        newMessages.push({ type: 'user', content: URL.createObjectURL(file), fileName: file.name });
      }
      if (voiceMessage) {
        newMessages.push({ type: 'user', content: voiceMessage });
      }
      // Add processing message
      newMessages.push({ type: 'bot', content: 'Processing.....' });
      setMessages(newMessages);
      setUserInput('');
      setFile(null);
      setVoiceMessage('');
    }
  };

  // Update messages based on current chat
  useEffect(() => {
    if (currentChatId) {
      // Find chat messages from chatHistory if needed
      // For now, we'll reset messages
      setMessages([]);
    }
  }, [currentChatId, chatHistory]);

  // Auto-scroll to the bottom of chat messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chatbot-page">
      <div className="chat-display">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.type === 'user' && (
              <div className="user-message">
                {msg.file ? (
                  <a href={msg.content} download={msg.fileName}>Download File</a>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            )}
            {msg.type === 'bot' && (
              <div className="bot-message">
                <p>{msg.content}</p>
              </div>
            )}
          </div>
        ))}
        {/* Reference element for auto-scrolling */}
        <div ref={chatEndRef} />
      </div>
      <form className="chat-input" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <FaPaperclip className="icon" />
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
          />
          <FaMicrophone className="icon" onClick={handleVoiceInput} />
          <input
            type="text"
            placeholder="Enter your message..."
            value={userInput}
            onChange={handleInputChange}
            className="text-input"
          />
        </div>
        <button type="submit" className="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;
