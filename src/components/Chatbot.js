import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import axios from 'axios';
import './chatbot.css';

const Chatbot = ({ currentChatId, chatHistory, setChatHistory }) => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceCommandPopup, setVoiceCommandPopup] = useState(null);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

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
        switch(event.error) {
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
      const response = await axios.get(`http://localhost:5000/api/chat-history/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const formattedMessages = response.data.flatMap(msg => [
        ...(msg.user_message ? [{ type: 'user', content: msg.user_message }] : []),
        ...(msg.bot_response ? [{ type: 'bot', content: msg.bot_response }] : [])
      ]);
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const generateBotResponse = async (userMessage) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.post(
        'http://localhost:5000/api/generate-response',
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
      await axios.post(
        'http://localhost:5000/api/chat-history',
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
    const newMessages = [...messages, { type: 'user', content: userMessage }];
    setMessages(newMessages);
    setUserInput('');

    const botResponse = await generateBotResponse(userMessage);
    const updatedMessages = [...newMessages, { type: 'bot', content: botResponse }];
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
  }, [currentChatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chatbot-page">
      <div className="chat-display">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <div className={`${msg.type}-message`}>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="bot-message">
              <p>Thinking...</p>
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

      <form className="chat-input" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <FaMicrophone 
            className={`icon ${isListening ? 'active' : ''}`} 
            onClick={toggleVoiceInput} 
            title={isListening ? 'Stop listening' : 'Start voice input'}
          />
          <input
            type="text"
            placeholder="Enter your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="text-input"
            disabled={isLoading}
          />
        </div>
        <button type="submit" className="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chatbot;