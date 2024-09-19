import React, { useState, useEffect } from 'react';
import './Navbar.css'; 
import Chatbot from './Chatbot';
import { FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

const Navbar = () => {
  const [isMenuClosed, setIsMenuClosed] = useState(false);
  const [rangeValue, setRangeValue] = useState(0); // Initial range value
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown
  const [selectedModel, setSelectedModel] = useState(''); // State for selected model
  const [chatHistory, setChatHistory] = useState([{ id: 1, name: 'Chat 1' }]); // Initialize with 1 chat
  const [currentChatId, setCurrentChatId] = useState(1); // Set first chat as active by default

  const navigate = useNavigate(); // useNavigate hook for redirection

  // Toggle menu state
  const toggleMenu = () => {
    setIsMenuClosed(!isMenuClosed);
  };

  // Handle range change
  const handleRangeChange = (e) => {
    setRangeValue(e.target.value);
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle model selection
  const handleModelClick = (model) => {
    setSelectedModel(model);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  // Create a new chat
  const createNewChat = () => {
    const newChatId = Date.now(); // Unique ID based on timestamp
    setChatHistory([...chatHistory, { id: newChatId, name: `Chat ${chatHistory.length + 1}` }]);
    setCurrentChatId(newChatId); // Set new chat as current chat
  };

  // Delete a chat from history
  const deleteChat = (id) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== id);
    setChatHistory(updatedHistory);
    if (currentChatId === id) {
      setCurrentChatId(chatHistory[0]?.id || null); // Set the first chat or clear current chat if it's deleted
    }
  };

  // Handle logout functionality
  const handleLogout = () => {
    // Clear user session (localStorage, sessionStorage, cookies, etc.)
    localStorage.removeItem('userToken'); // Example: Remove token from localStorage
    sessionStorage.removeItem('userSession'); // Example: Remove session from sessionStorage
    
    // Redirect user to login or homepage
    navigate('/'); // Change '/login' to the appropriate path
  };

  // Ensure one chat is always present when the component mounts
  useEffect(() => {
    if (chatHistory.length === 0) {
      const initialChat = { id: 1, name: 'Chat 1' };
      setChatHistory([initialChat]);
      setCurrentChatId(initialChat.id); // Set the first chat as active
    }
  }, [chatHistory]);

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
          {/* Switch Model section with dropdown */}
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

          {/* Adjust Creativity slider */}
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

          {/* Create New Chat button */}
          <div className='chat-history-container'>
            <li style={{marginBotton: '0'}} >
              <div onClick={createNewChat} className="create-chat-btn hover-style" 
              style={{
                 display:'flex', 
                 justifyContent: 'center', 
                 alignItems: 'center', 
                 width: '100%'
              }}>
                New Chat +
              </div>
            </li>
            {/* Chat History Section */}
            <li>
              <ul className="chat-history-list">
                {chatHistory.map(chat => (
                  <li key={chat.id} className={`chat-history-item hover-style ${chat.id === currentChatId ? 'active-chat' : ''}`} style={{  padding: '8px', marginTop: '8px'}}>
                    <span onClick={() => setCurrentChatId(chat.id)}>
                      {chat.name}
                    </span>
                    <div onClick={() => deleteChat(chat.id)} className="delete-chat-btn">
                      x
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          </div>
          <hr />

          {/* Logout button */}
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
            onClick={handleLogout} // Call handleLogout on click
          >
            <FaSignOutAlt style={{ marginRight: '10px' }} /> 
            Logout
          </li>
        </ul>
      </nav>
      <div className="content-wrapper">
        <div className="content">
          {/* Pass currentChatId and chatHistory to Chatbot */}
          <Chatbot currentChatId={currentChatId} chatHistory={chatHistory} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
