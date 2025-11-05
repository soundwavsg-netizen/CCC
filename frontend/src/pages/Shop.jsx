import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Shop.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Shop = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    type: searchParams.get('type') || '',
    search: searchParams.get('q') || '',
    sortBy: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page')) || 1
  });
  
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        category: filters.category || undefined,
        type: filters.type || undefined,
        search: filters.search || undefined,
        sort_by: filters.sortBy,
        limit: productsPerPage,
        offset: (filters.page - 1) * productsPerPage
      };

      // Remove undefined values
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await axios.get(`${BACKEND_URL}/api/project62/products`, { params });
      setProducts(response.data.products || []);
      setTotalProducts(response.data.total || 0);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.type) params.set('type', newFilters.type);
    if (newFilters.search) params.set('q', newFilters.search);
    if (newFilters.sortBy !== 'newest') params.set('sort', newFilters.sortBy);
    if (newFilters.page > 1) params.set('page', newFilters.page.toString());
    
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  const handleProductClick = (product) => {
    if (product.link_override) {
      navigate(product.link_override);
    } else {
      navigate(`/project62/product/${product.product_id_slug}`);
    }
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="header-top">
          <button 
            className="back-btn"
            onClick={() => {
              if (isAuthenticated) {
                navigate('/project62/dashboard');
              } else {
                navigate('/project62');
              }
            }}
            title={isAuthenticated ? "Back to Dashboard" : "Back to Home"}
          >
            ← {isAuthenticated ? "Back to Dashboard" : "Back to Home"}
          </button>
        </div>
        <h1>Project 62 Shop</h1>
        <p>Discover our range of transformation plans and meal-prep subscriptions</p>
      </div>

      <div className="shop-container">
        <aside className="filters-sidebar">
          <h3>Filters</h3>
          
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
              <option value="">All Categories</option>
              <option value="transformation-plans">Transformation Plans</option>
              <option value="meal-prep">Meal Prep</option>
              <option value="guides">Guides</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Type</label>
            <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
              <option value="">All Types</option>
              <option value="digital">Digital</option>
              <option value="physical">Physical</option>
              <option value="subscription">Subscription</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select value={filters.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>

          <button className="clear-filters" onClick={() => {
            setFilters({ category: '', type: '', search: '', sortBy: 'newest', page: 1 });
            setSearchParams(new URLSearchParams());
          }}>
            Clear All Filters
          </button>
        </aside>

        <div className="products-section">
          {loading ? (
            <div className="loading-state">Loading products...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>No products found matching your criteria.</p>
              <button onClick={() => {
                setFilters({ category: '', type: '', search: '', sortBy: 'newest', page: 1 });
                setSearchParams(new URLSearchParams());
              }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.product_id} className="product-card" onClick={() => handleProductClick(product)}>
                    {product.image_url && (
                      <div className="product-image">
                        <img src={product.image_url} alt={product.name} />
                      </div>
                    )}
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-description">{product.description?.substring(0, 100)}...</p>
                      <div className="product-footer">
                        <span className="product-price">${product.price.toFixed(2)}</span>
                        <span className={`product-badge ${product.type}`}>{product.type.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                  >
                    Previous
                  </button>
                  
                  <span className="page-info">
                    Page {filters.page} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
