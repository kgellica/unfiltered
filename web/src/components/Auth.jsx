import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../api/axios';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, X } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [view, setView] = useState('form'); // 'form' | 'forgot'
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    pin: '',
  });
  const [rememberMe, setRememberMe] = useState(true);

  const [forgotData, setForgotData] = useState({ email: '', password: '', password_confirmation: '' });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState(null);
  const [forgotSuccess, setForgotSuccess] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotChange = (e) => {
    setForgotData({ ...forgotData, [e.target.name]: e.target.value });
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (forgotData.password.length < 8) {
      setForgotError('your new password needs to be at least 8 characters. ');
      return;
    }
    if (forgotData.password !== forgotData.password_confirmation) {
      setForgotError("those passwords don't match. ☁️");
      return;
    }

    setForgotLoading(true);
    try {
      await api.post('/password/forgot', forgotData);
      setForgotSuccess('password updated! you can log in with your new password now. ');
      setForgotData({ email: '', password: '', password_confirmation: '' });
    } catch (err) {
      setForgotError(
        err.response?.data?.message || 'something went wrong. please try again. '
      );
    } finally {
      setForgotLoading(false);
    }
  };

  // Google OAuth Login Handler
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post('/auth/google', {
          token: tokenResponse.access_token,
        });

        const { access_token } = res.data;
        localStorage.setItem('token', access_token);
        window.location.reload();
      } catch (err) {
        setError(
          err.response?.data?.message || 'Google sign-in failed. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in popup was closed or failed.');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Check terms agreement for registration
    if (!isLogin && !agreeToTerms) {
      setError('Please agree to the terms and conditions to continue.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password, rememberMe);
      } else {
        await register(
          formData.name,
          formData.email,
          formData.password,
          formData.password_confirmation,
          formData.pin
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-colors duration-200"
      style={{ background: 'var(--bg-page)' }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8 flex flex-col gap-5 animate-cute-pop"
        style={{
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
        }}
      >
        {view === 'forgot' ? (
          <>
            <div className="text-center flex flex-col items-center gap-1.5">
              <img
                src={logoImg}
                alt="unfiltered logo"
                className="w-24 h-24 rounded-3xl object-contain animate-cute-float"
              />
              <h1
                className="text-3xl font-extrabold tracking-tight mt-0.5"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
              >
                forgot password
              </h1>
              <p className="text-[13.5px] font-medium" style={{ color: 'var(--ink-soft)' }}>
                enter your account email and set a new password 
              </p>
            </div>

            {forgotError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-semibold rounded-2xl">
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div
                className="p-3 text-[13px] font-semibold rounded-2xl"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-soft)] mb-1.5 flex items-center gap-1">
                  <Mail size={13} /> email address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={forgotData.email}
                  onChange={handleForgotChange}
                  className="w-full px-4 py-3 rounded-2xl border text-[14px] font-medium outline-none transition focus:border-[var(--accent)]"
                  style={{
                    background: 'var(--surface-muted)',
                    borderColor: 'var(--border-soft)',
                    color: 'var(--ink)',
                  }}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-soft)] mb-1.5 flex items-center gap-1">
                  <Lock size={13} /> new password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={forgotData.password}
                  onChange={handleForgotChange}
                  className="w-full px-4 py-3 rounded-2xl border text-[14px] font-medium outline-none transition focus:border-[var(--accent)]"
                  style={{
                    background: 'var(--surface-muted)',
                    borderColor: 'var(--border-soft)',
                    color: 'var(--ink)',
                  }}
                  placeholder="at least 8 characters"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-soft)] mb-1.5 flex items-center gap-1">
                  <Lock size={13} /> confirm new password
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  required
                  value={forgotData.password_confirmation}
                  onChange={handleForgotChange}
                  className="w-full px-4 py-3 rounded-2xl border text-[14px] font-medium outline-none transition focus:border-[var(--accent)]"
                  style={{
                    background: 'var(--surface-muted)',
                    borderColor: 'var(--border-soft)',
                    color: 'var(--ink)',
                  }}
                  placeholder="re-enter your new password"
                />
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full mt-1 py-3 rounded-2xl text-[14px] font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-ink)',
                  boxShadow: '0 6px 20px -2px var(--accent-soft)',
                }}
              >
                {forgotLoading ? 'resetting...' : 'reset password'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[var(--border-soft)]">
              <button
                onClick={() => setView('form')}
                className="text-[13px] font-bold text-[var(--ink-soft)] hover:text-[var(--accent)] transition"
              >
                back to log in
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Brand Header with Logo */}
            <div className="text-center flex flex-col items-center gap-1.5">
              <img
                src={logoImg}
                alt="Unfiltered Logo"
                className="w-32 h-32 rounded-3xl object-contain animate-cute-float"
              />
              <h1
                className="text-4xl font-extrabold tracking-tight mt-0.5"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
              >
                unfiltered
              </h1>
              <p className="text-[13.5px] font-medium" style={{ color: 'var(--ink-soft)' }}>
                {isLogin
                  ? 'welcome back to your cozy journaling nook'
                  : 'create a safe space for your unfiltered thoughts'}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-semibold rounded-2xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink-soft)] mb-1.5 flex items-center gap-1">
                    <UserIcon size={13} /> Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl border text-[14px] font-medium outline-none transition focus:border-[var(--accent)]"
                    style={{
                      background: 'var(--surface-muted)',
                      borderColor: 'var(--border-soft)',
                      color: 'var(--ink)',
                    }}
                    placeholder="E.g. Karylle"
                  />
                </div>
              )}

              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-soft)] mb-1.5 flex items-center gap-1">
                  <Mail size={13} /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border text-[14px] font-medium outline-none transition focus:border-[var(--accent)]"
                  style={{
                    background: 'var(--surface-muted)',
                    borderColor: 'var(--border-soft)',
                    color: 'var(--ink)',
                  }}
                  placeholder="yourname@gmail.com"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-soft)] mb-1.5 flex items-center gap-1">
                  <Lock size={13} /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-11 rounded-2xl border text-[14px] font-medium outline-none transition focus:border-[var(--accent)]"
                    style={{
                      background: 'var(--surface-muted)',
                      borderColor: 'var(--border-soft)',
                      color: 'var(--ink)',
                    }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--accent)] transition"
                    aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {isLogin && (
                  <div className="mt-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-[11.5px] font-bold text-[var(--ink-soft)] cursor-pointer select-none">
                      <span
                        onClick={() => setRememberMe((prev) => !prev)}
                        className="flex items-center justify-center w-4 h-4 rounded-md border transition"
                        style={{
                          borderColor: 'var(--border-soft)',
                          background: rememberMe ? 'var(--accent)' : 'var(--surface-muted)',
                        }}
                      >
                        {rememberMe && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-ink)" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotError(null);
                        setForgotSuccess(null);
                        setView('forgot');
                      }}
                      className="text-[11.5px] font-bold text-[var(--ink-soft)] hover:text-[var(--accent)] transition"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink-soft)] mb-1.5 flex items-center gap-1">
                    <Lock size={13} /> Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="password_confirmation"
                      required
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-11 rounded-2xl border text-[14px] font-medium outline-none transition focus:border-[var(--accent)]"
                      style={{
                        background: 'var(--surface-muted)',
                        borderColor: 'var(--border-soft)',
                        color: 'var(--ink)',
                      }}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--accent)] transition"
                      aria-label={showConfirmPassword ? 'Hide Confirm Password' : 'Show Confirm Password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {!isLogin && (
                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink-soft)] mb-1.5 flex items-center gap-1">
                    <Lock size={13} /> 6-Digit PIN
                  </label>
                  <input
                    type="text"
                    name="pin"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    value={formData.pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, pin: val });
                    }}
                    className="w-full px-4 py-3 rounded-2xl border text-[14px] font-medium outline-none transition focus:border-[var(--accent)]"
                    style={{
                      background: 'var(--surface-muted)',
                      borderColor: 'var(--border-soft)',
                      color: 'var(--ink)',
                    }}
                    placeholder="123456"
                  />
                </div>
              )}

              {/* Terms & Conditions Checkbox (only for registration) */}
              {!isLogin && (
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-[var(--border-soft)] accent-[var(--accent)] cursor-pointer shrink-0"
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <label htmlFor="terms" className="text-[12px] font-medium text-[var(--ink-soft)]">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-[var(--accent)] hover:underline font-bold"
                    >
                      Terms of Service & Privacy Policy
                    </button>
                  </label>
                </div>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-3 rounded-2xl text-[14px] font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--accent-ink)',
                    boxShadow: '0 6px 20px -2px var(--accent-soft)',
                  }}
                >
                  {loading ? 'Logging In...' : isLogin ? 'Log In' : 'Register'}
                </button>
              </div>

              {isLogin && (
                <>
                  <div className="relative flex items-center justify-center my-5">
                    <div className="w-full border-t border-[var(--border-soft)]" />
                    <span
                      className="absolute bg-[var(--surface)] px-3 text-[10.5px] font-extrabold uppercase rounded-full"
                      style={{
                        color: 'var(--accent)',
                        letterSpacing: '0.24em',
                        border: '1px solid var(--border-soft)',
                      }}
                    >
                      Or
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGoogleLogin()}
                    disabled={loading}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-[14px] font-bold transition hover:scale-[1.01] active:scale-95 cursor-pointer disabled:opacity-50"
                    style={{
                      background: 'var(--surface-muted)',
                      borderColor: 'var(--border-soft)',
                      color: 'var(--ink)',
                    }}
                  >
                    <img src="/google-logo.png" alt="Google" className="w-5 h-5 object-contain" onError={(e) => { e.target.src = "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"; }} />
                    Continue with Google
                  </button>
                </>
              )}
            </form>

            <div className="text-center pt-2 border-t border-[var(--border-soft)]">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setAgreeToTerms(false);
                }}
                className="text-[13px] font-bold text-[var(--ink-soft)] hover:text-[var(--ink)] transition"
              >
                {isLogin ? (
                  <>Don't have an account yet? <span style={{ color: 'var(--accent)' }}>Register Here</span></>
                ) : (
                  <>Already have an account? <span style={{ color: 'var(--accent)' }}>Log In Here</span></>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(35, 25, 20, 0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="max-w-md w-full max-h-[80vh] rounded-3xl p-6 overflow-y-auto animate-cute-pop"
            style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border-soft)',
              boxShadow: 'var(--modal-shadow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
              >
                Terms of Service & Privacy Policy
              </h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1 rounded-full hover:bg-black/5 transition"
                style={{ color: 'var(--ink-soft)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Terms Content */}
            <div className="space-y-4 text-[13px] font-medium leading-relaxed normal-case" style={{ color: 'var(--ink-soft)' }}>
              {/* Terms of Service */}
              <div>
                <h3 className="text-[15px] font-bold text-[var(--ink)] mb-2">Terms of Service</h3>
                <p className="mb-2">By using Unfiltered, you agree to the following terms:</p>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">•</span>
                    <p>This app is created for academic purposes as part of an HCI & UX Design project.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">•</span>
                    <p>All data entered is for demonstration purposes only and is not stored permanently.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">•</span>
                    <p>You are responsible for the content you create and share within the app.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">•</span>
                    <p>The app is provided "as is" without warranties of any kind.</p>
                  </div>
                </div>
              </div>

              {/* Privacy Policy */}
              <div>
                <h3 className="text-[15px] font-bold text-[var(--ink)] mb-2">Privacy Policy</h3>
                <p className="mb-2">Your privacy matters to us. Here's how we handle your data:</p>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">•</span>
                    <p>No personal data is collected, stored, or shared with third parties.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">•</span>
                    <p>All journal entries are stored locally on your device and are not transmitted to external servers.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">•</span>
                    <p>Your email and password are used solely for authentication within the app.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--accent)]">•</span>
                    <p>No analytics or tracking tools are implemented in this application.</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--border-soft)] pt-3" />

              {/* Acknowledgment */}
              <p className="text-[12px] italic opacity-75">
                By tapping "I Agree", you acknowledge that you have read and understood these terms.
              </p>
            </div>

            {/* Action Buttons - Side by Side */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setShowTermsModal(false);
                }}
                className="flex-1 py-3 rounded-2xl text-[14px] font-bold transition hover:bg-black/5 cursor-pointer"
                style={{ color: 'var(--ink-soft)', background: 'var(--surface-muted)' }}
              >
                Decline
              </button>
              <button
                onClick={() => {
                  setAgreeToTerms(true);
                  setShowTermsModal(false);
                }}
                className="flex-1 py-3 rounded-2xl text-[14px] font-bold text-white transition hover:scale-[1.02] active:scale-95 cursor-pointer"
                style={{ background: 'var(--accent)' }}
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}