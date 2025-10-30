import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout, isAuthenticated } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
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

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/project62/login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, navigate]);

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
        <button onClick={handleLogout} className="logout-btn">Logout</button>
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

        {/* Active Plan Section */}
        <div className="dashboard-card">
          <h2>Active Subscription</h2>
          {dashboardData?.plan_status ? (
            <div className="plan-details">
              <div className="plan-header">
                <span className="plan-type">{dashboardData.plan_status.product_type || 'Meal Prep'}</span>
                <span className="plan-status active">Active</span>
              </div>
              <div className="plan-info">
                <p><strong>Duration:</strong> {dashboardData.plan_status.duration || 'N/A'}</p>
                <p><strong>Meals per day:</strong> {dashboardData.plan_status.meals_per_day || 'N/A'}</p>
                <p><strong>Start date:</strong> {dashboardData.plan_status.start_date || 'N/A'}</p>
              </div>
              <div className="plan-actions">
                <button className="action-btn primary">Renew Plan</button>
                <button className="action-btn secondary">Upgrade</button>
              </div>
            </div>
          ) : (
            <div className="no-plan">
              <p>No active subscription</p>
              <button onClick={() => navigate('/project62')} className="action-btn primary">
                Browse Plans
              </button>
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
