import client from './client';

// Exchanges a Google access token for our own app's bearer token.
// Backend: POST /auth/google -> AuthController@googleLogin
export const googleLogin = (accessToken) =>
  client.post('/auth/google', { token: accessToken }).then((r) => r.data);

// Fetches the currently authenticated user.
// Backend: GET /user -> AuthController@user
export const getMe = () => client.get('/user').then((r) => r.data);

// Updates the authenticated user's profile (name / email / avatar_url).
// Backend: PATCH /user/profile -> AuthController@updateProfile
// Returns the updated user object (not the whole response envelope) so
// callers can pass it straight into setUser().
export const updateProfile = (payload) =>
  client.patch('/user/profile', payload).then((r) => r.data.user);

// Changes the authenticated user's password after verifying the current one.
// Backend: PATCH /user/password -> AuthController@changePassword
export const changePassword = (payload) =>
  client.patch('/user/password', payload).then((r) => r.data);
