import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginRegister.css';

const LoginRegister = () => {
  // State to toggle between login (false) and register (true) form
  const [isActive, setIsActive] = useState(false);

  // State for password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for form inputs
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loginData, setLoginData] = useState({ emailOrUsername: '', password: '' });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotSuccess('');
    setForgotError('');
    setForgotLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(`${apiUrl}/api/auth/forgot-password`, { email: forgotEmail });
      if (response.data.success) {
        setForgotSuccess(response.data.message || 'Reset link sent successfully.');
        setForgotEmail('');
      } else {
        setForgotError(response.data.message || 'Failed to send reset link.');
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleRegisterClick = () => {
    setError('');
    setIsActive(true);
  };

  const handleLoginClick = () => {
    setError('');
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
    setError('');

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(`${apiUrl}/api/auth/register`, {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password
      });

      if (response.data.success) {
        alert('Registration successful! Please log in.');
        setRegisterData({ username: '', email: '', password: '', confirmPassword: '' });
        setAgreeTerms(false);
        setIsActive(false); // Switch to login form
      } else {
        setError(response.data.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration.');
    }
  };

  // Handle login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        username: loginData.emailOrUsername,
        password: loginData.password
      });

      if (response.data.success) {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('username', response.data.user?.username || 'User');
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or server error.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="auth-page">
      {/* Top Header Bar */}
      <header className="auth-header">
        <div className="header-logo">
          <svg viewBox="0 0 24 24" width="24" height="24" className="logo-svg-icon" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <span className="brand-name">Trustworthy AI</span>
        </div>
        <button className="help-button" aria-label="Help">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </header>

      {/* Main Container */}
      <main className="auth-container">
        <div className={`auth-card-wrapper ${isActive ? 'register-active' : 'login-active'}`}>

          {/* WHITE PANEL (Forms) */}
          <div className="panel white-panel">

            {/* Login Form Content */}
            <div className="form-content-wrapper login-form-content">
              <div className="form-header">
                <h2>Welcome back</h2>
                <p className="subheading">Enter your credentials to access your workspace</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="input-group">
                  <label htmlFor="emailOrUsername">Email Address</label>
                  <input
                    type="text"
                    id="emailOrUsername"
                    name="emailOrUsername"
                    placeholder="Enter your email address"
                    value={loginData.emailOrUsername}
                    onChange={handleLoginChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="loginPassword">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="loginPassword"
                      name="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="forgot-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', color: 'inherit', textDecoration: 'underline' }}
                    onClick={() => {
                      setForgotSuccess('');
                      setForgotError('');
                      setShowForgotModal(true);
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                {error && !isActive && <div className="form-error-message">{error}</div>}

                <button type="submit" className="submit-btn">
                  Sign In
                </button>

                <p className="toggle-view-text">
                  New to Trustworthy AI? <span className="toggle-link" onClick={handleRegisterClick}>Create an account</span>
                </p>
              </form>
            </div>

            {/* Register Form Content */}
            <div className="form-content-wrapper register-form-content">
              <div className="form-header">
                <h2>Get Started</h2>
                <p className="subheading">Experience the power of secure enterprise AI.</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="auth-form">
                <div className="input-group">
                  <label htmlFor="username">Full Name</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Enter your full name"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="email" className="label-with-sub">
                    <span>Email Address</span>
                    <span className="label-subtext">Work email preferred</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="registerPassword">Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="registerPassword"
                        name="password"
                        placeholder="Password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="confirmPassword">Confirm</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? (
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      required
                    />
                    <span className="terms-text">
                      I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
                    </span>
                  </label>
                </div>

                {error && isActive && <div className="form-error-message">{error}</div>}

                <button type="submit" className="submit-btn">
                  Create Account &rarr;
                </button>

                <p className="toggle-view-text">
                  Already have an account? <span className="toggle-link" onClick={handleLoginClick}>Login &rsaquo;</span>
                </p>
              </form>
            </div>

          </div>

          {/* DARK PANEL (Info & Branding) */}
          <div className="panel dark-panel">
            <div className="dark-panel-curve-bg"></div>

            {/* Login Mode Info Panel Content */}
            <div className="info-content-wrapper login-info-content">
              <div className="info-logo-circle">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </div>
              <h1 className="info-title">Engineer Intelligence with Trust.</h1>
              <p className="info-desc">
                The platform for developers to build, test, and deploy reliable AI systems at scale.
              </p>
              <div className="carousel-indicators">
                <span className="dot active"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
              <div className="info-footer-tag" style={{ alignSelf: 'flex-end', color: '#0F172A', backgroundColor: '#F1F5F9', padding: '6px 12px', borderRadius: '20px', fontWeight: '600', fontSize: '11px' }}>
                <span>Trusted by 500+ Engineering Teams</span>
              </div>
            </div>

            {/* Register Mode Info Panel Content */}
            <div className="info-content-wrapper register-info-content">
              <span className="future-badge">JOIN THE FUTURE</span>
              <h1 className="info-title font-large">Create your enterprise account.</h1>
              <p className="info-desc">
                Access world-class ethical AI infrastructure built for scaling professional integrity and secure innovation.
              </p>
              <span className="cyan-indicator-line"></span>
              <div className="info-footer-tag badge-tag">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="shield-icon">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>SOC2 Type II Compliant</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer Bar */}
      <footer className="auth-footer">
        <div className="footer-left">
          {isActive ? (
            <span>&copy; 2024 Trustworthy AI. Built for professional integrity.</span>
          ) : (
            <span>&copy; 2024 Trustworthy AI. Professional-grade integrity.</span>
          )}
        </div>
        <div className="footer-right">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#security">Security</a>
          <a href="#help">Help</a>
        </div>
      </footer>

      {showForgotModal && (
        <div className="forgot-modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="forgot-modal-card" style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              &times;
            </button>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: '0 0 8px 0' }}>Reset Password</h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0', lineHeight: '1.4' }}>
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="forgotEmail" style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Email Address</label>
                <input
                  type="email"
                  id="forgotEmail"
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#0F172A',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {forgotError && <div style={{ color: '#DC2626', fontSize: '13px' }}>{forgotError}</div>}
              {forgotSuccess && <div style={{ color: '#15803D', fontSize: '13px' }}>{forgotSuccess}</div>}

              <button
                type="submit"
                disabled={forgotLoading}
                className="submit-btn"
                style={{
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  marginTop: '8px',
                  width: '100%'
                }}
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginRegister;
