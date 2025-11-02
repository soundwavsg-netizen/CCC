import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductDetail.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/project62/products/${slug}`);
      setProduct(response.data.product);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Product not found');
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (product.type === 'digital') {
      navigate(`/project62/checkout/digital?product=${product.product_id_slug}`);
    } else if (product.type === 'subscription') {
      navigate('/project62/checkout/meal-prep');
    } else {
      // Physical product checkout (to be implemented)
      alert('Physical product checkout coming soon!');
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-state">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="error-state">
          <h2>Product Not Found</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/project62/shop')}>Back to Shop</button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <button className="back-button" onClick={() => navigate('/project62/shop')}>
          ← Back to Shop
        </button>

        <div className="product-detail-content">
          <div className="product-image-section">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="main-image" />
            ) : (
              <div className="no-image">No Image Available</div>
            )}
          </div>

          <div className="product-info-section">
            <span className={`product-type-badge ${product.type}`}>
              {product.type.toUpperCase()}
            </span>
            
            <h1>{product.name}</h1>
            
            <div className="product-price">
              <span className="price-amount">${product.price.toFixed(2)}</span>
              <span className="price-currency">SGD</span>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                {product.tags.map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
            )}

            <button className="buy-now-button" onClick={handleBuyNow}>
              {product.type === 'digital' ? 'Buy Now' : product.type === 'subscription' ? 'Subscribe Now' : 'Add to Cart'}
            </button>

            {product.type === 'digital' && (
              <div className="digital-info">
                <p>✓ Instant digital download after purchase</p>
                <p>✓ PDF format - works on all devices</p>
                <p>✓ Lifetime access</p>
              </div>
            )}

            {product.type === 'subscription' && (
              <div className="subscription-info">
                <p>✓ Fresh meals delivered weekly</p>
                <p>✓ Flexible meal plans</p>
                <p>✓ Cancel anytime</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;