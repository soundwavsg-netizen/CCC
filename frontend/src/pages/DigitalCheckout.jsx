import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './DigitalCheckout.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DigitalCheckout = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productSlug = searchParams.get('product') || productId;
      
      const response = await axios.get(`${BACKEND_URL}/api/project62/products/${productSlug}`);
      setProduct(response.data.product);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Product not found');
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError('');

    try {
      const originUrl = window.location.origin;
      const response = await axios.post(`${BACKEND_URL}/api/project62/checkout/digital`, {
        product_id: product.product_id_slug,
        origin_url: originUrl
      });

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to create checkout session. Please try again.');
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="digital-checkout-page">
        <div className="checkout-container">
          <div className="loading-state">Loading product...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="digital-checkout-page">
        <div className="checkout-container">
          <div className="error-state">
            <h2>{error || 'Product not found'}</h2>
            <button onClick={() => navigate('/project62')}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="digital-checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="back-button" onClick={() => navigate('/project62')}>← Back to Project 62</button>
          <h1>{product.name}</h1>
          <p className="subtitle">{product.description}</p>
        </div>

        <div className="checkout-content">
          <div className="product-details">
            <div className="product-image">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} />
              ) : (
                <div className="no-image">Digital Product</div>
              )}
            </div>

            <div className="product-info">
              <h2>What's Included</h2>
              {product.description && (
                <div className="product-description">
                  <p>{product.description}</p>
                </div>
              )}
              
              <div className="digital-benefits">
                <h3>Digital Delivery</h3>
                <ul>
                  <li>✓ Instant access after payment</li>
                  <li>✓ Download PDF to any device</li>
                  <li>✓ Lifetime access</li>
                  <li>✓ Print-friendly format</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Product:</span>
              <span>{product.name}</span>
            </div>
            
            <div className="summary-row">
              <span>Format:</span>
              <span>Digital PDF</span>
            </div>
            
            <div className="summary-row total">
              <span><strong>Total:</strong></span>
              <span><strong>${product.price.toFixed(2)} SGD</strong></span>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              className="checkout-button" 
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? 'Processing...' : `Proceed to Payment - $${product.price.toFixed(2)}`}
            </button>

            <div className="security-note">
              <p>🔒 Secure payment powered by Stripe</p>
              <p>Your payment information is encrypted and secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalCheckout;