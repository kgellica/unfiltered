import { Mail, Lock } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import PasswordInput from '../PasswordInput';
import PasswordStrengthBar from '../PasswordStrengthBar';

export default function ForgotPasswordForm({
  forgotData, onChange, onSubmit, loading, error, success, onBackToLogin,
}) {
  return (
    <>
      <div className="text-center flex flex-col items-center gap-1.5">
        <img src={logoImg} alt="unfiltered logo" className="w-24 h-24 rounded-3xl object-contain animate-cute-float" />
        <h1 className="text-3xl font-extrabold tracking-tight mt-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
          forgot password
        </h1>
        <p className="text-[13.5px] font-medium" style={{ color: 'var(--ink-soft)' }}>
          enter your account email and set a new password
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-semibold rounded-2xl">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-[13px] font-semibold rounded-2xl" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
          {success}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-[12px] font-bold text-[var(--ink-soft)] mb-1.5 flex items-center gap-1">
            <Mail size={13} /> email address
          </label>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={forgotData.email}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-2xl border text-[14px] font-medium outline-none transition focus:border-[var(--accent)]"
            style={{ background: 'var(--surface-muted)', borderColor: 'var(--border-soft)', color: 'var(--ink)' }}
            placeholder="Enter your email address"
          />
        </div>

        <div>
          <PasswordInput
            label="new password"
            icon={Lock}
            name="password"
            required
            autoComplete="new-password"
            value={forgotData.password}
            onChange={onChange}
            placeholder="Enter new password"
          />
          {forgotData.password.length > 0 && <PasswordStrengthBar password={forgotData.password} />}
        </div>

        <PasswordInput
          label="confirm new password"
          icon={Lock}
          name="password_confirmation"
          required
          autoComplete="new-password"
          value={forgotData.password_confirmation}
          onChange={onChange}
          placeholder="Re-enter new password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-1 py-3 rounded-2xl text-[14px] font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
          style={{ background: 'var(--accent)', color: 'var(--accent-ink)', boxShadow: '0 6px 20px -2px var(--accent-soft)' }}
        >
          {loading ? 'resetting...' : 'reset password'}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-[var(--border-soft)]">
        <button onClick={onBackToLogin} className="text-[13px] font-bold text-[var(--ink-soft)] hover:text-[var(--accent)] transition">
          back to log in
        </button>
      </div>
    </>
  );
}