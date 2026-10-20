import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper fetch function that automatically sets authorization headers
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token might be expired, log user out
      logout();
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Response is not JSON
        try {
          errorMessage = await response.text();
        } catch (_) {}
      }
      throw new Error(errorMessage);
    }

    // Handle empty or JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return null;
  };

  // Load user profile when token changes
  useEffect(() => {
    const loadProfile = async () => {
      if (token) {
        try {
          const profileData = await authFetch('/api/auth/profile');
          setUser(profileData);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    };
    loadProfile();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (registerData) => {
    // registerData keys: email, password, firstName, lastName, phoneNumber
    return await authFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
  };

  const updateProfile = async (profileData) => {
    // profileData keys: firstName, lastName, phoneNumber
    const updatedUser = await authFetch('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    setUser(updatedUser);
    return updatedUser;
  };

  const forgotPassword = async (email) => {
    return await authFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  };

  const resetPassword = async (token, newPassword) => {
    return await authFetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
