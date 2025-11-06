import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './MealPrepCheckout.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MealPrepCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [duration, setDuration] = useState(searchParams.get('weeks') || searchParams.get('duration') || '4');
  const [mealsPerDay, setMealsPerDay] = useState(
    searchParams.get('plan') === '2meal' ? 2 : 
    searchParams.get('plan') === '1meal' ? 1 : 
    parseInt(searchParams.get('meals')) || 1
  );
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    emailConfirm: '',
    password: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    country: 'Singapore',
    startDate: ''
  });
  const [emailMatchError, setEmailMatchError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(null);

  // Fetch subscription plans on mount
  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  // Fetch and populate user data if logged in
  useEffect(() => {
    if (user && token) {
      fetchUserProfile();
      fetchLoyaltyDiscount();
    }
  }, [user, token]);

  const fetchLoyaltyDiscount = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/project62/customer/subscription`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data && response.data.loyalty) {
        setLoyaltyDiscount({
          tier: response.data.loyalty.tier,
          discount: response.data.loyalty.discount || 0
        });
      }
    } catch (err) {
      console.log('Could not fetch loyalty discount:', err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/project62/customer/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const profile = response.data;
      
      // Parse the full address string
      // Example format: "33 Jervois Road, Petit Jervois, North Block #04-03, Singapore 247657"
      const addressStr = profile.address || '';
      let addressLine1 = '';
      let addressLine2 = '';
      let postalCode = '';
      
      if (addressStr) {
        // Try to extract postal code (6 digits at the end)
        const postalMatch = addressStr.match(/\b(\d{6})\b/);
        if (postalMatch) {
          postalCode = postalMatch[1];
          // Remove postal code and "Singapore" from address
          const withoutPostal = addressStr.replace(/,?\s*Singapore\s*\d{6}$/i, '').trim();
          
          // Split remaining address by comma
          const parts = withoutPostal.split(',').map(p => p.trim());
          
          if (parts.length === 1) {
            // Single line address
            addressLine1 = parts[0];
          } else if (parts.length >= 2) {
            // Multiple parts - first part goes to line1, rest to line2
            addressLine1 = parts[0];
            addressLine2 = parts.slice(1).join(', ');
          }
        } else {
          // No postal code found, just use the address as is
          const parts = addressStr.split(',').map(p => p.trim());
          addressLine1 = parts[0] || '';
          addressLine2 = parts.slice(1).join(', ');
        }
      }
      
      // Auto-fill form with user's saved data
      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
        addressLine1: addressLine1 || prev.addressLine1,
        addressLine2: addressLine2 || prev.addressLine2,
        postalCode: postalCode || prev.postalCode,
        country: profile.country || prev.country
      }));
      
      console.log('✅ User profile loaded and form auto-filled');
    } catch (error) {
      console.log('ℹ️ Could not load user profile (user may not be logged in):', error.message);
      // Don't show error to user - they can still fill the form manually
    }
  };

  // Update duration when selected plan changes to ensure it's valid
  useEffect(() => {
    if (selectedPlan && selectedPlan.pricing_tiers) {
      const availableDurations = selectedPlan.pricing_tiers.map(t => t.weeks);
      const currentDuration = parseInt(duration);
      
      // If current duration is not available, set to the first available or closest option
      if (!availableDurations.includes(currentDuration)) {
        const closestDuration = availableDurations.reduce((prev, curr) => 
          Math.abs(curr - currentDuration) < Math.abs(prev - currentDuration) ? curr : prev
        );
        console.log(`Duration ${currentDuration} not available, setting to ${closestDuration}`);
        setDuration(closestDuration.toString());
      }
    }
  }, [selectedPlan]);

  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true);
      console.log('Fetching subscription plans from:', `${BACKEND_URL}/api/project62/subscriptions/public`);
      const response = await axios.get(`${BACKEND_URL}/api/project62/subscriptions/public`);
      console.log('Subscription plans response:', response.data);
      const plans = response.data.subscriptions || [];
      setSubscriptionPlans(plans);
      
      // Find the correct plan based on meals per day
      const targetPlan = plans.find(p => p.meals_per_day === mealsPerDay);
      
      if (targetPlan) {
        console.log('Selected plan:', targetPlan.plan_name);
        setSelectedPlan(targetPlan);
      } else {
        console.log('Fallback to first plan');
        // Fallback to first available plan
        setSelectedPlan(plans[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to load subscription plans. Please refresh the page.');
      setLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!selectedPlan || !selectedPlan.pricing_tiers) {
      return null;
    }

    // Find the pricing tier for selected duration
    const weeks = parseInt(duration);
    const tier = selectedPlan.pricing_tiers.find(t => t.weeks === weeks);
    
    if (!tier) {
      return null;
    }

    const pricePerMeal = tier.price_per_meal;
    const deliveryFee = selectedPlan.delivery_fee || 20.00;
    const totalMeals = weeks * 6 * mealsPerDay; // 6 days per week
    let mealCost = totalMeals * pricePerMeal;
    const deliveryCost = weeks * deliveryFee;
    
    // Calculate loyalty discount (applies to meal cost only)
    let loyaltyDiscountAmount = 0;
    if (loyaltyDiscount && loyaltyDiscount.discount > 0) {
      loyaltyDiscountAmount = mealCost * (loyaltyDiscount.discount / 100);
      mealCost = mealCost - loyaltyDiscountAmount;
    }
    
    // Calculate coupon discount
    let couponDiscountAmount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        couponDiscountAmount = mealCost * (appliedCoupon.value / 100);
      } else if (appliedCoupon.type === 'fixed') {
        couponDiscountAmount = appliedCoupon.value;
      }
      mealCost = Math.max(0, mealCost - couponDiscountAmount);
    }
    
    const totalCost = mealCost + deliveryCost;
    
    return {
      pricePerMeal: pricePerMeal.toFixed(2),
      totalMeals,
      weeks,
      originalMealCost: (totalMeals * pricePerMeal).toFixed(2),
      mealCost: mealCost.toFixed(2),
      deliveryCost: deliveryCost.toFixed(2),
      loyaltyDiscountAmount: loyaltyDiscountAmount.toFixed(2),
      couponDiscountAmount: couponDiscountAmount.toFixed(2),
      totalCost: totalCost.toFixed(2)
    };
  };

  const pricing = calculatePricing();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/project62/validate-coupon`, {
        code: couponCode.trim().toUpperCase()
      });

      if (response.data.valid) {
        setAppliedCoupon(response.data.coupon);
        setCouponError('');
      } else {
        setCouponError(response.data.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const isWeekend = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isDateTooSoon = (dateString) => {
    const selectedDate = new Date(dateString);
    const minDateObj = new Date(getMinimumDate());
    return selectedDate < minDateObj;
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    
    if (isDateTooSoon(selectedDate)) {
      setError('Please select a date at least 3 business days from today.');
      return;
    }
    
    if (isWeekend(selectedDate)) {
      setError('Delivery is not available on Saturdays and Sundays. Please select a weekday.');
      setFormData(prev => ({ ...prev, startDate: '' }));
      return;
    }
    
    setError('');
    setFormData(prev => ({ ...prev, startDate: selectedDate }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCheckoutLoading(true);
    setError('');

    if (formData.country !== 'Singapore') {
      setError('We currently only deliver within Singapore.');
      setCheckoutLoading(false);
      return;
    }

    const postalCodeRegex = /^\d{6}$/;
    if (!postalCodeRegex.test(formData.postalCode)) {
      setError('Please enter a valid 6-digit Singapore postal code.');
      setCheckoutLoading(false);
      return;
    }

    if (isWeekend(formData.startDate)) {
      setError('Delivery is not available on Saturdays and Sundays.');
      setCheckoutLoading(false);
      return;
    }

    const fullAddress = `${formData.addressLine1}${formData.addressLine2 ? ', ' + formData.addressLine2 : ''}, Singapore ${formData.postalCode}`;

    try {
      const originUrl = window.location.origin;
      const response = await axios.post(`${BACKEND_URL}/api/project62/checkout/meal-prep`, {
        duration: `${duration}_week${duration > 1 ? 's' : ''}`,
        meals_per_day: mealsPerDay,
        origin_url: originUrl,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress,
        start_date: formData.startDate
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

  const getMinimumDate = () => {
    const today = new Date();
    let daysAdded = 0;
    let minDate = new Date(today);

    while (daysAdded < 3) {
      minDate.setDate(minDate.getDate() + 1);
      const dayOfWeek = minDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }

    return minDate.toISOString().split('T')[0];
  };

  const minDate = getMinimumDate();

  // Get available durations from selected plan
  const availableDurations = selectedPlan?.pricing_tiers?.map(t => t.weeks) || [1, 2, 4, 6];

  if (loading) {
    return (
      <div className="meal-prep-checkout-page">
        <div className="checkout-container">
          <div className="loading-state">Loading subscription plans...</div>
        </div>
      </div>
    );
  }

  if (!selectedPlan || !pricing) {
    return (
      <div className="meal-prep-checkout-page">
        <div className="checkout-container">
          <div className="error-state">
            <p>Unable to load subscription plans. Please try again later.</p>
            <button onClick={() => navigate('/project62')}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="meal-prep-checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="back-button" onClick={() => navigate('/project62')}>← Back to Project 62</button>
          <h1>Meal-Prep Subscription Checkout</h1>
          <p className="subtitle">Get your meals delivered fresh every week</p>
        </div>

        <div className="checkout-content">
          <div className="plan-configuration">
            <h2>Configure Your Plan</h2>
            
            <div className="config-group">
              <label>Meals Per Day</label>
              <select value={mealsPerDay} onChange={(e) => {
                const newMealsPerDay = parseInt(e.target.value);
                setMealsPerDay(newMealsPerDay);
                // Update selected plan when meals per day changes
                const newPlan = subscriptionPlans.find(p => p.meals_per_day === newMealsPerDay);
                if (newPlan) {
                  setSelectedPlan(newPlan);
                }
              }}>
                <option value="1">1 Meal/Day</option>
                <option value="2">2 Meals/Day</option>
              </select>
            </div>

            <div className="config-group">
              <label>Select Commitment Duration</label>
              <div className="duration-options">
                {availableDurations.sort((a, b) => a - b).map(weeks => {
                  const tier = selectedPlan?.pricing_tiers?.find(t => t.weeks === weeks);
                  const isSelected = parseInt(duration) === weeks;
                  return (
                    <button
                      key={weeks}
                      type="button"
                      className={`duration-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setDuration(weeks.toString())}
                    >
                      <div className="duration-header">
                        <strong>{weeks} Week{weeks > 1 ? 's' : ''}</strong>
                        {weeks >= 4 && <span className="badge">Best Value</span>}
                      </div>
                      <div className="duration-price">
                        ${tier?.price_per_meal || 0}/meal
                      </div>
                      <div className="duration-details">
                        {weeks * 6 * mealsPerDay} total meals
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pricing-summary">
            <h2>Order Summary</h2>
            
            {/* Meal Details */}
            <div className="pricing-row" style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
              <span>{pricing.totalMeals} meals × ${pricing.pricePerMeal}</span>
              <span>${pricing.originalMealCost}</span>
            </div>
            
            {/* Loyalty Discount */}
            {loyaltyDiscount && loyaltyDiscount.discount > 0 && (
              <div className="pricing-row" style={{ color: '#00b894', fontSize: '14px' }}>
                <span>🎯 {loyaltyDiscount.tier} Member Discount ({loyaltyDiscount.discount}%)</span>
                <span>-${pricing.loyaltyDiscountAmount}</span>
              </div>
            )}
            
            {/* Coupon Section */}
            <div style={{ margin: '15px 0', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                Have a coupon code?
              </label>
              {!appliedCoupon ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    placeholder="Enter code"
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      textTransform: 'uppercase'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#00b894',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#00b894', fontWeight: 'bold' }}>
                    ✓ {appliedCoupon.code} Applied
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
              {couponError && (
                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px' }}>
                  {couponError}
                </div>
              )}
            </div>
            
            {/* Coupon Discount */}
            {appliedCoupon && parseFloat(pricing.couponDiscountAmount) > 0 && (
              <div className="pricing-row" style={{ color: '#00b894', fontSize: '14px' }}>
                <span>🎁 Coupon Discount ({appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `$${appliedCoupon.value}`})</span>
                <span>-${pricing.couponDiscountAmount}</span>
              </div>
            )}
            
            {/* Subtotal after discounts */}
            <div className="pricing-row" style={{ borderTop: '1px dashed #ddd', paddingTop: '10px', marginTop: '10px' }}>
              <span>Meal Subtotal:</span>
              <span>${pricing.mealCost}</span>
            </div>
            
            {/* Delivery Cost */}
            <div className="pricing-row">
              <span>Delivery ({pricing.weeks} weeks):</span>
              <span>${pricing.deliveryCost}</span>
            </div>
            
            {/* Final Total */}
            <div className="pricing-row total" style={{ borderTop: '2px solid #333', paddingTop: '10px', marginTop: '10px', fontSize: '18px' }}>
              <span><strong>Total:</strong></span>
              <span><strong>${pricing.totalCost} SGD</strong></span>
            </div>
          </div>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>Delivery Information</h2>

            {user && formData.name && (
              <div className="info-message">
                ✓ Using your saved profile information. You can edit any field below.
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={(e) => {
                  handleInputChange(e);
                  setEmailMatchError('');
                }} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Confirm Email *</label>
              <input 
                type="email" 
                name="emailConfirm" 
                value={formData.emailConfirm} 
                onChange={(e) => {
                  handleInputChange(e);
                  if (e.target.value && formData.email && e.target.value !== formData.email) {
                    setEmailMatchError('Emails do not match');
                  } else {
                    setEmailMatchError('');
                  }
                }} 
                required 
              />
              {emailMatchError && <small style={{color: 'red'}}>{emailMatchError}</small>}
            </div>

            {!user && (
              <div className="form-group" style={{backgroundColor: '#f0f9ff', padding: '15px', borderRadius: '8px', border: '1px solid #00b894'}}>
                <label>Create Password (Optional but Recommended)</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  placeholder="Create a password to access your account"
                  minLength="6"
                />
                <small style={{display: 'block', marginTop: '5px', color: '#666'}}>
                  💡 Set a password now to instantly access your customer dashboard after purchase. 
                  If skipped, we'll email you instructions to set up your account.
                </small>
              </div>
            )}

            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label>Address Line 1 *</label>
              <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} placeholder="Block and street name" required />
            </div>

            <div className="form-group">
              <label>Address Line 2</label>
              <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} placeholder="Unit number (optional)" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Postal Code *</label>
                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="6 digits" maxLength="6" required />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input type="text" name="country" value={formData.country} readOnly disabled />
              </div>
            </div>

            <div className="form-group">
              <label>Delivery Start Date *</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleDateChange} min={minDate} required />
              <small>Deliveries are Monday to Friday only. Minimum 3 business days notice required.</small>
            </div>

            {/* Order Summary Before Payment Button */}
            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px', border: '2px solid #00b894' }}>
              <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>📋 Order Summary</h3>
              
              {/* Meal Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                <span>{pricing.totalMeals} meals × ${pricing.pricePerMeal}</span>
                <span>${pricing.originalMealCost}</span>
              </div>
              
              {/* Loyalty Discount */}
              {loyaltyDiscount && loyaltyDiscount.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#00b894' }}>
                  <span>🎯 {loyaltyDiscount.tier} Discount ({loyaltyDiscount.discount}%)</span>
                  <span>-${pricing.loyaltyDiscountAmount}</span>
                </div>
              )}
              
              {/* Coupon Discount */}
              {appliedCoupon && parseFloat(pricing.couponDiscountAmount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#00b894' }}>
                  <span>🎁 {appliedCoupon.code} ({appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `$${appliedCoupon.value}`})</span>
                  <span>-${pricing.couponDiscountAmount}</span>
                </div>
              )}
              
              <div style={{ borderTop: '1px dashed #ccc', margin: '10px 0' }}></div>
              
              {/* Subtotal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span>Meal Subtotal:</span>
                <span>${pricing.mealCost}</span>
              </div>
              
              {/* Delivery */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span>Delivery ({pricing.weeks} weeks):</span>
                <span>${pricing.deliveryCost}</span>
              </div>
              
              <div style={{ borderTop: '2px solid #333', margin: '15px 0' }}></div>
              
              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span style={{ color: '#00b894' }}>${pricing.totalCost} SGD</span>
              </div>
            </div>

            <button type="submit" className="checkout-button" disabled={checkoutLoading} style={{ marginTop: '20px', width: '100%' }}>
              {checkoutLoading ? 'Processing...' : `Proceed to Checkout - $${pricing.totalCost}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MealPrepCheckout;