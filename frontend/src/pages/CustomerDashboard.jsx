import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout, isAuthenticated, isAdmin } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addressEdit, setAddressEdit] = useState(false);
  const [addressForm, setAddressForm] = useState({
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    phone: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgradeWeeks, setSelectedUpgradeWeeks] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/project62/login');
      return;
    }
    fetchDashboardData();
    fetchSubscription();
  }, [isAuthenticated, navigate]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/customer/subscription`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (err) {
      console.error('Fetch subscription error:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/customer/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
      
      // Parse existing address if available
      if (data.customer?.address) {
        const addr = data.customer.address;
        // Try to parse address format: "Line1, Line2, Singapore 123456"
        const postalMatch = addr.match(/Singapore\s+(\d{6})/);
        const postalCode = postalMatch ? postalMatch[1] : '';
        
        if (postalCode) {
          const addressWithoutPostal = addr.replace(/, Singapore \d{6}/, '');
          const parts = addressWithoutPostal.split(',').map(p => p.trim());
          setAddressForm({
            addressLine1: parts[0] || '',
            addressLine2: parts[1] || '',
            postalCode: postalCode,
            phone: data.customer?.phone || ''
          });
        } else {
          // Fallback if address format is different
          setAddressForm({
            addressLine1: addr,
            addressLine2: '',
            postalCode: '',
            phone: data.customer?.phone || ''
          });
        }
      } else {
        setAddressForm({
          addressLine1: '',
          addressLine2: '',
          postalCode: '',
          phone: data.customer?.phone || ''
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    try {
      // Validate postal code (Singapore format: 6 digits)
      const postalCodeRegex = /^\d{6}$/;
      if (!postalCodeRegex.test(addressForm.postalCode)) {
        setError('Please enter a valid 6-digit Singapore postal code.');
        return;
      }

      // Construct full address
      const fullAddress = `${addressForm.addressLine1}${addressForm.addressLine2 ? ', ' + addressForm.addressLine2 : ''}, Singapore ${addressForm.postalCode}`;

      const response = await fetch(`${BACKEND_URL}/api/project62/customer/address`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: fullAddress,
          phone: addressForm.phone
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update address');
      }

      setUpdateSuccess('Address updated successfully!');
      setAddressEdit(false);
      setError('');
      fetchDashboardData();
      setTimeout(() => setUpdateSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedUpgradeWeeks) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/customer/subscription/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_commitment_weeks: selectedUpgradeWeeks })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule upgrade');
      }

      const data = await response.json();
      setUpdateSuccess(data.message);
      setShowUpgradeModal(false);
      fetchSubscription();
      setTimeout(() => setUpdateSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelRenewal = async () => {
    if (!window.confirm('Are you sure you want to cancel auto-renewal? Your subscription will end after the current period.')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/customer/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel renewal');
      }

      const data = await response.json();
      setUpdateSuccess(data.message);
      fetchSubscription();
      setTimeout(() => setUpdateSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      'Bronze': '#cd7f32',
      'Silver': '#c0c0c0',
      'Gold': '#ffd700',
      'Platinum': '#e5e4e2'
    };
    return colors[tier] || '#666';
  };

  const getTierMessage = (tier, discount, freeDelivery) => {
    const messages = {
      'Bronze': 'Start your journey — stay consistent to unlock rewards.',
      'Silver': `Silver Member – ${discount}% off your next renewal.`,
      'Gold': `Gold Member – ${discount}% off on renewal.`,
      'Platinum': `Platinum Member – ${discount}% off + free delivery.`
    };
    return messages[tier] || '';
  };

  const getNextTier = (currentWeeks) => {
    if (currentWeeks < 13) return { name: 'Silver', weeksNeeded: 13 - currentWeeks };
    if (currentWeeks < 25) return { name: 'Gold', weeksNeeded: 25 - currentWeeks };
    if (currentWeeks < 37) return { name: 'Platinum', weeksNeeded: 37 - currentWeeks };
    return null;
  };


  const handleLogout = () => {
    logout();
    navigate('/project62');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user?.name || 'Customer'}!</h1>
          <p className="header-subtitle">Your Project 62 Dashboard</p>
        </div>
        <div className="header-actions">
          {isAdmin && (
            <button onClick={() => navigate('/project62/admin')} className="admin-link-btn">
              Admin Panel
            </button>
          )}
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {updateSuccess && <div className="success-banner">{updateSuccess}</div>}

      <div className="dashboard-grid">
        {/* Profile Section */}
        <div className="dashboard-card">
          <h2>Your Profile</h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{user?.email}</span>
            </div>
            <div className="info-row">
              <span className="label">Name:</span>
              <span className="value">{dashboardData?.customer?.name || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Phone:</span>
              {addressEdit ? (
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="edit-input"
                  placeholder="+65 9123 4567"
                />
              ) : (
                <span className="value">{dashboardData?.customer?.phone || 'Not set'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="label">Delivery Address:</span>
              {addressEdit ? (
                <div className="address-form">
                  <input
                    type="text"
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                    className="edit-input"
                    placeholder="Address Line 1 (e.g., Block 123, #01-45)"
                    required
                  />
                  <input
                    type="text"
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    className="edit-input"
                    placeholder="Address Line 2 (Optional)"
                  />
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="edit-input"
                    placeholder="Postal Code (6 digits)"
                    maxLength="6"
                    pattern="\d{6}"
                    required
                  />
                  <div className="country-display">
                    <span>🇸🇬 Singapore</span>
                  </div>
                </div>
              ) : (
                <span className="value">{dashboardData?.customer?.address || 'Not set'}</span>
              )}
            </div>
            {addressEdit ? (
              <div className="edit-actions">
                <button onClick={handleUpdateAddress} className="save-btn">Save Changes</button>
                <button onClick={() => setAddressEdit(false)} className="cancel-btn">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setAddressEdit(true)} className="edit-btn">Edit Address</button>
            )}
          </div>
        </div>

        {/* Subscription & Loyalty Section */}
        <div className="dashboard-card subscription-card">
          <h2>Your Subscription & Loyalty Status</h2>
          
          {subscriptionData && subscriptionData.status !== 'no_subscription' ? (
            <>
              {/* Loyalty Tier Badge */}
              <div className="loyalty-tier-section">
                <div 
                  className="tier-badge" 
                  style={{ 
                    backgroundColor: getTierColor(subscriptionData.loyalty.tier),
                    color: subscriptionData.loyalty.tier === 'Gold' ? '#000' : '#fff'
                  }}
                >
                  <span className="tier-icon">⭐</span>
                  <span className="tier-name">{subscriptionData.loyalty.tier} Member</span>
                </div>
                <p className="tier-message">{getTierMessage(
                  subscriptionData.loyalty.tier, 
                  subscriptionData.loyalty.discount,
                  subscriptionData.loyalty.free_delivery
                )}</p>
              </div>

              {/* Progress Bar */}
              {getNextTier(subscriptionData.loyalty.total_weeks) && (
                <div className="loyalty-progress">
                  <div className="progress-info">
                    <span className="progress-label">
                      {subscriptionData.loyalty.total_weeks} / {
                        subscriptionData.loyalty.total_weeks < 13 ? 13 :
                        subscriptionData.loyalty.total_weeks < 25 ? 25 : 37
                      } weeks
                    </span>
                    <span className="next-tier">
                      {getNextTier(subscriptionData.loyalty.total_weeks).weeksNeeded} weeks to {getNextTier(subscriptionData.loyalty.total_weeks).name}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(subscriptionData.loyalty.total_weeks / (
                          subscriptionData.loyalty.total_weeks < 13 ? 13 :
                          subscriptionData.loyalty.total_weeks < 25 ? 25 : 37
                        )) * 100}%`,
                        backgroundColor: getTierColor(subscriptionData.loyalty.tier)
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Current Subscription Details */}
              <div className="subscription-details">
                <h3>Current Plan</h3>
                <div className="subscription-info">
                  <div className="info-item">
                    <span className="label">Plan:</span>
                    <span className="value">{subscriptionData.subscription.plan_name || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Meals per Day:</span>
                    <span className="value">{subscriptionData.subscription.meals_per_day || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Commitment:</span>
                    <span className="value">{subscriptionData.subscription.commitment_weeks || 'N/A'} weeks</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Price per Meal:</span>
                    <span className="value">${subscriptionData.subscription.price_per_meal || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Next Billing:</span>
                    <span className="value">{subscriptionData.subscription.next_billing_date || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Auto-Renew:</span>
                    <span className={`value ${subscriptionData.subscription.auto_renew ? 'active-status' : 'inactive-status'}`}>
                      {subscriptionData.subscription.auto_renew ? '✓ Enabled' : '✗ Disabled'}
                    </span>
                  </div>
                </div>

                {/* Pending Upgrade */}
                {subscriptionData.subscription.pending_upgrade && (
                  <div className="pending-upgrade-notice">
                    <strong>⏳ Upgrade Scheduled:</strong> Switching to {subscriptionData.subscription.pending_upgrade.commitment_weeks} weeks 
                    at ${subscriptionData.subscription.pending_upgrade.price_per_meal}/meal on {subscriptionData.subscription.pending_upgrade.effective_date}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="subscription-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  Change Plan
                </button>
                {subscriptionData.subscription.auto_renew && (
                  <button 
                    className="action-btn secondary"
                    onClick={handleCancelRenewal}
                  >
                    Cancel Auto-Renew
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="no-subscription">
              <p>No active subscription</p>
              <button onClick={() => navigate('/project62#meal-prep')} className="action-btn primary">
                Browse Meal Plans
              </button>
            </div>
          )}
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && subscriptionData && (
          <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
            <div className="modal-content upgrade-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Change Your Plan</h3>
                <button className="close-btn" onClick={() => setShowUpgradeModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <p>Select a new commitment duration. Changes take effect at your next billing cycle.</p>
                <div className="week-options">
                  {/* Show available pricing tiers - would need to fetch from subscriptions config */}
                  {[1, 2, 3, 4, 6].map(weeks => (
                    <button
                      key={weeks}
                      className={`week-option ${selectedUpgradeWeeks === weeks ? 'selected' : ''}`}
                      onClick={() => setSelectedUpgradeWeeks(weeks)}
                    >
                      <span className="weeks">{weeks} Week{weeks > 1 ? 's' : ''}</span>
                      <span className="savings">{weeks >= 4 ? 'Best Value' : weeks >= 2 ? 'Save More' : ''}</span>
                    </button>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowUpgradeModal(false)}>
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleUpgrade}
                    disabled={!selectedUpgradeWeeks}
                  >
                    Schedule Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Upcoming Deliveries */}
        <div className="dashboard-card full-width">
          <h2>Upcoming Deliveries</h2>
          {dashboardData?.deliveries && dashboardData.deliveries.length > 0 ? (
            <div className="deliveries-list">
              {dashboardData.deliveries.map((delivery, idx) => (
                <div key={idx} className="delivery-item">
                  <div className="delivery-date">
                    <span className="date-label">Delivery Date</span>
                    <span className="date-value">{delivery.delivery_date || 'TBD'}</span>
                  </div>
                  <div className="delivery-details">
                    <p><strong>Week:</strong> {delivery.week || 'N/A'}</p>
                    <p><strong>Status:</strong> <span className={`status-badge ${delivery.status}`}>{delivery.status || 'Pending'}</span></p>
                  </div>
                  <div className="delivery-address">
                    <p>{delivery.address || dashboardData.customer?.address || 'Address not set'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-deliveries">
              <p>No upcoming deliveries scheduled</p>
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="dashboard-card full-width">
          <h2>Order History</h2>
          {dashboardData?.orders && dashboardData.orders.length > 0 ? (
            <div className="orders-list">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.orders.map((order, idx) => (
                    <tr key={idx}>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>{order.product_type || 'N/A'}</td>
                      <td>${order.amount?.toFixed(2) || '0.00'}</td>
                      <td><span className={`status-badge ${order.payment_status}`}>{order.payment_status || 'Pending'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-orders">
              <p>No order history yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
