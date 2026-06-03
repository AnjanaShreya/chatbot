import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaRobot } from 'react-icons/fa';
import './chatbot.css'; // Reuse chatbot styles
import './Navbar.css';  // Reuse layout styles

const SharedChat = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper to format timestamps
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  useEffect(() => {
    const fetchSharedHistory = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.get(`${apiUrl}/api/chat-history/share/${chatId}`);

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
      } catch (err) {
        console.error('Error fetching shared history:', err);
        setError('Could not load the shared conversation. It may not exist or might have been deleted.');
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      fetchSharedHistory();
    }
  }, [chatId]);

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Bar */}
      <header className="dashboard-header">
        <div className="header-logo">
          <svg viewBox="0 0 24 24" width="24" height="24" className="logo-svg-icon" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <span className="brand-name">Trustworthy AI</span>
        </div>
        <div className="header-right">
          <Link to="/" className="new-chat-btn" style={{ textDecoration: 'none', margin: 0, padding: '8px 16px', fontSize: '13px' }}>
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="dashboard-body" style={{ justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <main className="chat-content-pane" style={{ maxWidth: '800px', width: '100%', height: 'calc(100vh - 60px)', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>

          {/* Active Chat Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <h2 className="chat-header-title">Shared Conversation</h2>
              <span className="chat-header-badge">Read Only</span>
            </div>
          </div>

          {/* Messages List Area */}
          <div className="chat-display" style={{ paddingBottom: '40px' }}>
            {loading ? (
              <div className="empty-chat-state">
                <p>Loading shared conversation...</p>
              </div>
            ) : error ? (
              <div className="empty-chat-state">
                <h3>Error Loading Chat</h3>
                <p>{error}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="empty-chat-state">
                <p>This shared conversation has no messages.</p>
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
                        <pre className="code-render-block">
                          <code>{msg.content}</code>
                        </pre>
                      ) : (
                        <p className="message-text">{msg.content}</p>
                      )}
                    </div>
                    {msg.type === 'user' && msg.time && (
                      <div className="message-status">
                        Sent {msg.time}
                      </div>
                    )}
                  </div>

                  {msg.type === 'user' && (
                    <div className="user-message-avatar" title="User">
                      U
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SharedChat;
