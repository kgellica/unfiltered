import { useState } from 'react';
import api from '../../api/axios';
import { Check, Loader2 } from 'lucide-react';
import PasswordInput from '../PasswordInput';
import { getPasswordChecks } from '../../lib/password';

export default function ChangePasswordPage() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwErrors, setPwErrors] = useState({});

  const validatePassword = (pw) => {
    const errs = [];
    if (pw.length < 8) errs.push('8+ characters');
    if (!/[A-Z]/.test(pw)) errs.push('1 uppercase letter');
    if (!/[0-9]/.test(pw)) errs.push('1 number');
    return errs;
  };

  const handleCancelPassword = () => {
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setPwErrors({});
    setPwSuccess(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwSuccess(false);

    const formatErrors = validatePassword(newPw);
    const nextErrors = {};
    if (!currentPw) nextErrors.current_password = 'enter your current password.';
    if (formatErrors.length > 0) nextErrors.password = `password needs: ${formatErrors.join(', ')}.`;
    if (newPw !== confirmPw) nextErrors.confirm = "passwords don't match.";

    if (Object.keys(nextErrors).length > 0) {
      setPwErrors(nextErrors);
      return;
    }

    setPwLoading(true);
    setPwErrors({});
    try {
      await api.patch('/user/password', {
        current_password: currentPw,
        password: newPw,
        password_confirmation: confirmPw,
      });
      setPwSuccess(true);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      const status = err?.response?.status;
      const serverErrors = err?.response?.data?.errors;
      if (status === 422 && serverErrors) {
        const flat = {};
        Object.entries(serverErrors).forEach(([key, msgs]) => { flat[key] = msgs[0]; });
        setPwErrors(flat);
      } else {
        setPwErrors({ general: err?.response?.data?.message || 'failed to update password. try again.' });
      }
    } finally {
      setPwLoading(false);
    }
  };

  const { checks, passedCount: strengthScore } = getPasswordChecks(newPw, ['length', 'upper', 'number']);
  const [pwHasLength, pwHasUpper, pwHasNumber] = checks.map((c) => c.valid);
  const pwIsMatch = confirmPw.length > 0 && newPw === confirmPw;
  const strengthLabels = ['weak', 'fair', 'good', 'strong'];
  const strengthColors = ['bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-500'];

  return (
    <form onSubmit={handleChangePassword} className="flex flex-col gap-4 pt-2">
      {pwErrors.general && (
        <p className="text-[12px] text-red-500 px-1 font-medium">{pwErrors.general}</p>
      )}
      {pwSuccess && (
        <div className="flex items-center gap-2 text-[12px] font-bold text-emerald-500 px-1">
          <Check size={14} strokeWidth={2.5} /> password updated successfully!
        </div>
      )}

      <div>
        <PasswordInput
          label="current password"
          value={currentPw}
          onChange={(e) => {
            setCurrentPw(e.target.value);
            setPwErrors((p) => ({ ...p, current_password: undefined, general: undefined }));
            setPwSuccess(false);
          }}
          placeholder="enter current password"
          autoComplete="current-password"
          hasError={!!pwErrors.current_password}
        />
        {pwErrors.current_password && (
          <p className="text-[11px] text-red-500 mt-1 px-1">{pwErrors.current_password}</p>
        )}
      </div>

      <div>
        <PasswordInput
          label="new password"
          value={newPw}
          onChange={(e) => {
            setNewPw(e.target.value);
            setPwErrors((p) => ({ ...p, password: undefined }));
            setPwSuccess(false);
          }}
          placeholder="enter new password"
          autoComplete="new-password"
          hasError={!!pwErrors.password}
        />

        {newPw.length > 0 && (
          <div className="mt-2.5 space-y-2 px-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[var(--border-soft)] rounded-full overflow-hidden flex gap-1 p-0.5">
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthScore >= 1 ? strengthColors[strengthScore] : 'bg-transparent'}`} />
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthScore >= 2 ? strengthColors[strengthScore] : 'bg-transparent'}`} />
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthScore >= 3 ? strengthColors[strengthScore] : 'bg-transparent'}`} />
              </div>
              <span className="text-[11px] font-bold capitalize text-[var(--ink-soft)] w-12 text-right">
                {strengthLabels[strengthScore]}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 text-[11px] font-medium">
              <span className={`flex items-center gap-1 transition-colors ${pwHasLength ? 'text-emerald-500 font-bold' : 'text-[var(--ink-faint)]'}`}>
                <Check size={12} strokeWidth={3} className={pwHasLength ? 'opacity-100' : 'opacity-30'} /> 8+ chars
              </span>
              <span className={`flex items-center gap-1 transition-colors ${pwHasUpper ? 'text-emerald-500 font-bold' : 'text-[var(--ink-faint)]'}`}>
                <Check size={12} strokeWidth={3} className={pwHasUpper ? 'opacity-100' : 'opacity-30'} /> 1 uppercase
              </span>
              <span className={`flex items-center gap-1 transition-colors ${pwHasNumber ? 'text-emerald-500 font-bold' : 'text-[var(--ink-faint)]'}`}>
                <Check size={12} strokeWidth={3} className={pwHasNumber ? 'opacity-100' : 'opacity-30'} /> 1 number
              </span>
            </div>
          </div>
        )}

        {pwErrors.password && (
          <p className="text-[11px] text-red-500 mt-1 px-1">{pwErrors.password}</p>
        )}
      </div>

      <div>
        <PasswordInput
          label="confirm new password"
          value={confirmPw}
          onChange={(e) => {
            setConfirmPw(e.target.value);
            setPwErrors((p) => ({ ...p, confirm: undefined }));
            setPwSuccess(false);
          }}
          placeholder="re-enter new password"
          autoComplete="new-password"
          hasError={!!pwErrors.confirm}
        />

        {confirmPw.length > 0 && (
          <p className={`text-[11px] mt-1.5 px-1 flex items-center gap-1 font-medium ${pwIsMatch ? 'text-emerald-500 font-bold' : 'text-amber-500'}`}>
            <Check size={11} strokeWidth={3} className={pwIsMatch ? 'opacity-100' : 'opacity-30'} />
            {pwIsMatch ? 'passwords match' : "passwords don't match yet"}
          </p>
        )}

        {pwErrors.confirm && (
          <p className="text-[11px] text-red-500 mt-1 px-1">{pwErrors.confirm}</p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={handleCancelPassword}
          disabled={pwLoading}
          className="flex-1 py-3 rounded-2xl text-[14px] font-bold border border-[var(--border-soft)] text-[var(--ink-soft)] hover:bg-[var(--surface-muted)] transition cursor-pointer disabled:opacity-50"
        >
          cancel
        </button>
        <button
          type="submit"
          disabled={pwLoading}
          className="flex-1 py-3 rounded-2xl text-[14px] font-bold text-white transition hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'var(--accent)' }}
        >
          {pwLoading ? <><Loader2 size={15} className="animate-spin" /> updating...</> : 'save changes'}
        </button>
      </div>
    </form>
  );
}