import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './MealPrepCheckout.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MEAL_PREP_PRICING = {
  '1_week': { 1: 12.00, 2: 12.00 },
  '2_weeks': { 1: 11.50, 2: 11.50 },
  '4_weeks': { 1: 10.80, 2: 10.80 },
  '6_weeks': { 1: 10.00, 2: 10.00 }
};

const DELIVERY_FEE = 20.00;

const MealPrepCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [duration, setDuration] = useState(searchParams.get('duration') || '4_weeks');
  const [mealsPerDay, setMealsPerDay] = useState(parseInt(searchParams.get('meals')) || 1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    startDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculatePricing = () => {
    const durationMap = { '1_week': 1, '2_weeks': 2, '4_weeks': 4, '6_weeks': 6 };
    const weeks = durationMap[duration];
    const pricePerMeal = MEAL_PREP_PRICING[duration][mealsPerDay];
    const totalMeals = weeks * 6 * mealsPerDay;
    const mealCost = totalMeals * pricePerMeal;
    const deliveryCost = weeks * DELIVERY_FEE;
    const totalCost = mealCost + deliveryCost;
    
    return {
      pricePerMeal: pricePerMeal.toFixed(2),
      totalMeals,
      weeks,
      mealCost: mealCost.toFixed(2),
      deliveryCost: deliveryCost.toFixed(2),
      totalCost: totalCost.toFixed(2)
    };
  };

  const pricing = calculatePricing();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const originUrl = window.location.origin;
      const response = await axios.post(`${BACKEND_URL}/api/project62/checkout/meal-prep`, {
        duration: duration,
        meals_per_day: mealsPerDay,
        origin_url: originUrl,
        ...formData
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

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="meal-prep-checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="back-button" onClick={() => navigate('/project62')}>
            ← Back to Project 62
          </button>
          <h1>Meal-Prep Subscription Checkout</h1>
          <p className="subtitle">Get your meals delivered fresh every week</p>
        </div>

        <div className="checkout-content">
          {/* Plan Configuration */}
          <div className="plan-configuration">
            <h2>Configure Your Plan</h2>
            
            <div className="config-group">
              <label>Duration</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="1_week">1 Week</option>
                <option value="2_weeks">2 Weeks</option>
                <option value="4_weeks">4 Weeks</option>
                <option value="6_weeks">6 Weeks</option>
              </select>
            </div>

            <div className="config-group">
              <label>Meals Per Day</label>
              <select value={mealsPerDay} onChange={(e) => setMealsPerDay(parseInt(e.target.value))}>
                <option value="1">1 Meal/Day</option>
                <option value="2">2 Meals/Day</option>
              </select>
            </div>

            <div className="pricing-breakdown">
              <h3>Pricing Breakdown</h3>
              <div className="breakdown-row">
                <span>Price per meal:</span>
                <span>${pricing.pricePerMeal}</span>
              </div>
              <div className="breakdown-row">
                <span>Total meals ({pricing.totalMeals}):</span>
                <span>${pricing.mealCost}</span>
              </div>
              <div className="breakdown-row">
                <span>Delivery ({pricing.weeks} weeks × $20):</span>
                <span>${pricing.deliveryCost}</span>
              </div>
              <div className="breakdown-row total">
                <span>Total:</span>
                <span>${pricing.totalCost} SGD</span>
              </div>
            </div>
          </div>

          {/* Delivery Information Form */}
          <div className="delivery-form">
            <h2>Delivery Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+65 XXXX XXXX"
                />
              </div>

              <div className="form-group">
                <label>Delivery Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Enter your full delivery address including postal code"
                />
              </div>

              <div className="form-group">
                <label>Preferred Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  min={minDate}
                />
                <small>First delivery will be on this date</small>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="checkout-button"
                disabled={loading}
              >
                {loading ? 'Processing...' : `Proceed to Payment - $${pricing.totalCost} SGD`}
              </button>

              <div className="secure-checkout">
                <span className="lock-icon">🔒</span>
                <span>Secure checkout powered by Stripe</span>
              </div>
            </form>
          </div>
        </div>

        {/* Important Information */}
        <div className="important-info">
          <h3>📦 Delivery Information</h3>
          <ul>
            <li>Meals are delivered once a week on your scheduled day</li>
            <li>Each delivery contains meals for 6 days (one rest day)</li>
            <li>All meals are freshly prepared and properly packaged</li>
            <li>Storage instructions included with each delivery</li>
            <li>You can pause or modify your subscription anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MealPrepCheckout;
