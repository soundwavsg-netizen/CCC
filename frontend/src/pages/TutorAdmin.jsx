import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import PageHeader from '../components/PageHeader';

const TutorAdmin = () => {
  const [tutors, setTutors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://math-mastery-12.preview.emergentagent.com';

  const LOCATIONS = ['Marine Parade', 'Bishan', 'Tampines', 'Jurong', 'Woodlands', 'Ang Mo Kio'];
  const LEVELS = ['S1', 'S2', 'S3', 'S4', 'J1', 'J2'];
  const SUBJECTS = ['Math', 'A Math', 'E Math'];

  const [formData, setFormData] = useState({
    tutor_name: '',
    locations: [],
    levels: [],
    subjects: []
  });

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/tutor/admin/list-tutors`);
      if (response.data.success) {
        setTutors(response.data.tutors);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setCreatedCredentials(null);

    // Validation
    if (!formData.tutor_name.trim()) {
      setMessage('❌ Please enter tutor name');
      return;
    }
    if (formData.locations.length === 0) {
      setMessage('❌ Please select at least one location');
      return;
    }
    if (formData.levels.length === 0) {
      setMessage('❌ Please select at least one level');
      return;
    }
    if (formData.subjects.length === 0) {
      setMessage('❌ Please select at least one subject');
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/tutor/admin/create-tutor`, formData);
      
      if (response.data.success) {
        setMessage(`✅ ${response.data.message}`);
        setCreatedCredentials({
          tutor_name: response.data.tutor_name,
          login_id: response.data.login_id,
          temp_password: response.data.temp_password
        });
        
        // Reset form
        setFormData({
          tutor_name: '',
          locations: [],
          levels: [],
          subjects: []
        });
        
        // Refresh tutors list
        fetchTutors();
      }
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteTutor = async (loginId, tutorName) => {
    if (!window.confirm(`Are you sure you want to delete tutor ${tutorName}?`)) {
      return;
    }

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/tutor/admin/delete-tutor/${loginId}`);
      if (response.data.success) {
        setMessage(`✅ Tutor ${tutorName} deleted successfully`);
        fetchTutors();
      }
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Tutor Management" 
        subtitle="Manage tutor profiles and permissions for Math Analysis System"
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Credentials Display */}
        {createdCredentials && (
          <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <h3 className="text-xl font-bold text-blue-900 mb-4">🔐 Tutor Credentials Created</h3>
            <div className="space-y-2 bg-white p-4 rounded border border-blue-200">
              <p className="text-gray-800"><strong>Tutor Name:</strong> {createdCredentials.tutor_name}</p>
              <p className="text-gray-800"><strong>Login ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{createdCredentials.login_id}</code></p>
              <p className="text-gray-800"><strong>Temporary Password:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{createdCredentials.temp_password}</code></p>
              <p className="text-sm text-blue-600 mt-3">⚠️ Please share these credentials with the tutor. They will be required to change their password on first login.</p>
            </div>
          </div>
        )}

        {/* Add Tutor Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3"
          >
            {showAddForm ? '✖️ Cancel' : '➕ Add New Tutor'}
          </Button>
        </div>

        {/* Add Tutor Form */}
        {showAddForm && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Tutor Profile</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tutor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tutor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tutor_name}
                  onChange={(e) => setFormData({ ...formData, tutor_name: e.target.value })}
                  placeholder="e.g., Sean Yeo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Login ID will be auto-generated (e.g., "Sean Yeo" → "seanyeo")</p>
              </div>

              {/* Locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Teaching Locations <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {LOCATIONS.map(location => (
                    <label key={location} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.locations.includes(location)}
                        onChange={() => handleCheckboxChange('locations', location)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{location}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Levels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Teaching Levels <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {LEVELS.map(level => (
                    <label key={level} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.levels.includes(level)}
                        onChange={() => handleCheckboxChange('levels', level)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subjects */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Teaching Subjects <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {SUBJECTS.map(subject => (
                    <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={() => handleCheckboxChange('subjects', subject)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3"
                >
                  🎓 Create Tutor Profile
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tutors List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Existing Tutors</h2>
          
          {tutors.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tutors found. Add your first tutor above!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locations</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Levels</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tutors.map((tutor) => (
                    <tr key={tutor.login_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tutor.tutor_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <code className="bg-gray-100 px-2 py-1 rounded">{tutor.login_id}</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tutor.temp_password ? (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                            Temp: <code>{tutor.temp_password}</code>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Password Changed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs">
                          {tutor.locations.join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{tutor.levels.join(', ')}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{tutor.subjects.join(', ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tutor.last_login ? new Date(tutor.last_login).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteTutor(tutor.login_id, tutor.tutor_name)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorAdmin;
