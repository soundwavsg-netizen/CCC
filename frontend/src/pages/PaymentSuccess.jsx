import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PaymentSuccess.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // checking, success, error
  const [paymentData, setPaymentData] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    // Poll payment status
    const checkPaymentStatus = async (attempts = 0) => {
      const maxAttempts = 5;
      
      if (attempts >= maxAttempts) {
        setStatus('error');
        return;
      }

      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/project62/checkout/status/${sessionId}`,
          {
            headers: {
              'Origin': window.location.origin
            }
          }
        );

        if (response.data.payment_status === 'paid') {
          setPaymentData(response.data);
          setStatus('success');
          // Redirect to Project 62 landing page after 3 seconds
          setTimeout(() => {
            navigate('/project62');
          }, 3000);
        } else if (response.data.status === 'expired') {
          setStatus('error');
        } else {
          // Still pending, try again
          setTimeout(() => checkPaymentStatus(attempts + 1), 2000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        if (attempts < maxAttempts - 1) {
          setTimeout(() => checkPaymentStatus(attempts + 1), 2000);
        } else {
          setStatus('error');
        }
      }
    };

    checkPaymentStatus();
  }, [sessionId, navigate]);

  if (status === 'checking') {
    return (
      <div className="payment-status-page">
        <div className="status-container">
          <div className="spinner"></div>
          <h1>Verifying Your Payment...</h1>
          <p>Please wait while we confirm your transaction.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="payment-status-page">
        <div className="status-container error">
          <div className="status-icon">❌</div>
          <h1>Payment Verification Failed</h1>
          <p>We couldn't verify your payment. This could be due to:</p>
          <ul>
            <li>Payment session expired</li>
            <li>Network connection issues</li>
            <li>Invalid session ID</li>
          </ul>
          <p>Please check your email for confirmation or contact support.</p>
          <button className="btn-primary" onClick={() => navigate('/project62')}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-status-page success">
      <div className="status-container">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p className="success-subtitle">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        <div className="order-details">
          <h2>Order Summary</h2>
          <div className="detail-row">
            <span>Amount Paid:</span>
            <span className="amount">
              ${(paymentData?.amount_total / 100).toFixed(2)} {paymentData?.currency?.toUpperCase()}
            </span>
          </div>
          <div className="detail-row">
            <span>Payment Status:</span>
            <span className="status-badge">Paid</span>
          </div>
        </div>

        <div className="next-steps">
          <h3>What Happens Next?</h3>
          <div className="step">
            <span className="step-number">1</span>
            <div className="step-content">
              <h4>Check Your Email</h4>
              <p>You'll receive an order confirmation email within 5 minutes.</p>
            </div>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <div className="step-content">
              <h4>Access Your Account</h4>
              <p>Create or log in to your customer account to track your order.</p>
            </div>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <div className="step-content">
              <h4>Get Support</h4>
              <p>Contact us at project62@gmail.com if you have any questions.</p>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn-primary" onClick={() => navigate('/project62/customer/login')}>
            Go to Customer Portal
          </button>
          <button className="btn-secondary" onClick={() => navigate('/project62')}>
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
