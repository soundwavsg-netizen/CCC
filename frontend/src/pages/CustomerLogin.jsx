import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CustomerLogin.css';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, sendMagicLink, verifyMagicLink, isAuthenticated } = useAuth();

  const [mode, setMode] = useState('login'); // 'login', 'register', 'magic'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check for magic link token in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      handleMagicLinkVerification(token);
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/project62/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleMagicLinkVerification = async (token) => {
    setLoading(true);
    const result = await verifyMagicLink(token);
    
    if (result.success) {
      navigate('/project62/dashboard');
    } else {
      setError(result.error || 'Invalid or expired magic link');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/project62/dashboard');
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name || !formData.phone) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await register(formData.email, formData.password, formData.name, formData.phone);
    
    if (result.success) {
      navigate('/project62/dashboard');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await sendMagicLink(formData.email);
    
    if (result.success) {
      setSuccess(result.message || 'Magic link sent! Check your email.');
    } else {
      setError(result.error || 'Failed to send magic link.');
    }
    setLoading(false);
  };

  return (
    <div className="customer-login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Project 62</h1>
          <p className="subtitle">Your Transformation Journey</p>
        </div>

        <div className="mode-tabs">
          <button 
            className={mode === 'login' ? 'tab active' : 'tab'}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button 
            className={mode === 'register' ? 'tab active' : 'tab'}
            onClick={() => setMode('register')}
          >
            Sign Up
          </button>
          <button 
            className={mode === 'magic' ? 'tab active' : 'tab'}
            onClick={() => setMode('magic')}
          >
            Magic Link
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ian Tang"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+65 9123 4567"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                minLength="6"
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {mode === 'magic' && (
          <form onSubmit={handleMagicLink} className="login-form">
            <div className="magic-link-info">
              <p>Enter your email and we'll send you a secure login link.</p>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>
            <a href="/project62" className="back-link">← Back to Project 62</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
