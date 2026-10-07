import { Lock, Mail, User as UserIcon } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import PasswordInput from '../PasswordInput';
import PasswordStrengthBar from '../PasswordStrengthBar';

export default function LoginRegisterForm({
  isLogin, formData, onChange, onSubmit, error, loading,
  rememberMe, setRememberMe, onForgotClick,
  agreeToTerms, setAgreeToTerms, onShowTerms,
  onGoogleLogin, onToggleMode,
}) {
  const handlePinChange = (e) => {
    onChange({ target: { name: 'pin', value: e.target.value.replace(/\D/g, '') } });
  };

  return (
    <>
      <div className="text-center flex flex-col items-center gap-1.5">
        <img src={logoImg} alt="Unfiltered Logo" className="w-32 h-32 rounded-3xl object-contain animate-cute-float" />
        <h1 className="text-4xl font-extrabold tracking-tight mt-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
          unfiltered
        </h1>
        <p className="text-[13.5px] font-medium" style={{ color: 'var(--ink-soft)' }}>
          {isLogin ? 'welcome back to your cozy journaling nook' : 'create a safe space for your unfiltered thoughts'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-semibold rounded-2xl">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-[12px] font-bold text-[var(--ink-soft)] mb-1.5 flex items-center gap-1">
              <UserIcon size={13} /> Your Name
            </label>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              value={formData.name}
              onChange={onChange}
              className="w-full px-4 py-3 rounded-2xl border text-[14px] font-medium outline-none transition focus:border-[var(--accent)]"
              style={{ background: 'var(--surface-muted)', borderColor: 'var(--border-soft)', color: 'var(--ink)' }}
              placeholder="Enter your name"
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
            autoComplete="email"
            value={formData.email}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-2xl border text-[14px] font-medium outline-none transition focus:border-[var(--accent)]"
            style={{ background: 'var(--surface-muted)', borderColor: 'var(--border-soft)', color: 'var(--ink)' }}
            placeholder="Enter your email address"
          />
        </div>

        <div>
          <PasswordInput
            label="Password"
            icon={Lock}
            name="password"
            required
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            value={formData.password}
            onChange={onChange}
            placeholder={isLogin ? '••••••••' : 'Enter password'}
          />

          {!isLogin && formData.password.length > 0 && <PasswordStrengthBar password={formData.password} />}

          {isLogin && (
            <div className="mt-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-[11.5px] font-bold text-[var(--ink-soft)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-soft)] cursor-pointer accent-[var(--accent)]"
                />
                remember me
              </label>
              <button type="button" onClick={onForgotClick} className="text-[11.5px] font-bold text-[var(--ink-soft)] hover:text-[var(--accent)] transition">
                Forgot Password?
              </button>
            </div>
          )}
        </div>

        {!isLogin && (
          <PasswordInput
            label="Confirm Password"
            icon={Lock}
            name="password_confirmation"
            required
            autoComplete="new-password"
            value={formData.password_confirmation}
            onChange={onChange}
            placeholder="Re-enter password"
          />
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
              onChange={handlePinChange}
              className="w-full px-4 py-3 rounded-2xl border text-[14px] font-medium outline-none transition focus:border-[var(--accent)]"
              style={{ background: 'var(--surface-muted)', borderColor: 'var(--border-soft)', color: 'var(--ink)' }}
              placeholder="123456"
            />
          </div>
        )}

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
              <button type="button" onClick={onShowTerms} className="text-[var(--accent)] hover:underline font-bold">
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
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)', boxShadow: '0 6px 20px -2px var(--accent-soft)' }}
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
                style={{ color: 'var(--accent)', letterSpacing: '0.24em', border: '1px solid var(--border-soft)' }}
              >
                Or
              </span>
            </div>

            <button
              type="button"
              onClick={onGoogleLogin}
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-[14px] font-bold transition hover:scale-[1.01] active:scale-95 cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--surface-muted)', borderColor: 'var(--border-soft)', color: 'var(--ink)' }}
            >
              <img
                src="/google-logo.png"
                alt="Google"
                className="w-5 h-5 object-contain"
                onError={(e) => { e.target.src = "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"; }}
              />
              Continue with Google
            </button>
          </>
        )}
      </form>

      <div className="text-center pt-2 border-t border-[var(--border-soft)]">
        <button onClick={onToggleMode} className="text-[13px] font-bold text-[var(--ink-soft)] hover:text-[var(--ink)] transition">
          {isLogin ? (
            <>Don't have an account yet? <span style={{ color: 'var(--accent)' }}>Register Here</span></>
          ) : (
            <>Already have an account? <span style={{ color: 'var(--accent)' }}>Log In Here</span></>
          )}
        </button>
      </div>
    </>
  );
}