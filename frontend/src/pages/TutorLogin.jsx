import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const TutorLogin = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [tempToken, setTempToken] = useState('');

  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://education-analytics.preview.emergentagent.com';

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/tutor/login`, {
        login_id: loginId,
        password: password
      });

      if (response.data.access_token) {
        const tutorInfo = response.data.tutor_info;

        if (tutorInfo.must_change_password) {
          // First-time login - show password change form
          setMustChangePassword(true);
          setTempToken(response.data.access_token);
          setMessage('⚠️ Please change your password before continuing');
        } else {
          // Normal login - save token and redirect
          localStorage.setItem('tutor_token', response.data.access_token);
          localStorage.setItem('tutor_info', JSON.stringify(tutorInfo));
          setMessage('✅ Login successful! Redirecting...');
          setTimeout(() => {
            navigate('/demo/math-analysis');
          }, 1000);
        }
      }
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.detail || 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validation
    if (newPassword.length < 6) {
      setMessage('❌ Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('❌ Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/tutor/change-password`,
        {
          old_password: password,
          new_password: newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${tempToken}`
          }
        }
      );

      if (response.data.success) {
        // Save new token and redirect
        localStorage.setItem('tutor_token', response.data.access_token);
        const tutorInfoResponse = await axios.get(`${BACKEND_URL}/api/tutor/profile`, {
          headers: {
            'Authorization': `Bearer ${response.data.access_token}`
          }
        });
        localStorage.setItem('tutor_info', JSON.stringify(tutorInfoResponse.data.tutor));
        
        setMessage('✅ Password changed successfully! Redirecting...');
        setTimeout(() => {
          navigate('/demo/math-analysis');
        }, 1500);
      }
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.detail || 'Password change failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {mustChangePassword ? '🔐 Change Password' : '👨‍🏫 Tutor Login'}
            </h1>
            <p className="text-gray-600">
              {mustChangePassword 
                ? 'Set your new password to continue'
                : 'Math Results Analysis System'}
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.startsWith('✅') ? 'bg-green-100 text-green-800' : 
              message.startsWith('⚠️') ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {!mustChangePassword ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Login ID
                </label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g., seanyeo"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                {loading ? '⏳ Logging in...' : '🔑 Login'}
              </Button>
            </form>
          ) : (
            /* Password Change Form */
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ This is your first login. Please create a new password for security.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all"
              >
                {loading ? '⏳ Updating...' : '✨ Set New Password'}
              </Button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact your administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorLogin;
