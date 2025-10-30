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
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    country: 'Singapore',
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

  // Check if a date is Saturday or Sunday
  const isWeekend = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };

  // Check if date is within minimum 3 business days
  const isDateTooSoon = (dateString) => {
    const selectedDate = new Date(dateString);
    const minDateObj = new Date(getMinimumDate());
    return selectedDate < minDateObj;
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    
    // Validate: not too soon
    if (isDateTooSoon(selectedDate)) {
      setError('Please select a date at least 3 business days from today.');
      return;
    }
    
    // Validate: not weekend
    if (isWeekend(selectedDate)) {
      setError('Delivery is not available on Saturdays and Sundays. Please select a weekday.');
      setFormData(prev => ({ ...prev, startDate: '' }));
      return;
    }
    
    // Valid date
    setError('');
    setFormData(prev => ({ ...prev, startDate: selectedDate }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate Singapore delivery only
    if (formData.country !== 'Singapore') {
      setError('We currently only deliver within Singapore. Please ensure your delivery address is in Singapore.');
      setLoading(false);
      return;
    }

    // Validate postal code (Singapore format: 6 digits)
    const postalCodeRegex = /^\d{6}$/;
    if (!postalCodeRegex.test(formData.postalCode)) {
      setError('Please enter a valid 6-digit Singapore postal code.');
      setLoading(false);
      return;
    }

    // Validate start date (no weekends)
    if (isWeekend(formData.startDate)) {
      setError('Delivery is not available on Saturdays and Sundays. Please select a weekday.');
      setLoading(false);
      return;
    }

    // Construct full address
    const fullAddress = `${formData.addressLine1}${formData.addressLine2 ? ', ' + formData.addressLine2 : ''}, Singapore ${formData.postalCode}`;

    try {
      const originUrl = window.location.origin;
      const response = await axios.post(`${BACKEND_URL}/api/project62/checkout/meal-prep`, {
        duration: duration,
        meals_per_day: mealsPerDay,
        origin_url: originUrl,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress,
        start_date: formData.startDate
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

  // Set minimum date to 3 business days from now (excluding weekends)
  const getMinimumDate = () => {
    const today = new Date();
    let daysAdded = 0;
    let minDate = new Date(today);

    while (daysAdded < 3) {
      minDate.setDate(minDate.getDate() + 1);
      const dayOfWeek = minDate.getDay();
      // Skip weekends
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }

    return minDate.toISOString().split('T')[0];
  };

  const minDate = getMinimumDate();

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
                <label>Address Line 1 *</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  required
                  placeholder="Street address, building name, unit number"
                />
              </div>

              <div className="form-group">
                <label>Address Line 2 (Optional)</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  placeholder="Additional address information"
                />
              </div>

              <div className="form-group">
                <label>Postal Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                  placeholder="6-digit postal code"
                  maxLength="6"
                  pattern="\d{6}"
                />
                <small>Singapore postal code only (6 digits)</small>
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value="Singapore"
                  disabled
                  style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                />
                <small>We currently deliver within Singapore only</small>
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
                <small>Earliest delivery: 3 business days from today (No Saturday/Sunday delivery)</small>
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
            <li>Each delivery contains meals for 6 days (one rest day per week)</li>
            <li>All meals are freshly prepared and properly packaged for freshness</li>
            <li>Storage and heating-up instructions included with each delivery</li>
            <li>Deliveries available Monday-Friday only (No weekend delivery)</li>
            <li>Minimum 3 business days' notice required for first delivery</li>
          </ul>
          <p style={{ marginTop: '20px', padding: '15px', background: '#f0fff9', borderLeft: '4px solid #00b894', borderRadius: '8px' }}>
            <strong>Note:</strong> Need to pause or modify your subscription? Contact us at <a href="mailto:project62@gmail.com" style={{ color: '#00b894' }}>project62@gmail.com</a> at least 2 days before your next delivery.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MealPrepCheckout;
