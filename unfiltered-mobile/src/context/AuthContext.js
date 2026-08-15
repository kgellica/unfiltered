import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { TOKEN_KEY } from '../api/client';
import { googleLogin as googleLoginRequest } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await client.get('/me');
          setUser(res.data.user);
        } catch (e) {
          await AsyncStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await client.post('/login', { email, password });
    await AsyncStorage.setItem(TOKEN_KEY, res.data.access_token);
    setToken(res.data.access_token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await client.post('/register', { name, email, password });
    await AsyncStorage.setItem(TOKEN_KEY, res.data.access_token);
    setToken(res.data.access_token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const loginWithGoogle = useCallback(async (googleAccessToken) => {
    const data = await googleLoginRequest(googleAccessToken);
    await AsyncStorage.setItem(TOKEN_KEY, data.access_token || data.token);
    setToken(data.access_token || data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await client.post('/logout');
    } catch (e) {}
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, loginWithGoogle, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);