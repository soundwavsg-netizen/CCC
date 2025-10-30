import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import PageHeader from '../components/PageHeader';

const Admin = () => {
  const [formData, setFormData] = useState({
    level: '',
    subject: '',
    location: '',
    tutor_name: '',
    day1: '',
    time1: '',
    day2: '',
    time2: '',
    monthly_fee: '',
    sessions_per_week: 2
  });
  
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableTutors, setAvailableTutors] = useState([]);
  const [isNewTutor, setIsNewTutor] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://fitness-nutrition-5.preview.emergentagent.com';

  // Subject options based on selected level
  const getSubjectOptions = (level) => {
    if (!level) return [];
    
    if (level.startsWith('P')) {
      return ['Math', 'Science', 'English', 'Chinese'];
    } else if (level === 'S1' || level === 'S2') {
      return ['Math', 'Science', 'English', 'Chinese'];
    } else if (level === 'S3' || level === 'S4') {
      return ['EMath', 'AMath', 'Physics', 'Chemistry', 'Biology', 'English', 'Chinese'];
    } else if (level === 'J1' || level === 'J2') {
      return ['Math', 'Physics', 'Chemistry', 'Biology', 'Economics'];
    }
    return [];
  };

  // Fetch available locations when level and subject are selected
  React.useEffect(() => {
    const fetchLocations = async () => {
      if (formData.level && formData.subject) {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/tuition/available-locations`, {
            params: { level: formData.level, subject: formData.subject }
          });
          setAvailableLocations(response.data.locations || []);
        } catch (error) {
          console.error('Error fetching locations:', error);
          setAvailableLocations(['Bishan', 'Punggol', 'Marine Parade', 'Jurong', 'Kovan']);
        }
      } else {
        setAvailableLocations([]);
      }
    };
    fetchLocations();
  }, [formData.level, formData.subject, BACKEND_URL]);

  // Fetch available tutors when level, subject, and location are selected
  React.useEffect(() => {
    const fetchTutors = async () => {
      if (formData.level && formData.subject && formData.location) {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/admin/available-tutors`, {
            params: { 
              level: formData.level, 
              subject: formData.subject,
              location: formData.location 
            }
          });
          setAvailableTutors(response.data.tutors || []);
        } catch (error) {
          console.error('Error fetching tutors:', error);
          setAvailableTutors([]);
        }
      } else {
        setAvailableTutors([]);
      }
    };
    fetchTutors();
  }, [formData.level, formData.subject, formData.location, BACKEND_URL]);

  const handleFormChange = (field, value) => {
    const updates = { [field]: value };
    
    // If level changes, reset everything after it
    if (field === 'level') {
      updates.subject = '';
      updates.location = '';
      updates.tutor_name = '';
      setIsNewTutor(false);
    }
    // If subject changes, reset location and tutor
    else if (field === 'subject') {
      updates.location = '';
      updates.tutor_name = '';
      setIsNewTutor(false);
    }
    // If location changes, reset tutor
    else if (field === 'location') {
      updates.tutor_name = '';
      setIsNewTutor(false);
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${BACKEND_URL}/api/admin/manage-class`, {
        action: 'add',
        class_data: {
          ...formData,
          monthly_fee: parseFloat(formData.monthly_fee),
          sessions_per_week: parseInt(formData.sessions_per_week)
        }
      });

      setMessage(`✅ ${response.data.message}`);
      
      // Reset form
      setFormData({
        level: '',
        subject: '',
        location: '',
        tutor_name: '',
        day1: '',
        time1: '',
        day2: '',
        time2: '',
        monthly_fee: '',
        sessions_per_week: 2
      });
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (formData.level) params.level = formData.level;
      if (formData.subject) params.subject = formData.subject;
      if (formData.location) params.location = formData.location;

      const response = await axios.get(`${BACKEND_URL}/api/admin/search-classes`, { params });
      setSearchResults(response.data.classes || []);
      setMessage(`Found ${response.data.count} classes`);
    } catch (error) {
      setMessage(`❌ Search error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;

    try {
      await axios.post(`${BACKEND_URL}/api/admin/manage-class`, {
        action: 'delete',
        class_id: classId
      });
      setMessage(`✅ Class deleted: ${classId}`);
      handleSearch(); // Refresh results
    } catch (error) {
      setMessage(`❌ Delete error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PageHeader 
        title="Admin Panel"
        subtitle="Manage Tuition Class Data"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Add Class Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">➕ Add New Class</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                  <select
                    required
                    value={formData.level}
                    onChange={(e) => handleFormChange('level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Level</option>
                    <option value="P2">P2</option>
                    <option value="P3">P3</option>
                    <option value="P4">P4</option>
                    <option value="P5">P5</option>
                    <option value="P6">P6</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                    <option value="S4">S4</option>
                    <option value="J1">J1</option>
                    <option value="J2">J2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => handleFormChange('subject', e.target.value)}
                    disabled={!formData.level}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{formData.level ? 'Select Subject' : 'Select level first'}</option>
                    {getSubjectOptions(formData.level).map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <select
                    required
                    value={formData.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                    disabled={!formData.level || !formData.subject}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!formData.level || !formData.subject 
                        ? 'Select level & subject first' 
                        : availableLocations.length === 0 
                          ? 'Loading...'
                          : 'Select Location'}
                    </option>
                    {availableLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tutor Name *</label>
                  {isNewTutor ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        required
                        value={formData.tutor_name}
                        onChange={(e) => setFormData({...formData, tutor_name: e.target.value})}
                        placeholder="e.g., Mr John Lee (DY HOD)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewTutor(false);
                          setFormData({...formData, tutor_name: ''});
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Choose from existing tutors
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <select
                        required={!isNewTutor}
                        value={formData.tutor_name}
                        onChange={(e) => handleFormChange('tutor_name', e.target.value)}
                        disabled={!formData.level || !formData.subject || !formData.location}
                        className="w-full px-3 py-2 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm appearance-none"
                        style={{ 
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.5rem center',
                          backgroundSize: '1.5em 1.5em'
                        }}
                      >
                        <option value="">
                          {!formData.level || !formData.subject || !formData.location
                            ? 'Select level/subject/location first'
                            : availableTutors.length === 0
                              ? 'Loading...'
                              : 'Select Existing Tutor'}
                        </option>
                        {availableTutors.map(tutor => (
                          <option key={tutor} value={tutor}>{tutor}</option>
                        ))}
                      </select>
                      {formData.level && formData.subject && formData.location && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewTutor(true);
                            setFormData({...formData, tutor_name: ''});
                          }}
                          className="text-xs text-green-600 hover:text-green-800 font-medium underline"
                        >
                          + Add New Tutor
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {isNewTutor 
                      ? '✍️ Manually enter new tutor name' 
                      : availableTutors.length > 0 
                        ? `📋 ${availableTutors.length} existing tutor(s) found`
                        : formData.location && '✨ No tutors yet - click "+ Add New Tutor"'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day 1 *</label>
                  <select
                    required
                    value={formData.day1}
                    onChange={(e) => setFormData({...formData, day1: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="MON">MON</option>
                    <option value="TUE">TUE</option>
                    <option value="WED">WED</option>
                    <option value="THU">THU</option>
                    <option value="FRI">FRI</option>
                    <option value="SAT">SAT</option>
                    <option value="SUN">SUN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time 1 *</label>
                  <input
                    type="text"
                    required
                    value={formData.time1}
                    onChange={(e) => setFormData({...formData, time1: e.target.value})}
                    placeholder="5:00pm-6:30pm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day 2</label>
                  <select
                    value={formData.day2}
                    onChange={(e) => setFormData({...formData, day2: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="MON">MON</option>
                    <option value="TUE">TUE</option>
                    <option value="WED">WED</option>
                    <option value="THU">THU</option>
                    <option value="FRI">FRI</option>
                    <option value="SAT">SAT</option>
                    <option value="SUN">SUN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time 2</label>
                  <input
                    type="text"
                    value={formData.time2}
                    onChange={(e) => setFormData({...formData, time2: e.target.value})}
                    placeholder="12:00pm-1:30pm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.monthly_fee}
                    onChange={(e) => setFormData({...formData, monthly_fee: e.target.value})}
                    placeholder="397.85"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sessions/Week *</label>
                  <input
                    type="number"
                    required
                    value={formData.sessions_per_week}
                    onChange={(e) => setFormData({...formData, sessions_per_week: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-90"
              >
                {isLoading ? 'Adding...' : '➕ Add Class'}
              </Button>
            </form>

            {message && (
              <div className={`mt-4 p-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message}
              </div>
            )}
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">🔍 Search Classes</h2>
            
            <div className="flex gap-4 mb-6">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
              <Button
                onClick={() => setSearchResults([])}
                variant="outline"
              >
                Clear Results
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 font-medium">Found {searchResults.length} classes:</p>
                {searchResults.map((cls, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {cls.level} {cls.subject} - {cls.tutor_base_name}
                        </h3>
                        <p className="text-sm text-gray-600">📍 {cls.location}</p>
                        <p className="text-sm text-gray-600">
                          📅 {cls.schedule.map(s => `${s.day} ${s.time}`).join(' + ')}
                        </p>
                        <p className="text-sm text-gray-600">💰 ${cls.monthly_fee}/month</p>
                        <p className="text-xs text-gray-400 mt-1">ID: {cls.class_id}</p>
                      </div>
                      <Button
                        onClick={() => handleDelete(cls.class_id)}
                        variant="destructive"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Admin;
