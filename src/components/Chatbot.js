import React, { useState, useRef, useEffect } from 'react'; // Import the necessary React hooks
import { FaMicrophone, FaPaperclip } from 'react-icons/fa';  // Import the required icons
import './chatbot.css';


const Chatbot = ({ currentChatId, chatHistory, setChatHistory }) => {
  const [userInput, setUserInput] = useState('');
  const [file, setFile] = useState(null);
  const [voiceMessage, setVoiceMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleVoiceInput = () => {
    setVoiceMessage('Simulated voice message');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim() || file || voiceMessage) {
      const newMessages = [...messages];
      if (userInput.trim()) {
        newMessages.push({ type: 'user', content: userInput });
      }
      if (file) {
        newMessages.push({ type: 'user', content: URL.createObjectURL(file), fileName: file.name });
      }
      if (voiceMessage) {
        newMessages.push({ type: 'user', content: voiceMessage });
      }
      newMessages.push({ type: 'bot', content: 'Processing.....' });

      setMessages(newMessages);
      setUserInput('');
      setFile(null);
      setVoiceMessage('');

      // Update chat history with new messages for the current chat
      setChatHistory(prevChatHistory => 
        prevChatHistory.map(chat => 
          chat.id === currentChatId 
          ? { ...chat, messages: newMessages }
          : chat
        )
      );
    }
  };

  useEffect(() => {
    if (currentChatId) {
      const chat = chatHistory.find(chat => chat.id === currentChatId);
      if (chat) {
        setMessages(chat.messages || []);
      }
    }
  }, [currentChatId, chatHistory]);

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
