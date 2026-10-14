import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bit_clubs_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch user details on initial load if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const safeParseResponse = async (res, defaultAction) => {
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Server returned status ${res.status}. Please check your connection or database configuration.`);
    }
    if (!res.ok) {
      throw new Error(data.error || `${defaultAction} failed`);
    }
    return data;
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await safeParseResponse(res, 'Login');

    localStorage.setItem('bit_clubs_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (studentData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    const data = await safeParseResponse(res, 'Registration');

    localStorage.setItem('bit_clubs_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('bit_clubs_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
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
