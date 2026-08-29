import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import {
  getToken,
  setToken as storeToken,
  deleteToken,
  getSavedEmail,
  setSavedEmail,
  deleteSavedEmail,
  getBiometricEnabled,
  setBiometricEnabled as storeBiometricEnabled,
} from '../api/secureAuthStorage';
import * as authApi from '../api/auth';
import eventEmitter from '../utils/eventEmitter';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedEmail, setSavedEmailState] = useState(null);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);

  useEffect(() => {
    (async () => {
      const [storedToken, email, bioEnabled] = await Promise.all([
        getToken(),
        getSavedEmail(),
        getBiometricEnabled(),
      ]);
      console.log('AuthProvider init - token:', !!storedToken);
      setSavedEmailState(email);
      setBiometricEnabledState(bioEnabled);
      setTokenState(storedToken);
      setLoading(false);
    })();
  }, []);

  const unlockWithBiometrics = useCallback(async () => {
    const currentToken = await getToken();
    if (!currentToken) return false;
    try {
      const res = await client.get('/me');
      setUser(res.data.user);
      return true;
    } catch (e) {
      await deleteToken();
      setTokenState(null);
      return false;
    }
  }, []);

  // `rememberMe = true` (the default) behaves exactly as before: the token
  // and email are written to SecureStore so the session (and PIN/biometric
  // quick-login) survive an app restart. `rememberMe = false` keeps the
  // token in memory only for the current app session — nothing is written
  // to SecureStore, so the app returns to a fresh login screen next launch.
  const persistSession = useCallback(async (accessToken, nextUser, rememberMe = true) => {
    console.log('persistSession - token:', !!accessToken, 'rememberMe:', rememberMe);
    if (rememberMe) {
      await storeToken(accessToken);
      await setSavedEmail(nextUser.email);
      setSavedEmailState(nextUser.email);
    } else {
      // Make sure no stale session from a previous "remembered" login lingers.
      await deleteToken();
      await deleteSavedEmail();
      setSavedEmailState(null);
    }
    setTokenState(accessToken);
    setUser(nextUser);
    console.log('persistSession - token set in state');
    // EMIT EVENT TO FORCE UPDATE
    eventEmitter.emit('TOKEN_UPDATED', { token: accessToken });
  }, []);

  const login = useCallback(
    async (email, password, rememberMe = true) => {
      console.log('login called');
      const data = await authApi.login({ email, password });
      console.log('login - access_token:', !!data.access_token);
      await persistSession(data.access_token, data.user, rememberMe);
      return data.user;
    },
    [persistSession]
  );

  const loginWithPin = useCallback(
    async (email, pin) => {
      console.log('loginWithPin called');
      const data = await authApi.loginWithPin({ email, pin });
      console.log('loginWithPin - access_token:', !!data.access_token);
      await persistSession(data.access_token, data.user);
      return data.user;
    },
    [persistSession]
  );

  const register = useCallback(
    async ({ name, email, password, passwordConfirmation, pin }) => {
      const data = await authApi.register({ name, email, password, passwordConfirmation, pin });
      await persistSession(data.access_token, data.user);
      return data.user;
    },
    [persistSession]
  );

  const enableBiometricLogin = useCallback(async () => {
    await storeBiometricEnabled(true);
    setBiometricEnabledState(true);
  }, []);

  const disableBiometricLogin = useCallback(async () => {
    await storeBiometricEnabled(false);
    setBiometricEnabledState(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await client.post('/logout');
    } catch (e) {}
    await deleteToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    savedEmail,
    biometricEnabled,
    login,
    loginWithPin,
    unlockWithBiometrics,
    register,
    enableBiometricLogin,
    disableBiometricLogin,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};