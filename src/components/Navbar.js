import React, { useState, useEffect } from 'react';
import './Navbar.css'; 
import Chatbot from './Chatbot';
import { FaSignOutAlt, FaTrash, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 

const Navbar = () => {
  const [isMenuClosed, setIsMenuClosed] = useState(false);
  const [rangeValue, setRangeValue] = useState(0); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  const [selectedModel, setSelectedModel] = useState(''); 
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [newChatName, setNewChatName] = useState('');
  const navigate = useNavigate(); 

  const toggleMenu = () => {
    setIsMenuClosed(!isMenuClosed);
  };

  const handleRangeChange = (e) => {
    setRangeValue(e.target.value);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleModelClick = (model) => {
    setSelectedModel(model);
    setIsDropdownOpen(false); 
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken'); 
    sessionStorage.removeItem('userSession'); 
    navigate('/'); 
  };

  const handleNewChat = () => {
    const newChatId = chatHistory.length ? chatHistory[chatHistory.length - 1].id + 1 : 1;
    const newChat = { id: newChatId, name: `Chat ${newChatId}`, messages: [] };
    setChatHistory([...chatHistory, newChat]);
    setCurrentChatId(newChatId); 
  };

  const handleChatSelect = (id) => {
    setCurrentChatId(id);
  };

  const handleDeleteChat = (id) => {
    setChatHistory(chatHistory.filter(chat => chat.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
    }
  };

  const handleRenameClick = (id) => {
    setEditingChatId(id);
    const chat = chatHistory.find(chat => chat.id === id);
    setNewChatName(chat ? chat.name : '');
  };

  const handleRenameChat = () => {
    setChatHistory(chatHistory.map(chat => 
      chat.id === editingChatId ? { ...chat, name: newChatName } : chat
    ));
    setEditingChatId(null);
  };

  useEffect(() => {
    if (!currentChatId && chatHistory.length > 0) {
      setCurrentChatId(chatHistory[0].id);
    }
  }, [chatHistory, currentChatId]);

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
          <li className="dropdown">
            <button onClick={toggleDropdown} className="dropdown-toggle hover-style" 
            style={{
              borderBottom: '2px white solid',
              borderRight: '2px white solid',
              }}>
              Switch Model {isDropdownOpen ? '▲' : '▼'}
            </button>
            
            {isDropdownOpen && (
              <ul className="dropdown-menu">
                <li onClick={() => handleModelClick('Model 4.0')}>Model 4.0</li>
                <li onClick={() => handleModelClick('Model 5.0')}>Model 5.0</li>
                <li onClick={() => handleModelClick('Model 6.0')}>Model 6.0</li>
              </ul>
            )}
            {selectedModel && (
            <li style={{ color: 'white'}}>
              Selected Model: {selectedModel}
            </li>
            )}
          </li>
          <hr />

          <li>
            <label htmlFor='model-range-slider'>Adjust Creativity:</label>
            <input
              id='model-range-slider'
              type='range'
              min='0'
              max='10'
              value={rangeValue}
              onChange={handleRangeChange}
              className='range-slider'
            />
            <span style={{color: 'white'}}>{rangeValue}</span>
          </li>
          <hr />

          <li className='hover-style'
            style={{
              borderBottom: '2px solid white',
              borderRight: '2px solid white',
              height: '50px',
              textAlign: 'center',
              borderRadius: '8px',
              fontSize: '19px',
              cursor: 'pointer',
              marginTop: '12px'
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
          <Chatbot currentChatId={currentChatId} chatHistory={chatHistory} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
