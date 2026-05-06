// context/AuthContext.js - Manages login state across the whole app
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if there's a saved token
  useEffect(() => {
    const token = localStorage.getItem('sb_token');

    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      api.get('/auth/me')
        .then(({ data }) => {
          console.log("AUTH /auth/me RESPONSE:", data); // ✅ ADDED DEBUG

          // ✅ SAFE FALLBACK (prevents empty user issues)
          setUser(data?.user || data || null);
        })
        .catch((err) => {
          console.log("AUTH ERROR /auth/me:", err); // ✅ IMPROVED DEBUG
          localStorage.removeItem('sb_token');
          setUser(null);
        })
        .finally(() => setLoading(false));

    } else {
      setLoading(false);
    }
  }, []);

  // Save token and user after login/register
  function saveAuth(token, userData) {
    localStorage.setItem('sb_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // ✅ SAFE NORMALIZATION
    setUser(userData?.user || userData || null);
  }

  // Clear everything on logout
  function logout() {
    localStorage.removeItem('sb_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access
export function useAuth() {
  return useContext(AuthContext);
}