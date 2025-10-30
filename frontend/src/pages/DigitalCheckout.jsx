import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DigitalCheckout.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PRODUCTS = {
  starter: {
    name: '6-Week Transformation Plan',
    price: 14.90,
    description: 'Complete transformation plan with grocery guide and recipes',
    features: [
      'Full 6-week meal plan',
      'Grocery shopping lists',
      'Recipe instructions',
      'Nutrition breakdown',
      'Weekly progress tracker'
    ]
  },
  custom: {
    name: 'Custom Plan with Ian',
    price: 29.90,
    description: 'Personalized meal plan with one-on-one consultation',
    features: [
      'Personalized meal planning',
      'One-on-one chat consultation with Ian',
      'Customized to your preferences',
      'Dietary restrictions accommodated',
      'Ongoing email support'
    ]
  }
};

const DigitalCheckout = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const product = PRODUCTS[productId];

  useEffect(() => {
    if (!product) {
      navigate('/project62');
    }
  }, [product, navigate]);

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const originUrl = window.location.origin;
      const response = await axios.post(`${BACKEND_URL}/api/project62/checkout/digital`, {
        product_id: productId,
        origin_url: originUrl
      });

      // Redirect to Stripe checkout
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to create checkout session. Please try again.');
      setLoading(false);
    }
  };

  if (!product) {
    return null;
  }

  return (
    <div className="digital-checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="back-button" onClick={() => navigate('/project62')}>
            ← Back to Project 62
          </button>
          <h1>Complete Your Purchase</h1>
        </div>

        <div className="checkout-content">
          {/* Product Summary */}
          <div className="product-summary">
            <h2>{product.name}</h2>
            <p className="product-description">{product.description}</p>
            
            <div className="product-features">
              <h3>What's Included:</h3>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>
                    <span className="checkmark">✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="price-summary">
              <div className="price-row">
                <span>Product Price:</span>
                <span className="price">${product.price.toFixed(2)} SGD</span>
              </div>
              <div className="price-row total">
                <span>Total:</span>
                <span className="price">${product.price.toFixed(2)} SGD</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="payment-section">
            <h3>Payment Method</h3>
            <p className="payment-info">
              You'll be redirected to our secure payment processor (Stripe) to complete your purchase.
            </p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button 
              className="checkout-button"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay $${product.price.toFixed(2)} SGD`}
            </button>

            <div className="secure-checkout">
              <span className="lock-icon">🔒</span>
              <span>Secure checkout powered by Stripe</span>
            </div>

            <div className="guarantee">
              <p>💯 <strong>100% Money-Back Guarantee</strong></p>
              <p className="guarantee-text">
                Not satisfied? Get a full refund within 14 days, no questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* Alternative Payment */}
        <div className="alternative-payment">
          <h3>Alternative Payment: PayNow</h3>
          <p>Prefer to pay via PayNow? Scan the QR code below and email us at project62@gmail.com with your payment confirmation.</p>
          <img 
            src="/api/project62/assets/paynow-qr" 
            alt="PayNow QR Code" 
            className="paynow-qr"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      </div>
    </div>
  );
};

export default DigitalCheckout;
