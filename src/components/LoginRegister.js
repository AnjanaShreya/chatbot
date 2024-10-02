import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginRegister.css';

const LoginRegister = () => {
  // State to toggle between login and register form
  const [isActive, setIsActive] = useState(false);
  
  // State for form inputs
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    setIsActive(true);
  };

  const handleLoginClick = () => {
    setIsActive(false);
  };

  // Handle input changes for register form
  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  // Handle input changes for login form
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Handle registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/register', registerData);
      if (response.data.success) {
        alert('Registration successful! Please log in.');
        setIsActive(false); // Switch to login form
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('An error occurred during registration.');
    }
  };

  // Handle login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', loginData);
      if (response.data.success) {
        // Store token or session data in localStorage for authentication
        localStorage.setItem('userToken', response.data.token); // Store the token in localStorage
        navigate('/dashboard'); // Redirect to dashboard after successful login
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('An error occurred during login.');
    }
  };

  return (
    <div className="logincss">
      <div className={`wrapper ${isActive ? 'active' : ''}`}>
        <span className="rotate-bg"></span>
        <span className="rotate-bg2"></span>

        {/* Login Form */}
        <div className="form-box login">
          <h2 className="title animation" style={{ '--i': 0, '--j': 21 }}>Login</h2>
          <form onSubmit={handleLoginSubmit}>
            <div className="input-box animation" style={{ '--i': 1, '--j': 22 }}>
              <input
                type="text"
                name="username"
                value={loginData.username}
                onChange={handleLoginChange}
                required
              />
              <label>Username</label>
              <i className='bx bxs-user'></i>
            </div>

            <div className="input-box animation" style={{ '--i': 2, '--j': 23 }}>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
              <label>Password</label>
              <i className='bx bxs-lock-alt'></i>
            </div>

            <button type="submit" className="btn animation" style={{ '--i': 3, '--j': 24 }}>
              Login
            </button>

            {error && <p className="error-msg">{error}</p>}

            <div className="linkTxt animation" style={{ '--i': 5, '--j': 25 }}>
              <p>Don't have an account? <span className="register-link" onClick={handleRegisterClick} style={{ textDecoration: 'underline' }}>Sign Up</span></p>
            </div>
          </form>
        </div>

        <div className="info-text login">
          <h2 className="animation" style={{ '--i': 0, '--j': 20 }}>Welcome Back!</h2>
          <p className="animation" style={{ '--i': 1, '--j': 21 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti,rem?</p>
        </div>

        {/* Register Form */}
        <div className="form-box register">
          <h2 className="title animation" style={{ '--i': 17, '--j': 0 }}>Sign Up</h2>
          <form onSubmit={handleRegisterSubmit}>
            <div className="input-box animation" style={{ '--i': 18, '--j': 1 }}>
              <input
                type="text"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                required
              />
              <label>Username</label>
              <i className='bx bxs-user'></i>
            </div>

            <div className="input-box animation" style={{ '--i': 19, '--j': 2 }}>
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
              />
              <label>Email</label>
              <i className='bx bxs-envelope'></i>
            </div>

            <div className="input-box animation" style={{ '--i': 20, '--j': 3 }}>
              <input
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
              />
              <label>Password</label>
              <i className='bx bxs-lock-alt'></i>
            </div>

            <button type="submit" className="btn animation" style={{ '--i': 21, '--j': 4 }}>
              Sign Up
            </button>

            {error && <p className="error-msg">{error}</p>}

            <div className="linkTxt animation" style={{ '--i': 22, '--j': 5 }}>
              <p>Already have an account? <span className="login-link" onClick={handleLoginClick} style={{ textDecoration: 'underline' }}>Login</span></p>
            </div>
          </form>
        </div>

        <div className="info-text register">
          <h2 className="animation" style={{ '--i': 17, '--j': 0 }}>Welcome Back!</h2>
          <p className="animation" style={{ '--i': 18, '--j': 1 }}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti,rem?</p>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
