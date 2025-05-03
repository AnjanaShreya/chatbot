import React, { useState, useEffect } from 'react';
import './Navbar.css'; 
import Chatbot from './Chatbot';
import { FaSignOutAlt, FaTrash, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 

const Navbar = () => {
  const [isMenuClosed, setIsMenuClosed] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [newChatName, setNewChatName] = useState('');
  const navigate = useNavigate(); 

  const toggleMenu = () => {
    setIsMenuClosed(!isMenuClosed);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken'); 
    sessionStorage.removeItem('userSession'); 
    navigate('/'); 
  };

  const handleNewChat = () => {
    const newChatId = chatHistory.length ? chatHistory[chatHistory.length - 1].id + 1 : 1;
    const newChat = {
      id: newChatId,
      name: `Chat ${newChatId}`,
      messages: []
    };
    const updatedChatHistory = [...chatHistory, newChat];
    setChatHistory(updatedChatHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedChatHistory));
    setCurrentChatId(newChatId); 
  };
  
  const handleChatSelect = (id) => {
    setCurrentChatId(id);
  };

  const handleDeleteChat = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/chats/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedChatHistory = chatHistory.filter(chat => chat.id !== id);
        setChatHistory(updatedChatHistory);
        localStorage.setItem('chatHistory', JSON.stringify(updatedChatHistory));
        if (currentChatId === id) {
          setCurrentChatId(null);
        }
      } else {
        console.error('Failed to delete chat from database');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleRenameClick = (id) => {
    setEditingChatId(id);
    const chat = chatHistory.find(chat => chat.id === id);
    setNewChatName(chat ? chat.name : '');
  };

  const handleRenameChat = () => {
    const updatedChatHistory = chatHistory.map(chat => 
      chat.id === editingChatId ? { ...chat, name: newChatName } : chat
    );
    setChatHistory(updatedChatHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedChatHistory));
    setEditingChatId(null);
  };
  
  useEffect(() => {
    const savedChatHistory = JSON.parse(localStorage.getItem('chatHistory'));
    if (savedChatHistory) {
      setChatHistory(savedChatHistory);
      setCurrentChatId(savedChatHistory[0]?.id || null);
    } else {
      const initialChat = { id: 1, name: 'Chat 1', messages: [] };
      setChatHistory([initialChat]);
      setCurrentChatId(1);
      localStorage.setItem('chatHistory', JSON.stringify([initialChat]));
    }
  }, []);

  return (
    <div className={`body ${isMenuClosed ? 'closed-menu' : ''}`}>
      <nav className="vertical-menu-wrapper">
        <div className="vertical-menu-logo" style={{margin: '0', paddingBottom: '0', paddingTop: '6px'}}>
          <div>LOGO</div>
          <span className="open-menu-btn" onClick={toggleMenu}>
            <hr /><hr /><hr />
          </span>
        </div>
        <ul className="vertical-menu">
          <li className='hover-style'
            style={{
              borderBottom: '2px solid white',
              borderRight: '2px solid white',
              height: '50px',
              textAlign: 'center',
              borderRadius: '8px',
              fontSize: '19px',
              cursor: 'pointer',
              marginTop: '60px'
            }}
            onClick={handleNewChat}
          >
            New Chat +
          </li>
          <hr />

          <li>
            <ul className="chat-list">
              {chatHistory.map(chat => (
                <li
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className={currentChatId === chat.id ? 'active-chat' : ''}
                >
                  {editingChatId === chat.id ? (
                    <div>
                      <input 
                        type="text" 
                        value={newChatName}
                        onChange={(e) => setNewChatName(e.target.value)}
                        onBlur={handleRenameChat}
                      />
                    </div>
                  ) : (
                    <div>
                      {chat.name}
                      <FaEdit 
                        style={{ marginLeft: '10px', cursor: 'pointer' }}
                        onClick={() => handleRenameClick(chat.id)}
                      />
                      <FaTrash 
                        style={{ marginLeft: '10px', cursor: 'pointer' }}
                        onClick={() => handleDeleteChat(chat.id)}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </li>

          <hr />

          <li id="user-info" 
            style={{
              borderBottom: '2px solid white',
              borderRight: '2px solid white',
              height: '50px',
              textAlign: 'center',
              borderRadius: '8px',
              fontSize: '19px',
              cursor: 'pointer'
            }}
            onClick={handleLogout}
          >
            <FaSignOutAlt style={{ marginRight: '10px' }} /> 
            Logout
          </li>
        </ul>
      </nav>
      <div className="content-wrapper">
        <div className="content">
          <Chatbot 
            currentChatId={currentChatId} 
            chatHistory={chatHistory} 
            setChatHistory={setChatHistory} 
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;