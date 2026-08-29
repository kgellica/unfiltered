import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial page load. Token may live in
  // localStorage (remembered sessions) or sessionStorage (this-tab-only
  // sessions from an unchecked "Remember me").
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/user');
          setUser(response.data.user);
        } catch (error) {
          console.error('Session expired or invalid token', error);
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // rememberMe = true (default): token persists in localStorage across
  // browser restarts. rememberMe = false: token lives only in
  // sessionStorage, so it's gone once the tab/browser closes.
  const login = async (email, password, rememberMe = true) => {
    const response = await api.post('/login', { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    if (rememberMe) {
      localStorage.setItem('token', access_token);
    } else {
      sessionStorage.setItem('token', access_token);
    }
    setUser(userData);
    return response.data;
  };

  const register = async (name, email, password, password_confirmation) => {
    const response = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation,
    });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    setUser(userData);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);