import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminProducts.css';

const AdminProducts = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'discounts'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    product_type: 'digital',
    delivery_charge: '',
    stock_quantity: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingProductId, setUploadingProductId] = useState(null);
  
  // Discount form
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    code: '',
    percentage: '',
    description: '',
    expires_at: '',
    max_uses: '',
    active: true
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchProducts();
    fetchDiscountCodes();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Fetch products error:', err);
    }
  };

  const fetchDiscountCodes = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/discount-codes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDiscountCodes(data.discount_codes || []);
    } catch (err) {
      console.error('Fetch discount codes error:', err);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price)
        })
      });

      if (!response.ok) throw new Error('Failed to create product');

      const data = await response.json();
      setSuccess('Product created successfully!');
      setShowProductForm(false);
      setProductForm({ name: '', description: '', price: '', category: 'digital' });
      fetchProducts();
      
      // If file selected, upload it
      if (selectedFile && data.product_id) {
        await handleUploadFile(data.product_id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async (productId) => {
    if (!selectedFile) return;

    setUploadingProductId(productId);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/products/${productId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload file');

      setSuccess('File uploaded successfully!');
      setSelectedFile(null);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingProductId(null);
    }
  };

  const handleToggleProduct = async (productId, currentActive) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !currentActive })
      });

      if (!response.ok) throw new Error('Failed to update product');

      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete product');

      setSuccess('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/discount-codes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...discountForm,
          percentage: parseFloat(discountForm.percentage),
          max_uses: discountForm.max_uses ? parseInt(discountForm.max_uses) : null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create discount code');
      }

      setSuccess('Discount code created successfully!');
      setShowDiscountForm(false);
      setDiscountForm({ code: '', percentage: '', description: '', expires_at: '', max_uses: '', active: true });
      fetchDiscountCodes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDiscount = async (codeId, currentActive) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/discount-codes/${codeId}?active=${!currentActive}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to update discount code');

      fetchDiscountCodes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteDiscount = async (codeId) => {
    if (!window.confirm('Are you sure you want to delete this discount code?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/discount-codes/${codeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete discount code');

      setSuccess('Discount code deleted successfully!');
      fetchDiscountCodes();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-products-container">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="products-tabs">
        <button 
          className={activeTab === 'products' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('products')}
        >
          Digital Products ({products.length})
        </button>
        <button 
          className={activeTab === 'discounts' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('discounts')}
        >
          Discount Codes ({discountCodes.length})
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="products-section">
          <div className="section-header">
            <h2>Digital Products</h2>
            <button onClick={() => setShowProductForm(true)} className="create-btn">
              + Add Product
            </button>
          </div>

          {showProductForm && (
            <div className="form-modal">
              <div className="form-content">
                <h3>Create New Product</h3>
                <form onSubmit={handleCreateProduct}>
                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      rows="3"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (SGD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>PDF File (Optional - can upload later)</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Product'}
                    </button>
                    <button type="button" onClick={() => setShowProductForm(false)} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="products-list">
            {products.map((product) => (
              <div key={product.product_id} className="product-card">
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <p className="price">${product.price.toFixed(2)}</p>
                  <p className="file-status">
                    {product.file_url ? (
                      <span className="has-file">✅ PDF Uploaded</span>
                    ) : (
                      <span className="no-file">⚠️ No PDF</span>
                    )}
                  </p>
                </div>
                <div className="product-actions">
                  {!product.file_url && (
                    <div className="upload-section">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        id={`file-${product.product_id}`}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor={`file-${product.product_id}`} className="upload-btn">
                        Choose PDF
                      </label>
                      {selectedFile && (
                        <button
                          onClick={() => handleUploadFile(product.product_id)}
                          className="upload-btn"
                          disabled={uploadingProductId === product.product_id}
                        >
                          {uploadingProductId === product.product_id ? 'Uploading...' : 'Upload'}
                        </button>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => handleToggleProduct(product.product_id, product.active)}
                    className={product.active ? 'toggle-btn active' : 'toggle-btn'}
                  >
                    {product.active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.product_id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discount Codes Tab */}
      {activeTab === 'discounts' && (
        <div className="discounts-section">
          <div className="section-header">
            <h2>Discount Codes</h2>
            <button onClick={() => setShowDiscountForm(true)} className="create-btn">
              + Create Code
            </button>
          </div>

          {showDiscountForm && (
            <div className="form-modal">
              <div className="form-content">
                <h3>Create Discount Code</h3>
                <form onSubmit={handleCreateDiscount}>
                  <div className="form-group">
                    <label>Code (e.g., WELCOME10)</label>
                    <input
                      type="text"
                      value={discountForm.code}
                      onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Discount Percentage (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={discountForm.percentage}
                      onChange={(e) => setDiscountForm({ ...discountForm, percentage: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description (Optional)</label>
                    <input
                      type="text"
                      value={discountForm.description}
                      onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Expires At (Optional)</label>
                    <input
                      type="date"
                      value={discountForm.expires_at}
                      onChange={(e) => setDiscountForm({ ...discountForm, expires_at: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Uses (Optional)</label>
                    <input
                      type="number"
                      min="1"
                      value={discountForm.max_uses}
                      onChange={(e) => setDiscountForm({ ...discountForm, max_uses: e.target.value })}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Code'}
                    </button>
                    <button type="button" onClick={() => setShowDiscountForm(false)} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="discount-codes-list">
            <table className="codes-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Description</th>
                  <th>Uses</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {discountCodes.map((code) => (
                  <tr key={code.code_id}>
                    <td className="code-cell">{code.code}</td>
                    <td>{code.percentage}%</td>
                    <td>{code.description || '-'}</td>
                    <td>{code.current_uses || 0}{code.max_uses ? ` / ${code.max_uses}` : ''}</td>
                    <td>{code.expires_at ? new Date(code.expires_at).toLocaleDateString() : 'Never'}</td>
                    <td>
                      <span className={`status-badge ${code.active ? 'active' : 'inactive'}`}>
                        {code.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleToggleDiscount(code.code_id, code.active)}
                        className="toggle-btn-small"
                      >
                        {code.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteDiscount(code.code_id)}
                        className="delete-btn-small"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
