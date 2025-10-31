import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminProducts.css';

const AdminProducts = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'categories', or 'discounts'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    type: 'digital',
    category: '',
    tags: '',
    is_featured: false,
    featured_order: 999,
    visibility: 'public',
    stripe_product_id: '',
    inventory: '',
    image_url: '',
    delivery_charge: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  
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
    fetchCategories();
    fetchDiscountCodes();
  }, []);

  const fetchProducts = async () => {
    try {
      let url = `${BACKEND_URL}/api/project62/admin/products`;
      const params = [];
      if (filterCategory) params.push(`category=${encodeURIComponent(filterCategory)}`);
      if (filterType) params.push(`type=${filterType}`);
      if (params.length > 0) url += '?' + params.join('&');
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Fetch products error:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Fetch categories error:', err);
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
      
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        tags: productForm.tags ? productForm.tags.split(',').map(t => t.trim()) : [],
        featured_order: parseInt(productForm.featured_order) || 999,
        inventory: productForm.inventory ? parseInt(productForm.inventory) : null,
        delivery_charge: productForm.delivery_charge ? parseFloat(productForm.delivery_charge) : 0
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
        throw new Error(errorData.detail || 'Failed to save product');
      }

      setSuccess(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      setShowProductForm(false);
      resetProductForm();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = editingCategory
        ? `${BACKEND_URL}/api/project62/admin/categories/${editingCategory.category_id}`
        : `${BACKEND_URL}/api/project62/admin/categories`;
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save category');
      }

      setSuccess(editingCategory ? 'Category updated!' : 'Category created!');
      setShowCategoryForm(false);
      setCategoryForm({ name: '', slug: '' });
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Product deleted successfully');
        fetchProducts();
      }
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Delete this category? Products using it will need to be updated.')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Category deleted');
        fetchCategories();
      }
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  const handleImageUpload = async (productId, file) => {
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${BACKEND_URL}/api/project62/admin/products/${productId}/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setSuccess('Image uploaded successfully');
        fetchProducts();
      } else {
        throw new Error('Image upload failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create discount code');
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

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      type: 'digital',
      category: '',
      tags: '',
      is_featured: false,
      featured_order: 999,
      visibility: 'public',
      stripe_product_id: '',
      inventory: '',
      image_url: '',
      delivery_charge: ''
    });
    setEditingProduct(null);
  };

  const startEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      type: product.type,
      category: product.category,
      tags: product.tags?.join(', ') || '',
      is_featured: product.is_featured,
      featured_order: product.featured_order,
      visibility: product.visibility,
      stripe_product_id: product.stripe_product_id || '',
      inventory: product.inventory?.toString() || '',
      image_url: product.image_url || '',
      delivery_charge: product.delivery_charge?.toString() || ''
    });
    setShowProductForm(true);
  };

  const startEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, slug: category.slug });
    setShowCategoryForm(true);
  };

  const filteredProducts = products.filter(p => {
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="admin-products-container">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Sub-tabs */}
      <div className="sub-tabs">
        <button 
          className={activeTab === 'products' ? 'sub-tab active' : 'sub-tab'}
          onClick={() => setActiveTab('products')}
        >
          Products ({products.length})
        </button>
        <button 
          className={activeTab === 'categories' ? 'sub-tab active' : 'sub-tab'}
          onClick={() => setActiveTab('categories')}
        >
          Categories ({categories.length})
        </button>
        <button 
          className={activeTab === 'discounts' ? 'sub-tab active' : 'sub-tab'}
          onClick={() => setActiveTab('discounts')}
        >
          Discount Codes ({discountCodes.length})
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="products-section">
          <div className="section-header">
            <div className="header-actions">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  resetProductForm();
                  setShowProductForm(true);
                }}
              >
                + Add Product
              </button>
              
              <div className="filters">
                <select 
                  value={filterCategory} 
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    fetchProducts();
                  }}
                  className="filter-select"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>

                <select 
                  value={filterType} 
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    fetchProducts();
                  }}
                  className="filter-select"
                >
                  <option value="">All Types</option>
                  <option value="digital">Digital</option>
                  <option value="physical">Physical</option>
                  <option value="subscription">Subscription</option>
                </select>

                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <div className="modal-overlay" onClick={() => setShowProductForm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{editingProduct ? 'Edit Product' : 'Create New Product'}</h3>
                  <button className="close-btn" onClick={() => setShowProductForm(false)}>×</button>
                </div>
                <form onSubmit={handleCreateProduct} className="product-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Product Name *</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Price (SGD) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Type *</label>
                      <select
                        value={productForm.type}
                        onChange={(e) => setProductForm({...productForm, type: e.target.value})}
                        required
                      >
                        <option value="digital">Digital</option>
                        <option value="physical">Physical</option>
                        <option value="subscription">Subscription</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.category_id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Visibility</label>
                      <select
                        value={productForm.visibility}
                        onChange={(e) => setProductForm({...productForm, visibility: e.target.value})}
                      >
                        <option value="public">Public</option>
                        <option value="member-only">Member Only</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Featured Order</label>
                      <input
                        type="number"
                        value={productForm.featured_order}
                        onChange={(e) => setProductForm({...productForm, featured_order: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={productForm.tags}
                      onChange={(e) => setProductForm({...productForm, tags: e.target.value})}
                      placeholder="e.g., keto, protein, beginner"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Stripe Product ID</label>
                      <input
                        type="text"
                        value={productForm.stripe_product_id}
                        onChange={(e) => setProductForm({...productForm, stripe_product_id: e.target.value})}
                        placeholder="price_..."
                      />
                    </div>
                    {productForm.type === 'physical' && (
                      <div className="form-group">
                        <label>Inventory</label>
                        <input
                          type="number"
                          value={productForm.inventory}
                          onChange={(e) => setProductForm({...productForm, inventory: e.target.value})}
                        />
                      </div>
                    )}
                  </div>

                  {productForm.type === 'physical' && (
                    <div className="form-group">
                      <label>Delivery Charge (SGD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.delivery_charge}
                        onChange={(e) => setProductForm({...productForm, delivery_charge: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={productForm.is_featured}
                        onChange={(e) => setProductForm({...productForm, is_featured: e.target.checked})}
                      />
                      Featured on Landing Page
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowProductForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.product_id} className="product-card">
                <div className="product-image">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} />
                  ) : (
                    <div className="placeholder-image">No Image</div>
                  )}
                </div>
                <div className="product-details">
                  <h4>{product.name}</h4>
                  <p className="product-description">{product.description}</p>
                  <div className="product-meta">
                    <span className="product-price">${product.price}</span>
                    <span className={`product-type ${product.type}`}>{product.type}</span>
                    {product.is_featured && <span className="featured-badge">⭐ Featured #{product.featured_order}</span>}
                  </div>
                  <div className="product-info">
                    <span className="category-badge">{product.category}</span>
                    <span className={`visibility-badge ${product.visibility}`}>{product.visibility}</span>
                  </div>
                  {product.tags && product.tags.length > 0 && (
                    <div className="product-tags">
                      {product.tags.map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="product-actions">
                  <button className="btn-icon" onClick={() => startEditProduct(product)} title="Edit">
                    ✏️
                  </button>
                  <label className="btn-icon" title="Upload Image">
                    📷
                    <input
                      type="file"
                      accept="image/*"
                      style={{display: 'none'}}
                      onChange={(e) => handleImageUpload(product.product_id, e.target.files[0])}
                    />
                  </label>
                  <button 
                    className="btn-icon delete" 
                    onClick={() => handleDeleteProduct(product.product_id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-state">
              <p>No products found. Create your first product!</p>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="categories-section">
          <div className="section-header">
            <button 
              className="btn btn-primary"
              onClick={() => {
                setCategoryForm({ name: '', slug: '' });
                setEditingCategory(null);
                setShowCategoryForm(true);
              }}
            >
              + Add Category
            </button>
          </div>

          {/* Category Form Modal */}
          {showCategoryForm && (
            <div className="modal-overlay" onClick={() => setShowCategoryForm(false)}>
              <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{editingCategory ? 'Edit Category' : 'Create Category'}</h3>
                  <button className="close-btn" onClick={() => setShowCategoryForm(false)}>×</button>
                </div>
                <form onSubmit={handleCreateCategory} className="category-form">
                  <div className="form-group">
                    <label>Category Name *</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Slug (optional)</label>
                    <input
                      type="text"
                      value={categoryForm.slug}
                      onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCategoryForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="categories-list">
            {categories.map(category => (
              <div key={category.category_id} className="category-item">
                <div className="category-info">
                  <h4>{category.name}</h4>
                  <span className="category-slug">{category.slug}</span>
                </div>
                <div className="category-actions">
                  <button className="btn-icon" onClick={() => startEditCategory(category)}>✏️</button>
                  <button className="btn-icon delete" onClick={() => handleDeleteCategory(category.category_id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="empty-state">
              <p>No categories yet. Create your first category!</p>
            </div>
          )}
        </div>
      )}

      {/* Discount Codes Tab */}
      {activeTab === 'discounts' && (
        <div className="discounts-section">
          <div className="section-header">
            <button 
              className="btn btn-primary"
              onClick={() => setShowDiscountForm(true)}
            >
              + Create Discount Code
            </button>
          </div>

          {/* Discount Form Modal */}
          {showDiscountForm && (
            <div className="modal-overlay" onClick={() => setShowDiscountForm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Create Discount Code</h3>
                  <button className="close-btn" onClick={() => setShowDiscountForm(false)}>×</button>
                </div>
                <form onSubmit={handleCreateDiscount} className="discount-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Code *</label>
                      <input
                        type="text"
                        value={discountForm.code}
                        onChange={(e) => setDiscountForm({...discountForm, code: e.target.value.toUpperCase()})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Discount % *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={discountForm.percentage}
                        onChange={(e) => setDiscountForm({...discountForm, percentage: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={discountForm.description}
                      onChange={(e) => setDiscountForm({...discountForm, description: e.target.value})}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expires At</label>
                      <input
                        type="date"
                        value={discountForm.expires_at}
                        onChange={(e) => setDiscountForm({...discountForm, expires_at: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Max Uses</label>
                      <input
                        type="number"
                        value={discountForm.max_uses}
                        onChange={(e) => setDiscountForm({...discountForm, max_uses: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowDiscountForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Code'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Discount Codes List */}
          <div className="discounts-list">
            {discountCodes.map(discount => (
              <div key={discount.code_id} className="discount-card">
                <div className="discount-info">
                  <h4>{discount.code}</h4>
                  <p>{discount.description || 'No description'}</p>
                  <div className="discount-meta">
                    <span className="discount-percentage">{discount.percentage}% off</span>
                    {discount.expires_at && (
                      <span className="discount-expiry">Expires: {new Date(discount.expires_at).toLocaleDateString()}</span>
                    )}
                    {discount.max_uses && (
                      <span className="discount-uses">Max uses: {discount.max_uses}</span>
                    )}
                  </div>
                </div>
                <div className={`discount-status ${discount.active ? 'active' : 'inactive'}`}>
                  {discount.active ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>

          {discountCodes.length === 0 && (
            <div className="empty-state">
              <p>No discount codes yet. Create your first one!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
