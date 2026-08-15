import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../api/axios';
import { Eye, EyeOff, Lock, Mail, User as UserIcon } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          err.response?.data?.message || 'google sign-in failed. please try again. ☁️'
        );
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('google sign-in popup was closed or failed. ☁️');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(
          formData.name,
          formData.email,
          formData.password,
          formData.password_confirmation
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'something went wrong. please check your credentials. ☁️'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 lowercase transition-colors duration-200"
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
        {/* Brand Header with Logo */}
        <div className="text-center flex flex-col items-center gap-1.5">
          <img
            src={logoImg}
            alt="unfiltered logo"
            className="w-24 h-24 rounded-3xl object-contain animate-cute-float"
          />
          <h1
            className="text-4xl font-extrabold tracking-tight mt-0.5"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
          >
            unfiltered
          </h1>
          <p className="text-[13.5px] font-medium" style={{ color: 'var(--ink-soft)' }}>
            {isLogin
              ? 'welcome back to your cozy journaling nook 🌸'
              : 'create a safe space for your unfiltered thoughts ✨'}
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
                <UserIcon size={13} /> your name
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
                placeholder="e.g. karylle 🌸"
              />
            </div>
          )}

          <div>
            <label className="block text-[12px] font-bold text-[var(--ink-soft)] mb-1.5 flex items-center gap-1">
              <Mail size={13} /> email address
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
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[var(--ink-soft)] mb-1.5 flex items-center gap-1">
              <Lock size={13} /> password
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
                aria-label={showPassword ? 'hide password' : 'show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {isLogin && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  className="text-[11.5px] font-bold text-[var(--ink-soft)] hover:text-[var(--accent)] transition"
                >
                  forgot password?
                </button>
              </div>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[12px] font-bold text-[var(--ink-soft)] mb-1.5 flex items-center gap-1">
                <Lock size={13} /> confirm password
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
                  aria-label={showConfirmPassword ? 'hide confirm password' : 'show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
              {loading ? 'opening your journal...' : isLogin ? 'open my diary 🌸' : 'create my sanctuary ✨'}
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
                  or
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
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.5l2.7-2.6C16.8 3.4 14.7 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 11.5-4.8 11.5-11.6 0-.8-.1-1.4-.2-2H12Z" />
                  <path fill="#34A853" d="M3.8 7.3l3.4 2.5c.9-1.7 2.9-2.9 4.8-2.9 1.9 0 3.2.8 4 1.5l2.7-2.6C16.8 3.4 14.7 2.5 12 2.5c-3.9 0-7.2 2.3-8.2 5.8Z" />
                  <path fill="#FBBC05" d="M3.8 16.7c1.5 3 4.5 5 8.2 5 2.7 0 4.9-.9 6.5-2.5l-3-2.5c-.8.6-1.9 1.1-3.5 1.1-2.6 0-4.8-1.7-5.5-4.1l-3.7 2.9Z" />
                  <path fill="#4285F4" d="M12 21.5c2.7 0 4.9-.9 6.5-2.5l-3-2.5c-.8.6-1.9 1.1-3.5 1.1-2.6 0-4.8-1.7-5.5-4.1L.5 17.5A10.4 10.4 0 0 0 12 21.5Z" />
                </svg>
                continue with google
              </button>
            </>
          )}
        </form>

        <div className="text-center pt-2 border-t border-[var(--border-soft)]">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-[13px] font-bold text-[var(--ink-soft)] hover:text-[var(--accent)] transition"
          >
            {isLogin
              ? "don't have a diary yet? start writing here ✨"
              : 'already have a diary? open it here 🌸'}
          </button>
        </div>
      </div>
    </div>
  );
}