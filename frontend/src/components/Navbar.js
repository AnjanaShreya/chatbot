import React, { useState, useEffect } from 'react';
import './Navbar.css';
import Chatbot from './Chatbot';
import { FaSignOutAlt, FaTrash, FaEdit, FaRegCommentAlt, FaRegQuestionCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SecurityPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(`${apiUrl}/api/auth/update-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMsg('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(response.data.message || 'Failed to update password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="security-page-pane">
      <div className="security-header">
        <h2>Security Settings</h2>
        <p>Manage your account security and authentication credentials.</p>
      </div>

      <div className="security-card">
        <h3>Update Password</h3>
        <form className="security-form" onSubmit={handleUpdatePassword}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          {msg && <div className="security-success-message">{msg}</div>}
          {error && <div className="security-error-message">{error}</div>}

          <button type="submit" className="new-chat-btn" style={{ margin: '16px 0 0 0', width: 'auto' }} disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [newChatName, setNewChatName] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    sessionStorage.removeItem('userSession');
    navigate('/');
  };

  const username = localStorage.getItem('username') || 'default';
  const chatHistoryKey = `chatHistory_${username}`;

  const handleNewChat = () => {
    // Generate a unique 32-bit signed random integer (up to 1 billion) to prevent database key collisions
    const newChatId = Math.floor(Math.random() * 1000000000) + 1;
    const newChat = {
      id: newChatId,
      name: `Chat ${chatHistory.length + 1}`,
      messages: []
    };
    const updatedChatHistory = [...chatHistory, newChat];
    setChatHistory(updatedChatHistory);
    localStorage.setItem(chatHistoryKey, JSON.stringify(updatedChatHistory));
    setCurrentChatId(newChatId);
    setActiveTab('chat');
  };

  const handleChatSelect = (id) => {
    setCurrentChatId(id);
  };

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation(); // Avoid selecting the chat when deleting
    try {
      const token = localStorage.getItem('userToken');
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/api/chat-history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedChatHistory = chatHistory.filter(chat => chat.id !== id);
        setChatHistory(updatedChatHistory);
        localStorage.setItem(chatHistoryKey, JSON.stringify(updatedChatHistory));
        if (currentChatId === id) {
          setCurrentChatId(updatedChatHistory[0]?.id || null);
        }
      } else {
        console.error('Failed to delete chat from database');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleRenameClick = (id, e) => {
    e.stopPropagation(); // Avoid selecting the chat
    setEditingChatId(id);
    const chat = chatHistory.find(chat => chat.id === id);
    setNewChatName(chat ? chat.name : '');
  };

  const handleRenameChat = (e) => {
    e.stopPropagation();
    if (!newChatName.trim()) {
      setEditingChatId(null);
      return;
    }
    const updatedChatHistory = chatHistory.map(chat =>
      chat.id === editingChatId ? { ...chat, name: newChatName } : chat
    );
    setChatHistory(updatedChatHistory);
    localStorage.setItem(chatHistoryKey, JSON.stringify(updatedChatHistory));
    setEditingChatId(null);
  };

  useEffect(() => {
    const savedChatHistory = JSON.parse(localStorage.getItem(chatHistoryKey));
    if (savedChatHistory && savedChatHistory.length > 0) {
      setChatHistory(savedChatHistory);
      setCurrentChatId(savedChatHistory[0]?.id || null);
    } else {
      const generateUniqueId = () => Math.floor(Math.random() * 1000000000) + 1;
      const initialChats = [
        { id: generateUniqueId(), name: 'Chat 1', messages: [] }
      ];
      setChatHistory(initialChats);
      setCurrentChatId(initialChats[0].id);
      localStorage.setItem(chatHistoryKey, JSON.stringify(initialChats));
    }
  }, [chatHistoryKey]);

  // Compute initials for the top avatar
  const userDisplayName = localStorage.getItem('username') || 'JD';
  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  const userInitials = getInitials(userDisplayName);

  return (
    <div className="dashboard-container">
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
          <nav className="header-nav">
            <button
              className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button
              className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
            <button
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </nav>
          <button className="help-icon-btn" aria-label="Help" onClick={() => setShowHelpModal(true)}>
            <FaRegQuestionCircle size={20} />
          </button>
          <div className="user-avatar" title={userDisplayName}>
            {userInitials}
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="dashboard-body">
        {activeTab === 'chat' && (
          <>
            {/* Left Sidebar */}
            <aside className="dashboard-sidebar">
              <button className="new-chat-btn" onClick={handleNewChat}>
                + New Chat
              </button>

              <div className="sidebar-section-title">Recent Conversations</div>

              <ul className="chat-sessions-list">
                {chatHistory.map(chat => (
                  <li
                    key={chat.id}
                    onClick={() => handleChatSelect(chat.id)}
                    className={`chat-session-item ${currentChatId === chat.id ? 'active' : ''}`}
                  >
                    {editingChatId === chat.id ? (
                      <div className="rename-input-container" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={newChatName}
                          onChange={(e) => setNewChatName(e.target.value)}
                          onBlur={handleRenameChat}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameChat(e);
                            if (e.key === 'Escape') setEditingChatId(null);
                          }}
                          autoFocus
                          className="rename-input"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="chat-session-label">
                          <FaRegCommentAlt className="chat-icon" />
                          <span className="chat-name">{chat.name}</span>
                        </div>
                        <div className="chat-session-actions">
                          <button
                            className="action-btn edit"
                            onClick={(e) => handleRenameClick(chat.id, e)}
                            title="Rename"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt className="logout-icon" />
                  <span>Logout</span>
                </button>
              </div>
            </aside>

            {/* Right Chat Panel */}
            <main className="chat-content-pane">
              <Chatbot
                currentChatId={currentChatId}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
              />
            </main>
          </>
        )}

        {activeTab === 'history' && (
          <main className="history-page-pane">
            <div className="history-header">
              <h2>Conversations History</h2>
              <p>Manage and review your past conversations with Trustworthy AI.</p>
            </div>

            <div className="history-stats">
              <div className="stat-card">
                <span className="stat-value">{chatHistory.length}</span>
                <span className="stat-label">Total Chats</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {chatHistory.reduce((acc, chat) => acc + (chat.messages?.length || 0), 0)}
                </span>
                <span className="stat-label">Stored Messages</span>
              </div>
            </div>

            <div className="history-list-container">
              {chatHistory.length === 0 ? (
                <div className="empty-history">
                  <p>No chat history found. Start a new chat to see it here.</p>
                </div>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Conversation Title</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chatHistory.map(chat => (
                      <tr key={chat.id} className={currentChatId === chat.id ? 'active-row' : ''}>
                        <td>
                          {editingChatId === chat.id ? (
                            <div onClick={e => e.stopPropagation()}>
                              <input
                                type="text"
                                value={newChatName}
                                onChange={(e) => setNewChatName(e.target.value)}
                                onBlur={handleRenameChat}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRenameChat(e);
                                  if (e.key === 'Escape') setEditingChatId(null);
                                }}
                                autoFocus
                                className="rename-input"
                                style={{ maxWidth: '300px' }}
                              />
                            </div>
                          ) : (
                            <span
                              className="chat-title-link"
                              onClick={() => {
                                handleChatSelect(chat.id);
                                setActiveTab('chat');
                              }}
                            >
                              {chat.name}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="table-action-btn edit"
                              onClick={(e) => handleRenameClick(chat.id, e)}
                              title="Rename"
                            >
                              Rename
                            </button>
                            <button
                              className="table-action-btn delete"
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </main>
        )}

        {activeTab === 'security' && (
          <SecurityPage />
        )}
      </div>

      {showHelpModal && (
        <div className="help-modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="help-modal-card" onClick={e => e.stopPropagation()}>
            <button className="help-modal-close" onClick={() => setShowHelpModal(false)}>
              &times;
            </button>
            <div className="help-modal-header">
              <svg viewBox="0 0 24 24" width="28" height="28" className="help-logo-icon" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
              <h3>About Trustworthy AI</h3>
            </div>
            <div className="help-modal-body">
              <p><strong>Trustworthy AI</strong> is an enterprise-grade conversation companion designed with professional integrity, user privacy, and database security at its core.</p>

              <h4>Key Features:</h4>
              <ul>
                <li><strong>Secured Workspace:</strong> Industry-standard password hashing, JWT authorization, and encrypted Neon DB data streams.</li>
                <li><strong>Gemini 2.5 Flash:</strong> Integrates the latest, fastest generative AI engine from Google for intelligent processing, with dynamic fallback mechanisms.</li>
                <li><strong>Shareable Conversations:</strong> Generate unique, read-only links for specific chat sessions so colleagues or friends can view them instantly.</li>
                <li><strong>History Logs:</strong> Seamlessly organize, rename, and review past dialogues on your dashboard.</li>
              </ul>

              <p className="help-version-tag">Version 1.2.0 (Stable) &. Built with React & Node.js</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;