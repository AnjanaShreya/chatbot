import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaRegSmile, FaPaperPlane, FaShareAlt, FaRobot } from 'react-icons/fa';
import axios from 'axios';
import './chatbot.css';

const Chatbot = ({ currentChatId, chatHistory, setChatHistory }) => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceCommandPopup, setVoiceCommandPopup] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Helper to format timestamps
  const formatTime = (isoString) => {
    if (!isoString) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setVoiceCommandPopup({ type: 'status', message: 'Listening...' });
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setVoiceCommandPopup({
          type: 'success',
          message: `Command received: ${transcript}`
        });
        setTimeout(() => setVoiceCommandPopup(null), 3000);
      };

      recognitionRef.current.onerror = (event) => {
        let errorMessage = 'Error occurred in recognition';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak louder or check microphone.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied';
            break;
          case 'network':
            errorMessage = 'Network error - check your internet connection';
            break;
          default:
            errorMessage = `Error: ${event.error}`;
        }
        setVoiceCommandPopup({ type: 'error', message: errorMessage });
        setTimeout(() => setVoiceCommandPopup(null), 3000);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleEmojiSelect = (emoji) => {
    setUserInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleShare = async () => {
    try {
      if (messages.length === 0) {
        alert('There is no conversation to share yet.');
        return;
      }

      const shareUrl = `${window.location.origin}/share/${currentChatId}`;

      if (navigator.share) {
        await navigator.share({
          title: `Shared Chat - ${chatName}`,
          text: `Check out this conversation:`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Shareable chat link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setVoiceCommandPopup({
        type: 'error',
        message: 'Voice recognition not supported'
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const fetchChatHistory = async (chatId) => {
    try {
      const token = localStorage.getItem('userToken');
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiUrl}/api/chat-history/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const formattedMessages = response.data.flatMap(msg => {
        const userMsg = msg.userMessage || msg.user_message;
        const botMsg = msg.botResponse || msg.bot_response;
        const timeStamp = msg.createdAt || msg.created_at;
        return [
          ...(userMsg ? [{ type: 'user', content: userMsg, time: formatTime(timeStamp) }] : []),
          ...(botMsg ? [{ type: 'bot', content: botMsg, time: formatTime(timeStamp) }] : [])
        ];
      });

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const generateBotResponse = async (userMessage) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(
        `${apiUrl}/api/generate-response`,
        {
          message: userMessage,
          chatHistory: messages
            .filter(msg => msg.type === 'user' || msg.type === 'bot')
            .map(msg => ({
              role: msg.type === 'user' ? 'user' : 'model',
              content: msg.content
            }))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data.response;
    } catch (error) {
      console.error('API Error:', error);
      return "I'm having trouble responding right now. Please try again later.";
    } finally {
      setIsLoading(false);
    }
  };

  const saveChatToServer = async (userMessage, botResponse) => {
    try {
      const token = localStorage.getItem('userToken');
      const apiUrl = process.env.REACT_APP_API_URL;
      await axios.post(
        `${apiUrl}/api/chat-history`,
        { chatId: currentChatId, userMessage, botResponse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = userInput;
    const timeString = formatTime();
    const newMessages = [...messages, { type: 'user', content: userMessage, time: timeString }];
    setMessages(newMessages);
    setUserInput('');

    const botResponse = await generateBotResponse(userMessage);
    const botTimeString = formatTime();
    const updatedMessages = [...newMessages, { type: 'bot', content: botResponse, time: botTimeString }];
    setMessages(updatedMessages);

    await saveChatToServer(userMessage, botResponse);
    setChatHistory(prev => prev.map(chat =>
      chat.id === currentChatId ? { ...chat, messages: updatedMessages } : chat
    ));
  };

  useEffect(() => {
    if (currentChatId) {
      fetchChatHistory(currentChatId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Find active chat name
  const activeChat = chatHistory.find(chat => chat.id === currentChatId);
  const chatName = activeChat ? activeChat.name : 'Project Analysis';

  // Compute initials for the user avatar
  const username = localStorage.getItem('username') || 'JD';
  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  const userInitials = getInitials(username);

  return (
    <div className="chatbot-page">
      {/* Active Chat Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <h2 className="chat-header-title">{chatName}</h2>
          <span className="chat-header-badge">AI-V4.2</span>
        </div>
        <div className="chat-header-right">
          <button className="chat-header-btn" title="Share" onClick={handleShare}>
            <FaShareAlt size={16} />
          </button>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="chat-display">
        {messages.length === 0 ? (
          <div className="empty-chat-state">
            <div className="empty-icon-wrapper">
              <FaRobot size={36} />
            </div>
            <h3>How can I help you today?</h3>
            <p>Type a message below to start your conversation with Trustworthy AI.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.type}`}>
              {msg.type === 'bot' && (
                <div className="bot-avatar" title="Assistant">
                  <FaRobot size={16} />
                </div>
              )}

              <div className="message-container">
                <div className={`message-bubble ${msg.type}`}>
                  {msg.content.startsWith('```') || msg.content.includes('\n') ? (
                    // Very simple code rendering styling
                    <pre className="code-render-block">
                      <code>{msg.content}</code>
                    </pre>
                  ) : (
                    <p className="message-text">{msg.content}</p>
                  )}
                </div>
                {msg.type === 'user' && msg.time && (
                  <div className="message-status">
                    Read {msg.time}
                  </div>
                )}
              </div>

              {msg.type === 'user' && (
                <div className="user-message-avatar" title={username}>
                  {userInitials}
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="message-wrapper bot">
            <div className="bot-avatar">
              <FaRobot size={16} />
            </div>
            <div className="message-container">
              <div className="message-bubble bot thinking">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {voiceCommandPopup && (
        <div className={`voice-popup ${voiceCommandPopup.type}`}>
          {voiceCommandPopup.message}
        </div>
      )}

      {/* Input Form Area */}
      <div className="chat-input-area">
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <div className="input-bar-wrapper">
            <div className="input-left-actions">
              <button
                type="button"
                className={`input-action-btn ${isListening ? 'listening-active' : ''}`}
                onClick={toggleVoiceInput}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                <FaMicrophone size={18} />
              </button>
              <button
                type="button"
                className="input-action-btn"
                title="Emoji"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <FaRegSmile size={18} />
              </button>

              {showEmojiPicker && (
                <div className="emoji-picker-popover">
                  {['😊', '😂', '🔥', '👍', '❤️', '🎉', '👋', '🤔', '🚀', '✨', '💻', '👏', '🙌', '👀', '💡', '🌟'].map(emoji => (
                    <span
                      key={emoji}
                      className="emoji-item"
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Type a message or paste code..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="chat-text-input"
              disabled={isLoading}
            />

            <button type="submit" className="chat-send-btn" disabled={isLoading || !userInput.trim()}>
              <FaPaperPlane size={14} />
            </button>
          </div>
        </form>
        <div className="chat-input-disclaimer">
          Trustworthy AI may produce inaccurate information. Always audit mission-critical code.
        </div>
      </div>
    </div>
  );
};

export default Chatbot;