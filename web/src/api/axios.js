import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Automatically attach the Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global Response Interceptor for handling API successes and failures
api.interceptors.response.use(
  (response) => {
    // Optionally return response data directly or keep standard response
    return response;
  },
  (error) => {
    if (!error.response) {
      // Network / Connection errors (e.g. Laravel server down)
      return Promise.reject({
        message: 'unable to connect to the server. please check your network connection.',
        status: 0,
      });
    }

    const { status, data } = error.response;

    // Handle Unauthenticated / Expired Session
    if (status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Extract Laravel validation errors or primary message
    let message = data?.message || 'an unexpected error occurred.';

    if (status === 422 && data?.errors) {
      // Pick the first validation error message from Laravel's errors object
      const firstErrorField = Object.keys(data.errors)[0];
      if (firstErrorField && data.errors[firstErrorField]?.[0]) {
        message = data.errors[firstErrorField][0];
      }
    }

    return Promise.reject({
      status,
      message: message.toLowerCase(),
      errors: data?.errors || null,
      originalError: error,
    });
  }
);

export default api;