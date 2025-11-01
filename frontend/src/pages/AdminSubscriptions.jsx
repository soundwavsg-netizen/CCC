import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminSubscriptions.css';

const AdminSubscriptions = () => {
  const { token } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Subscription form
  const [showForm, setShowForm] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({
    plan_name: '',
    meals_per_day: 1,
    pricing_tiers: [{ weeks: 1, price_per_meal: '' }],
    delivery_fee: '',
    description: '',
    is_active: true,
    stripe_plan_id: '',
    auto_renew_enabled: false
  });
  const [editingSubscription, setEditingSubscription] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/subscriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      console.error('Fetch subscriptions error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = editingSubscription 
        ? `${BACKEND_URL}/api/project62/admin/subscriptions/${editingSubscription.subscription_id}`
        : `${BACKEND_URL}/api/project62/admin/subscriptions`;
      
      const method = editingSubscription ? 'PUT' : 'POST';
      
      // Filter out empty pricing tiers and parse values
      const payload = {
        ...subscriptionForm,
        pricing_tiers: subscriptionForm.pricing_tiers
          .filter(tier => tier.weeks && tier.price_per_meal)
          .map(tier => ({
            weeks: parseInt(tier.weeks),
            price_per_meal: parseFloat(tier.price_per_meal)
          })),
        meals_per_day: parseInt(subscriptionForm.meals_per_day),
        delivery_fee: parseFloat(subscriptionForm.delivery_fee)
      };
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save subscription');
      }

      setSuccess(editingSubscription ? 'Subscription updated!' : 'Subscription created!');
      setShowForm(false);
      resetForm();
      await fetchSubscriptions(); // Wait for refresh
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan?')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Subscription deleted');
        fetchSubscriptions();
      }
    } catch (err) {
      setError('Failed to delete subscription');
    }
  };

  const handleImageUpload = async (subscriptionId, file) => {
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/subscriptions/${subscriptionId}/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setSuccess('Image uploaded successfully');
        fetchSubscriptions();
      } else {
        throw new Error('Image upload failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubscriptionForm({
      plan_name: '',
      meals_per_day: 1,
      pricing_tiers: [{ weeks: 1, price_per_meal: '' }],
      delivery_fee: '',
      description: '',
      is_active: true,
      stripe_plan_id: '',
      auto_renew_enabled: false
    });
    setEditingSubscription(null);
  };

  const startEdit = (subscription) => {
    setEditingSubscription(subscription);
    setSubscriptionForm({
      plan_name: subscription.plan_name,
      meals_per_day: subscription.meals_per_day,
      pricing_tiers: subscription.pricing_tiers || [{ weeks: 1, price_per_meal: '' }],
      delivery_fee: subscription.delivery_fee.toString(),
      description: subscription.description,
      is_active: subscription.is_active,
      stripe_plan_id: subscription.stripe_plan_id || '',
      auto_renew_enabled: subscription.auto_renew_enabled || false
    });
    setShowForm(true);
  };

  const addPricingTier = () => {
    setSubscriptionForm({
      ...subscriptionForm,
      pricing_tiers: [...subscriptionForm.pricing_tiers, { weeks: '', price_per_meal: '' }]
    });
  };

  const removePricingTier = (index) => {
    const newTiers = subscriptionForm.pricing_tiers.filter((_, i) => i !== index);
    setSubscriptionForm({ ...subscriptionForm, pricing_tiers: newTiers });
  };

  const updatePricingTier = (index, field, value) => {
    const newTiers = [...subscriptionForm.pricing_tiers];
    newTiers[index][field] = value;
    setSubscriptionForm({ ...subscriptionForm, pricing_tiers: newTiers });
  };

  return (
    <div className="admin-subscriptions-container">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="section-header">
        <h2>Meal-Prep Subscription Plans</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Subscription Plan
        </button>
      </div>

      {/* Subscription Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSubscription ? 'Edit Subscription Plan' : 'Create Subscription Plan'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="subscription-form">
              <div className="form-group">
                <label>Plan Name *</label>
                <input
                  type="text"
                  value={subscriptionForm.plan_name}
                  onChange={(e) => setSubscriptionForm({...subscriptionForm, plan_name: e.target.value})}
                  placeholder="e.g., 1 Meal/Day Plan"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={subscriptionForm.description}
                  onChange={(e) => setSubscriptionForm({...subscriptionForm, description: e.target.value})}
                  rows="3"
                  placeholder="Brief description shown on landing page"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Meals Per Day *</label>
                  <select
                    value={subscriptionForm.meals_per_day}
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, meals_per_day: e.target.value})}
                    required
                  >
                    <option value={1}>1 Meal/Day</option>
                    <option value={2}>2 Meals/Day</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Delivery Fee per Week (SGD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={subscriptionForm.delivery_fee}
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, delivery_fee: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Pricing Tiers (volume discounts) *</label>
                <small>Set different prices based on number of weeks purchased. More weeks = lower price per meal.</small>
                
                <div className="pricing-tiers-container">
                  {subscriptionForm.pricing_tiers.map((tier, index) => (
                    <div key={index} className="pricing-tier-row">
                      <div className="tier-input">
                        <label>Weeks</label>
                        <input
                          type="number"
                          value={tier.weeks}
                          onChange={(e) => updatePricingTier(index, 'weeks', e.target.value)}
                          placeholder="e.g., 1"
                          required
                        />
                      </div>
                      <div className="tier-input">
                        <label>Price/Meal (SGD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={tier.price_per_meal}
                          onChange={(e) => updatePricingTier(index, 'price_per_meal', e.target.value)}
                          placeholder="e.g., 15.00"
                          required
                        />
                      </div>
                      {subscriptionForm.pricing_tiers.length > 1 && (
                        <button 
                          type="button" 
                          className="btn-remove-tier"
                          onClick={() => removePricingTier(index)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={addPricingTier}
                  >
                    + Add Week Tier
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Stripe Plan ID (optional)</label>
                <input
                  type="text"
                  value={subscriptionForm.stripe_plan_id}
                  onChange={(e) => setSubscriptionForm({...subscriptionForm, stripe_plan_id: e.target.value})}
                  placeholder="price_... or plan_..."
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={subscriptionForm.is_active}
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, is_active: e.target.checked})}
                  />
                  Active (visible on landing page)
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={subscriptionForm.auto_renew_enabled}
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, auto_renew_enabled: e.target.checked})}
                  />
                  Enable Auto-Renew (weekly recurring billing)
                </label>
                <small>⚠️ If enabled, customers will be charged weekly automatically</small>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (editingSubscription ? 'Update Plan' : 'Create Plan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      <div className="subscriptions-grid">
        {subscriptions.map(subscription => (
          <div key={subscription.subscription_id} className={`subscription-card ${!subscription.is_active ? 'inactive' : ''}`}>
            <div className="subscription-image">
              {subscription.image_url ? (
                <img src={subscription.image_url} alt={subscription.plan_name} />
              ) : (
                <div className="placeholder-image">🍱</div>
              )}
            </div>
            <div className="subscription-details">
              <h3>{subscription.plan_name}</h3>
              <p>{subscription.description}</p>
              <div className="subscription-meta">
                <span className="price-badge">${subscription.price_per_meal}/meal</span>
                <span className="delivery-badge">+${subscription.delivery_fee} delivery/week</span>
              </div>
              <div className="weeks-available">
                <strong>Weeks:</strong> {subscription.weeks_available.join(', ')}
              </div>
              {subscription.auto_renew_enabled && (
                <div className="renew-badge">🔄 Auto-Renew Enabled</div>
              )}
              <div className="status-badge">
                {subscription.is_active ? '✅ Active' : '❌ Inactive'}
              </div>
            </div>
            <div className="subscription-actions">
              <button className="btn-icon" onClick={() => startEdit(subscription)} title="Edit">
                ✏️
              </button>
              <label className="btn-icon" title="Upload Image">
                📷
                <input
                  type="file"
                  accept="image/*"
                  style={{display: 'none'}}
                  onChange={(e) => handleImageUpload(subscription.subscription_id, e.target.files[0])}
                />
              </label>
              <button 
                className="btn-icon delete" 
                onClick={() => handleDelete(subscription.subscription_id)}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {subscriptions.length === 0 && (
        <div className="empty-state">
          <p>No subscription plans yet. Create your first plan!</p>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
