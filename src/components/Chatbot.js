import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaPaperclip } from 'react-icons/fa';
import './chatbot.css';

const Chatbot = ({ currentChatId, chatHistory, setChatHistory, creativityLevel }) => {
  const [userInput, setUserInput] = useState('');
  const [file, setFile] = useState(null);
  const [voiceMessage, setVoiceMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  const fetchChatHistory = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/chat-history/${chatId}`);
      const data = await response.json();
  
      // Map the response to format user and bot messages properly
      const formattedMessages = data.flatMap((msg) => {
        const userMessages = [];
        if (msg.user_message) {
          userMessages.push({ type: 'user', content: msg.user_message });
        }
        if (msg.bot_response) {
          userMessages.push({ type: 'bot', content: msg.bot_response });
        }
        return userMessages;
      });
  
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };  

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleVoiceInput = () => {
    setVoiceMessage('Simulated voice message');
  };

  const generateBotResponse = () => {
    if (creativityLevel <= 3) {
      return 'Here is a straightforward answer to your question.';
    } else if (creativityLevel <= 7) {
      return 'I have a few interesting ideas for you to consider...';
    } else {
      return "Let's explore some creative and unconventional possibilities!";
    }
  };

  const saveChatToServer = async (userMessage, botResponse) => {
    try {
      const response = await fetch('http://localhost:5001/api/save-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: currentChatId,
          userMessage,
          botResponse,
        }),
      });

      const data = await response.json();
      console.log('Chat saved:', data);
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim() || file || voiceMessage) {
      const newMessages = [...messages];
      let userMsg = userInput || voiceMessage || file?.name;

      if (userInput.trim()) {
        newMessages.push({ type: 'user', content: userInput });
      }
      if (file) {
        newMessages.push({ type: 'user', content: URL.createObjectURL(file), fileName: file.name });
      }
      if (voiceMessage) {
        newMessages.push({ type: 'user', content: voiceMessage });
      }

      // Generate bot response based on creativity level
      const botResponse = generateBotResponse();
      newMessages.push({ type: 'bot', content: botResponse });

      setMessages(newMessages);
      setUserInput('');
      setFile(null);
      setVoiceMessage('');

      // Save the chat (user message and bot response) to the server
      saveChatToServer(userMsg, botResponse);

      // Update chat history with new messages for the current chat
      setChatHistory((prevChatHistory) =>
        prevChatHistory.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: newMessages }
            : chat
        )
      );
    }
  };

  // Fetch the chat history when currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      fetchChatHistory(currentChatId);
    }
  }, [currentChatId]);

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
          <input type="file" onChange={handleFileChange} className="file-input" />
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
