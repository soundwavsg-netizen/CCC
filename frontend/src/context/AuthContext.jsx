import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('project62_token'));

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('project62_token');
      
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/project62/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // Now includes role field
          setToken(storedToken);
        } else {
          localStorage.removeItem('project62_token');
          setToken(null);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('project62_token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [BACKEND_URL]);

  const login = async (email, password) => {
    try {
      console.log('🔐 Login attempt:', { email, backendUrl: BACKEND_URL });
      const response = await fetch(`${BACKEND_URL}/api/project62/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('📡 Login response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const error = await response.json();
          errorMessage = error.detail || errorMessage;
        } catch (jsonError) {
          // Response is not JSON, use status text
          errorMessage = `Login failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Login successful:', { role: data.user?.role });
      localStorage.setItem('project62_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, name, phone) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name, phone })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('project62_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const sendMagicLink = async (email) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/auth/magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to send magic link');
      }

      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyMagicLink = async (token) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/project62/auth/verify-magic-link?token=${token}`);

      if (!response.ok) {
        throw new Error('Invalid or expired magic link');
      }

      const data = await response.json();
      localStorage.setItem('project62_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('project62_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    sendMagicLink,
    verifyMagicLink,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
