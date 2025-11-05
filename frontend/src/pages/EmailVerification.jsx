import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './EmailVerification.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/project62/auth/verify-email?token=${token}`);
      
      if (response.data.status === 'success') {
        setStatus('success');
        setMessage(response.data.message);
        setEmail(response.data.email);
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/project62/login');
        }, 3000);
      }
    } catch (error) {
      setStatus('error');
      if (error.response?.data?.detail) {
        setMessage(error.response.data.detail);
      } else {
        setMessage('Email verification failed. Please try again or contact support.');
      }
    }
  };

  return (
    <div className="email-verification-page">
      <div className="verification-container">
        <div className={`verification-card ${status}`}>
          {status === 'verifying' && (
            <>
              <div className="spinner"></div>
              <h2>Verifying Your Email</h2>
              <p>{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="success-icon">✓</div>
              <h2>Email Verified Successfully!</h2>
              <p>{message}</p>
              {email && <p className="email-display">Email: <strong>{email}</strong></p>}
              <p className="redirect-message">Redirecting to login page...</p>
              <button 
                className="btn-primary" 
                onClick={() => navigate('/project62/login')}
              >
                Go to Login Now
              </button>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="error-icon">✕</div>
              <h2>Verification Failed</h2>
              <p className="error-message">{message}</p>
              <div className="action-buttons">
                <button 
                  className="btn-secondary" 
                  onClick={() => navigate('/project62/login')}
                >
                  Back to Login
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => navigate('/project62')}
                >
                  Go to Home
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
