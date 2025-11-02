import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDishes.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminDishes = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [formData, setFormData] = useState({
    dish_name: '',
    description: '',
    calories: '',
    week_assigned: '',
    is_available: true,
    image_url: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('project62_token');
      const response = await axios.get(`${BACKEND_URL}/api/project62/admin/dishes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDishes(response.data.dishes || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dishes:', err);
      alert('Failed to load dishes');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e, dishId) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const token = localStorage.getItem('project62_token');
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await axios.post(
        `${BACKEND_URL}/api/project62/admin/dishes/${dishId}/upload-image`,
        formDataUpload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Image uploaded successfully!');
      fetchDishes();
      setUploading(false);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image');
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('project62_token');
      const payload = {
        dish_name: formData.dish_name,
        description: formData.description,
        calories: formData.calories ? parseInt(formData.calories) : null,
        week_assigned: formData.week_assigned ? parseInt(formData.week_assigned) : null,
        is_available: formData.is_available,
        image_url: formData.image_url || null
      };

      if (editingDish) {
        await axios.put(
          `${BACKEND_URL}/api/project62/admin/dishes/${editingDish.dish_id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Dish updated successfully!');
      } else {
        await axios.post(
          `${BACKEND_URL}/api/project62/admin/dishes`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Dish created successfully!');
      }

      setShowForm(false);
      setEditingDish(null);
      setFormData({
        dish_name: '',
        description: '',
        calories: '',
        week_assigned: '',
        is_available: true,
        image_url: ''
      });
      fetchDishes();
    } catch (err) {
      console.error('Error saving dish:', err);
      alert('Failed to save dish');
    }
  };

  const handleEdit = (dish) => {
    setEditingDish(dish);
    setFormData({
      dish_name: dish.dish_name,
      description: dish.description || '',
      calories: dish.calories || '',
      week_assigned: dish.week_assigned || '',
      is_available: dish.is_available,
      image_url: dish.image_url || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (dishId) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) return;

    try {
      const token = localStorage.getItem('project62_token');
      await axios.delete(`${BACKEND_URL}/api/project62/admin/dishes/${dishId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Dish deleted successfully!');
      fetchDishes();
    } catch (err) {
      console.error('Error deleting dish:', err);
      alert('Failed to delete dish');
    }
  };

  return (
    <div className="admin-dishes">
      <div className="dishes-header">
        <h2>Dish Management</h2>
        <button className="create-button" onClick={() => {
          setShowForm(true);
          setEditingDish(null);
          setFormData({
            dish_name: '',
            description: '',
            calories: '',
            week_assigned: '',
            is_available: true,
            image_url: ''
          });
        }}>
          + Add New Dish
        </button>
      </div>

      {showForm && (
        <div className="dish-form-modal">
          <div className="modal-content">
            <h3>{editingDish ? 'Edit Dish' : 'Add New Dish'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Dish Name *</label>
                <input type="text" name="dish_name" value={formData.dish_name} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Calories</label>
                  <input type="number" name="calories" value={formData.calories} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Week Assigned</label>
                  <input type="number" name="week_assigned" value={formData.week_assigned} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleInputChange} />
                  Available
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="save-button">{editingDish ? 'Update' : 'Create'} Dish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading dishes...</div>
      ) : (
        <div className="dishes-grid">
          {dishes.map((dish) => (
            <div key={dish.dish_id} className="dish-card">
              <div className="dish-image">
                {dish.image_url ? (
                  <img src={dish.image_url} alt={dish.dish_name} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
                <label className="upload-label">
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, dish.dish_id)} disabled={uploading} />
                </label>
              </div>
              <div className="dish-info">
                <h3>{dish.dish_name}</h3>
                {dish.description && <p className="description">{dish.description}</p>}
                <div className="dish-meta">
                  {dish.calories && <span>🔥 {dish.calories} cal</span>}
                  {dish.week_assigned && <span>📅 Week {dish.week_assigned}</span>}
                  <span className={`status ${dish.is_available ? 'available' : 'unavailable'}`}>
                    {dish.is_available ? '✓ Available' : '✗ Unavailable'}
                  </span>
                </div>
                <div className="dish-actions">
                  <button className="edit-btn" onClick={() => handleEdit(dish)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(dish.dish_id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDishes;