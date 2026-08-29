import * as SecureStore from 'expo-secure-store';

// All authentication-related data lives in SecureStore (Keychain / Keystore backed), never AsyncStorage — this includes the Sanctum token, the saved
// email, and the local "biometrics enabled" preference. No PINs or biometric data are ever stored here or on the device.
export const TOKEN_KEY = 'unfiltered_auth_token';
export const EMAIL_KEY = 'unfiltered_saved_email';
export const BIOMETRIC_ENABLED_KEY = 'unfiltered_biometric_enabled';

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const setToken = (token) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const deleteToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

export const getSavedEmail = () => SecureStore.getItemAsync(EMAIL_KEY);
export const setSavedEmail = (email) => SecureStore.setItemAsync(EMAIL_KEY, email);
export const deleteSavedEmail = () => SecureStore.deleteItemAsync(EMAIL_KEY);

export const getBiometricEnabled = async () => (await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY)) === 'true';
export const setBiometricEnabled = (enabled) =>
  SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
export const deleteBiometricEnabled = () => SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
