import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccess.css'; // Reuse same styles

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-status-page">
      <div className="status-container">
        <div className="status-icon">⚠️</div>
        <h1>Payment Cancelled</h1>
        <p className="success-subtitle">
          Your payment was not completed. No charges were made to your account.
        </p>

        <div className="order-details">
          <h2>What Happened?</h2>
          <p style={{ textAlign: 'left', margin: 0 }}>
            You cancelled the payment process before it was completed. This is completely normal and happens when:
          </p>
          <ul style={{ marginTop: '15px' }}>
            <li>You clicked the "Back" button during checkout</li>
            <li>You closed the payment window</li>
            <li>The session timed out</li>
          </ul>
        </div>

        <div className="next-steps">
          <h3>Want to Try Again?</h3>
          <p>
            No problem! Your cart is still ready. You can return to complete your purchase whenever you're ready.
          </p>
        </div>

        <div className="action-buttons">
          <button className="btn-primary" onClick={() => navigate('/project62')}>
            Return to Home
          </button>
          <button className="btn-secondary" onClick={() => window.location.href = 'mailto:project62@gmail.com'}>
            Contact Support
          </button>
        </div>

        <p style={{ marginTop: '30px', color: '#999', fontSize: '0.9rem' }}>
          Need help? Email us at <a href="mailto:project62@gmail.com" style={{ color: '#00b894' }}>project62@gmail.com</a>
        </p>
      </div>
    </div>
  );
};

export default PaymentCancel;
