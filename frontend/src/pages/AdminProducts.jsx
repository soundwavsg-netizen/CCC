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
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingProductId, setUploadingProductId] = useState(null);
  const [uploadingImageProductId, setUploadingImageProductId] = useState(null);
  
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
      const url = editingProduct 
        ? `${BACKEND_URL}/api/project62/admin/products/${editingProduct.product_id}`
        : `${BACKEND_URL}/api/project62/admin/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          delivery_charge: productForm.delivery_charge ? parseFloat(productForm.delivery_charge) : 0,
          stock_quantity: productForm.stock_quantity ? parseInt(productForm.stock_quantity) : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save product');
      }

      const data = await response.json();
      setSuccess(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ 
        name: '', 
        description: '', 
        price: '', 
        product_type: 'digital',
        delivery_charge: '',
        stock_quantity: ''
      });
      fetchProducts();
      
      // If digital product and file selected, upload it
      if (!editingProduct && selectedFile && data.product_id && productForm.product_type === 'digital') {
        await handleUploadFile(data.product_id);
      }
    } catch (err) {
      setError(err.message);
      console.error('Product save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      product_type: product.product_type,
      delivery_charge: product.delivery_charge ? product.delivery_charge.toString() : '',
      stock_quantity: product.stock_quantity ? product.stock_quantity.toString() : ''
    });
    setShowProductForm(true);
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

  const handleUploadImage = async (productId, imageFile) => {
    if (!imageFile) return;

    setUploadingImageProductId(productId);
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/products/${productId}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      setSuccess(`Image uploaded successfully! Total: ${data.total_images}`);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImageProductId(null);
    }
  };

  const handleDeleteImage = async (productId, imageUrl) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/products/${productId}/image?image_url=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete image');

      setSuccess('Image deleted successfully!');
      fetchProducts();
    } catch (err) {
      setError(err.message);
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
                <h3>{editingProduct ? 'Edit Product' : 'Create New Product'}</h3>
                <form onSubmit={handleCreateProduct}>
                  <div className="form-group">
                    <label>Product Type</label>
                    <select
                      value={productForm.product_type}
                      onChange={(e) => setProductForm({ ...productForm, product_type: e.target.value })}
                      required
                    >
                      <option value="digital">Digital Product (PDF)</option>
                      <option value="physical">Physical Product (Requires Delivery)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g., 6 Days Free Plan"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      rows="3"
                      placeholder="Describe what this product includes..."
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
                      placeholder="0.00 for free products"
                      required
                    />
                  </div>
                  
                  {/* Physical Product Fields */}
                  {productForm.product_type === 'physical' && (
                    <>
                      <div className="form-group">
                        <label>Delivery Charge (SGD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={productForm.delivery_charge}
                          onChange={(e) => setProductForm({ ...productForm, delivery_charge: e.target.value })}
                          placeholder="e.g., 5.00"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Stock Quantity (Optional)</label>
                        <input
                          type="number"
                          min="0"
                          value={productForm.stock_quantity}
                          onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                          placeholder="Leave empty for unlimited"
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Digital Product Fields */}
                  {productForm.product_type === 'digital' && (
                    <div className="form-group">
                      <label>PDF File (Optional - can upload later)</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                      />
                    </div>
                  )}
                  
                  <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? (editingProduct ? 'Updating...' : 'Creating...') : (editingProduct ? 'Update Product' : 'Create Product')}
                    </button>
                    <button type="button" onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                      setProductForm({ 
                        name: '', 
                        description: '', 
                        price: '', 
                        product_type: 'digital',
                        delivery_charge: '',
                        stock_quantity: ''
                      });
                    }} className="cancel-btn">
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
                {/* Product Images Gallery */}
                {product.images && product.images.length > 0 && (
                  <div className="product-images-gallery">
                    {product.images.map((img, idx) => (
                      <div key={idx} className="product-image-item">
                        <img src={img} alt={`${product.name} ${idx + 1}`} />
                        <button
                          className="delete-image-btn"
                          onClick={() => handleDeleteImage(product.product_id, img)}
                          title="Delete image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="product-info">
                  <div className="product-type-badge">
                    {product.product_type === 'digital' ? '📄 Digital' : '📦 Physical'}
                  </div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <p className="price">${product.price.toFixed(2)}</p>
                  
                  {product.product_type === 'physical' && (
                    <>
                      <p className="delivery-charge">+ ${product.delivery_charge?.toFixed(2) || '0.00'} delivery</p>
                      {product.stock_quantity !== null && (
                        <p className="stock">Stock: {product.stock_quantity || 'Unlimited'}</p>
                      )}
                    </>
                  )}
                  
                  {product.product_type === 'digital' && (
                    <p className="file-status">
                      {product.file_url && product.file_url !== 'N/A' ? (
                        <span className="has-file">✅ PDF Uploaded</span>
                      ) : (
                        <span className="no-file">⚠️ No PDF</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="product-actions">
                  {/* Upload Product Images */}
                  <div className="upload-section">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleUploadImage(product.product_id, e.target.files[0]);
                        }
                      }}
                      id={`image-${product.product_id}`}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor={`image-${product.product_id}`} className="upload-btn">
                      {uploadingImageProductId === product.product_id ? 'Uploading...' : '+ Add Photo'}
                    </label>
                  </div>
                  
                  {/* Upload PDF for digital products */}
                  {product.product_type === 'digital' && !product.file_url && (
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
                          {uploadingProductId === product.product_id ? 'Uploading...' : 'Upload PDF'}
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
                    onClick={() => handleEditProduct(product)}
                    className="edit-btn"
                  >
                    Edit
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
