import client from './client';

// Backend: POST /register -> AuthController@register
// Creates the account (name/email/password/PIN, collected across SignUpScreen
// + PinSetupScreen) and returns a Sanctum bearer token immediately — no email
// verification step.
export const register = ({ name, email, password, passwordConfirmation, pin }) =>
  client
    .post('/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      pin,
    })
    .then((r) => r.data);

// Backend: POST /login -> AuthController@login (email + password fallback)
export const login = ({ email, password }) =>
  client.post('/login', { email, password }).then((r) => r.data);

// Backend: POST /login/pin -> AuthController@loginPin
export const loginWithPin = ({ email, pin }) =>
  client.post('/login/pin', { email, pin }).then((r) => r.data);

// Simple, self-service password reset (no email/OTP round trip — the user
// just proves they know the account email and sets a new password).
// Backend: POST /password/forgot -> AuthController@forgotPassword
export const forgotPassword = ({ email, password, passwordConfirmation }) =>
  client
    .post('/password/forgot', {
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
    .then((r) => r.data);

// Fetches the currently authenticated user.
// Backend: GET /me -> AuthController@me
export const getMe = () => client.get('/me').then((r) => r.data);

// Updates the authenticated user's profile (name / email / avatar_url).
// Backend: PATCH /user/profile -> AuthController@updateProfile
export const updateProfile = (payload) =>
  client.patch('/user/profile', payload).then((r) => r.data.user);

// Changes the authenticated user's password after verifying the current one.
// Backend: PATCH /user/password -> AuthController@changePassword
export const changePassword = (payload) =>
  client.patch('/user/password', payload).then((r) => r.data);

// Backend: POST /logout -> AuthController@logout (revokes the current token)
export const logout = () => client.post('/logout').then((r) => r.data);