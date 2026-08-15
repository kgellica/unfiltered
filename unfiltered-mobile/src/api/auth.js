import client from './client';

// Exchanges a Google access token for our own app's bearer token.
// Backend: POST /auth/google -> AuthController@googleLogin
export const googleLogin = (accessToken) =>
  client.post('/auth/google', { token: accessToken }).then((r) => r.data);