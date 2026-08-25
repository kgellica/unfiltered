import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Point this at your running Laravel API's LAN IP — 'localhost' does NOT
// work from a physical phone (it means "the phone itself", not your PC).
// Find your PC's IP with `ipconfig` (Windows) and start Laravel with:
//   php artisan serve --host=0.0.0.0 --port=8000
// Then set EXPO_PUBLIC_API_URL in a .env file, e.g.:
//   EXPO_PUBLIC_API_URL=http://192.168.1.23:8000/api
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.8.35:8000/api';
export const TOKEN_KEY = 'unfiltered_auth_token';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json' },
  timeout: 10000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;