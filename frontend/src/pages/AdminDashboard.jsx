import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminProducts from './AdminProducts';
import AdminSubscriptions from './AdminSubscriptions';
import AdminDishes from './AdminDishes';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout, isAuthenticated, isAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState('leads');
  const [data, setData] = useState({
    leads: [],
    orders: [],
    deliveries: [],
    customers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [renewalsLoading, setRenewalsLoading] = useState(false);
  const [renewalsResult, setRenewalsResult] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/project62/login');
      return;
    }
    if (!isAdmin) {
      // Not an admin, redirect to customer dashboard
      navigate('/project62/dashboard');
      return;
    }
    fetchAllData();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      const [leadsRes, ordersRes, deliveriesRes, customersRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/project62/admin/leads`, { headers }),
        fetch(`${BACKEND_URL}/api/project62/admin/orders`, { headers }),
        fetch(`${BACKEND_URL}/api/project62/admin/deliveries`, { headers }),
        fetch(`${BACKEND_URL}/api/project62/admin/customers`, { headers })
      ]);

      const [leadsData, ordersData, deliveriesData, customersData] = await Promise.all([
        leadsRes.json(),
        ordersRes.json(),
        deliveriesRes.json(),
        customersRes.json()
      ]);

      setData({
        leads: leadsData.leads || [],
        orders: ordersData.orders || [],
        deliveries: deliveriesData.deliveries || [],
        customers: customersData.customers || []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/delivery/${deliveryId}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchAllData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to update delivery status:', err);
    }
  };

  const exportToCSV = (dataArray, filename) => {
    if (!dataArray || dataArray.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(dataArray[0]);
    const csvContent = [
      headers.join(','),
      ...dataArray.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    logout();
    navigate('/project62');
  };

  const handleRunRenewals = async () => {
    if (!window.confirm('Are you sure you want to process renewals now?')) return;
    
    setRenewalsLoading(true);
    setRenewalsResult(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/process-renewals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      setRenewalsResult(data);
      alert(`Renewals processed!\nSuccessful: ${data.renewals_processed}\nErrors: ${data.errors?.length || 0}`);
    } catch (err) {
      alert(`Failed to process renewals: ${err.message}`);
    } finally {
      setRenewalsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-content">
          <h1>Project 62 Admin Dashboard</h1>
          <p className="header-subtitle">Manage leads, orders, deliveries & customers</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={handleRunRenewals} 
            className="renewals-btn"
            disabled={renewalsLoading}
          >
            {renewalsLoading ? 'Processing...' : '🔄 Run Renewals Now'}
          </button>
          <button onClick={() => navigate('/project62/dashboard')} className="customer-link-btn">
            Customer View
          </button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-details">
            <h3>{data.leads.length}</h3>
            <p>Total Leads</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-details">
            <h3>{data.orders.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚚</div>
          <div className="stat-details">
            <h3>{data.deliveries.filter(d => d.status === 'pending').length}</h3>
            <p>Pending Deliveries</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-details">
            <h3>{data.customers.length}</h3>
            <p>Total Customers</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={activeTab === 'leads' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('leads')}
        >
          Leads ({data.leads.length})
        </button>
        <button 
          className={activeTab === 'orders' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('orders')}
        >
          Orders ({data.orders.length})
        </button>
        <button 
          className={activeTab === 'deliveries' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('deliveries')}
        >
          Deliveries ({data.deliveries.length})
        </button>
        <button 
          className={activeTab === 'customers' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('customers')}
        >
          Customers ({data.customers.length})
        </button>
        <button 
          className={activeTab === 'products' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('products')}
        >
          Products & Discounts
        </button>
        <button 
          className={activeTab === 'subscriptions' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('subscriptions')}
        >
          Subscriptions
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div className="content-section">
            <div className="section-header">
              <h2>All Leads</h2>
              <button 
                className="export-btn"
                onClick={() => exportToCSV(data.leads, 'project62_leads.csv')}
              >
                Export to CSV
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leads.map((lead, idx) => (
                    <tr key={idx}>
                      <td>{lead.name}</td>
                      <td>{lead.email}</td>
                      <td>{lead.phone || 'N/A'}</td>
                      <td><span className={`status-badge ${lead.status}`}>{lead.status}</span></td>
                      <td>{lead.source}</td>
                      <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="content-section">
            <div className="section-header">
              <h2>All Orders</h2>
              <button 
                className="export-btn"
                onClick={() => exportToCSV(data.orders, 'project62_orders.csv')}
              >
                Export to CSV
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Type</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Payment Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((order, idx) => (
                    <tr key={idx}>
                      <td className="order-id">{order.session_id?.substring(0, 20)}...</td>
                      <td>{order.product_type}</td>
                      <td>{order.email || 'N/A'}</td>
                      <td>${order.amount?.toFixed(2)}</td>
                      <td><span className={`status-badge ${order.payment_status}`}>{order.payment_status}</span></td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div className="content-section">
            <div className="section-header">
              <h2>All Deliveries</h2>
              <button 
                className="export-btn"
                onClick={() => exportToCSV(data.deliveries, 'project62_deliveries.csv')}
              >
                Generate Delivery List (CSV)
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Delivery ID</th>
                    <th>Customer</th>
                    <th>Address</th>
                    <th>Date</th>
                    <th>Week</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.deliveries.map((delivery, idx) => (
                    <tr key={idx}>
                      <td className="delivery-id">{delivery.delivery_id?.substring(0, 12)}...</td>
                      <td>{delivery.customer_id}</td>
                      <td>{delivery.address}</td>
                      <td>{delivery.delivery_date || 'TBD'}</td>
                      <td>Week {delivery.week}</td>
                      <td><span className={`status-badge ${delivery.status}`}>{delivery.status}</span></td>
                      <td>
                        {delivery.status === 'pending' && (
                          <button 
                            className="action-btn success"
                            onClick={() => updateDeliveryStatus(delivery.delivery_id, 'delivered')}
                          >
                            Mark Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="content-section">
            <div className="section-header">
              <h2>All Customers</h2>
              <button 
                className="export-btn"
                onClick={() => exportToCSV(data.customers, 'project62_customers.csv')}
              >
                Export to CSV
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {data.customers.map((customer, idx) => (
                    <tr key={idx}>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone || 'N/A'}</td>
                      <td>{customer.address || 'Not set'}</td>
                      <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products & Discounts Tab */}
        {activeTab === 'products' && (
          <div className="content-section products-tab">
            <AdminProducts />
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="content-section subscriptions-tab">
            <AdminSubscriptions />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
