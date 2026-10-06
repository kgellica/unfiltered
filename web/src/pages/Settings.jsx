import { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useJournal } from '../hooks/useJournal';
import ProfileDropdown from '../components/ProfileDropdown';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api/axios';
import { uploadFile } from '../api/uploads';
import { UserCheck, User, Lock, Palette, Camera, Loader2, Eye, EyeOff, Check, Sun, Coffee, Moon, ChevronRight } from 'lucide-react';

const SETTINGS_PAGES = [
  { id: 'user-profile', label: 'user profile', icon: UserCheck },
  { id: 'edit-profile', label: 'edit profile', icon: User },
  { id: 'change-password', label: 'change password', icon: Lock },
  { id: 'theme-ambiance', label: 'theme & ambiance', icon: Palette },
];

// Helper to capitalize first letter of each word
const formatName = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const { mode, setMode, accent, setAccent, customAccent, setCustomAccent } = useTheme();
  const { entries, streak } = useJournal();
  const [activePage, setActivePage] = useState('user-profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  // Edit Profile form state
  const [profileName, setProfileName] = useState(formatName(user?.name) || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Sync profile form state when user changes
  useEffect(() => {
    if (user) {
      setProfileName(formatName(user.name) || '');
      setProfileEmail(user.email || '');
    }
  }, [user]);

  const handleCancelProfile = () => {
    setProfileName(formatName(user?.name) || '');
    setProfileEmail(user?.email || '');
    setProfileError('');
    setProfileSuccess(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);

    const formatted = formatName(profileName);

    if (!formatted.trim()) {
      setProfileError('name cannot be empty.');
      return;
    }
    if (!profileEmail.trim()) {
      setProfileError('email cannot be empty.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await api.patch('/user/profile', {
        name: formatted,
        email: profileEmail,
      });
      updateUser(res.data?.user || { name: formatted, email: profileEmail });
      setProfileName(formatted);
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(err?.response?.data?.message || 'failed to update profile. try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
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

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('please upload a valid picture format (e.g. jpg, png).');
      e.target.value = '';
      return;
    }
    setAvatarUploading(true);
    try {
      const url = await uploadFile(file, 'photo');
      if (url) {
        await api.patch('/user/profile', { avatar_url: url });
        updateUser({ avatar_url: url });
      }
    } catch (err) {
      alert(err.message || 'failed to upload photo.');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  // Get unique tags count from entries
  const uniqueTags = useMemo(() => {
    const tagSet = new Set();
    entries.forEach((entry) => {
      (entry.tags || []).forEach((t) => {
        const tagName = typeof t === 'string' ? t : t.name;
        if (tagName) tagSet.add(tagName);
      });
    });
    return tagSet.size;
  }, [entries]);

  // Format member since date
  const memberSince = useMemo(() => {
    if (!user?.created_at) return 'member recently';
    const date = new Date(user.created_at);
    return `member since ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  }, [user]);

  const ACCENT_PRESETS = [
    { id: 'pink', label: 'sakura pink', hex: '#f472b6' },
    { id: 'purple', label: 'taro purple', hex: '#c084fc' },
    { id: 'green', label: 'matcha green', hex: '#4ade80' },
    { id: 'blue', label: 'baby blue', hex: '#60a5fa' },
    { id: 'brown', label: 'cinnamon latte', hex: '#d4a373' },
  ];

  const renderPage = () => {
    switch (activePage) {
      /* 1. USER PROFILE */
      case 'user-profile':
        return (
          <div className="flex flex-col items-center gap-6 pt-4">
            {/* Profile Picture */}
            <div className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg overflow-hidden" style={{ background: 'var(--accent)' }}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user?.name || 'profile'} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>

            {/* Name, Email, and Member Since */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                {formatName(user?.name) || 'User'}
              </h2>
              <p className="text-[14px] font-medium" style={{ color: 'var(--ink-soft)' }}>
                {user?.email || 'user@email.com'}
              </p>
              <p className="text-[12px] font-semibold opacity-75" style={{ color: 'var(--ink-soft)' }}>
                {memberSince}
              </p>
            </div>

            {/* Stats: Entries, Streak, Tags */}
            <div className="w-full grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-4 rounded-2xl" style={{ background: 'var(--surface-muted)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{entries.length}</div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--ink-soft)' }}>entries</div>
              </div>
              <div className="text-center p-4 rounded-2xl" style={{ background: 'var(--surface-muted)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{streak || 0}</div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--ink-soft)' }}>streak</div>
              </div>
              <div className="text-center p-4 rounded-2xl" style={{ background: 'var(--surface-muted)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{uniqueTags}</div>
                <div className="text-[11px] font-medium" style={{ color: 'var(--ink-soft)' }}>tags</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-3 rounded-2xl text-[14px] font-bold text-red-500 hover:bg-red-50/50 transition border border-red-200 cursor-pointer mt-2"
            >
              sign out
            </button>
          </div>
        );

      /* 2. EDIT PROFILE */
      case 'edit-profile':
        return (
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-6 pt-2">
            {/* Profile Picture with Upload Button */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg overflow-hidden"
                  style={{ background: 'var(--accent)' }}
                >
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user?.name || 'profile'} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition disabled:opacity-60 cursor-pointer"
                  style={{ background: 'var(--accent)', color: 'white' }}
                  title="upload profile picture"
                >
                  {avatarUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                </button>
              </div>
            </div>

            {profileError && (
              <p className="text-[12px] text-red-500 text-center font-medium">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="text-[12px] text-emerald-500 font-bold text-center flex items-center justify-center gap-1">
                <Check size={14} /> profile updated successfully!
              </p>
            )}

            {/* Editable Name */}
            <div>
              <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-1.5">
                name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => {
                  setProfileName(e.target.value);
                  setProfileSuccess(false);
                  setProfileError('');
                }}
                onBlur={() => setProfileName(formatName(profileName))}
                className="w-full px-4 py-3 rounded-2xl text-[14px] font-medium outline-none border border-[var(--border-soft)] text-[var(--ink)] focus:border-[var(--accent)] transition capitalize"
                style={{ background: 'var(--surface-muted)' }}
                placeholder="enter your name"
              />
            </div>

            {/* Editable Email */}
            <div>
              <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-1.5">
                email
              </label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => {
                  setProfileEmail(e.target.value);
                  setProfileSuccess(false);
                  setProfileError('');
                }}
                className="w-full px-4 py-3 rounded-2xl text-[14px] font-medium outline-none border border-[var(--border-soft)] text-[var(--ink)] focus:border-[var(--accent)] transition"
                style={{ background: 'var(--surface-muted)' }}
                placeholder="enter your email"
              />
            </div>

            {/* Cancel and Save Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelProfile}
                disabled={profileLoading}
                className="flex-1 py-3 rounded-2xl text-[14px] font-bold border border-[var(--border-soft)] text-[var(--ink-soft)] hover:bg-[var(--surface-muted)] transition cursor-pointer disabled:opacity-50"
              >
                cancel
              </button>
              <button
                type="submit"
                disabled={profileLoading}
                className="flex-1 py-3 rounded-2xl text-[14px] font-bold text-white transition hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'var(--accent)' }}
              >
                {profileLoading ? <Loader2 size={16} className="animate-spin" /> : 'save changes'}
              </button>
            </div>
          </form>
        );

      /* 3. CHANGE PASSWORD */
case 'change-password': {
  // Real-time password requirement checks
  const pwHasLength = newPw.length >= 8;
  const pwHasUpper = /[A-Z]/.test(newPw);
  const pwHasNumber = /[0-9]/.test(newPw);
  const pwIsMatch = confirmPw.length > 0 && newPw === confirmPw;

  // Strength calculation (0 to 3 score)
  const strengthScore = [pwHasLength, pwHasUpper, pwHasNumber].filter(Boolean).length;
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

      {/* Current Password */}
      <div>
        <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-1.5">
          current password
        </label>
        <div className="relative">
          <input
            type={showCurrentPw ? 'text' : 'password'}
            value={currentPw}
            onChange={(e) => {
              setCurrentPw(e.target.value);
              setPwErrors((p) => ({ ...p, current_password: undefined, general: undefined }));
              setPwSuccess(false);
            }}
            placeholder="enter current password"
            className="w-full px-4 py-3 pr-11 rounded-2xl text-[14px] font-medium outline-none border text-[var(--ink)] placeholder:text-[var(--ink-faint)] transition"
            style={{
              background: 'var(--surface-muted)',
              borderColor: pwErrors.current_password ? '#ef4444' : 'var(--border-soft)',
            }}
          />
          <button
            type="button"
            onClick={() => setShowCurrentPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] hover:text-[var(--ink-soft)] transition cursor-pointer"
            tabIndex={-1}
            aria-label={showCurrentPw ? 'hide password' : 'show password'}
          >
            {showCurrentPw ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
          </button>
        </div>
        {pwErrors.current_password && (
          <p className="text-[11px] text-red-500 mt-1 px-1">{pwErrors.current_password}</p>
        )}
      </div>

      {/* New Password */}
      <div>
        <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-1.5">
          new password
        </label>
        <div className="relative">
          <input
            type={showNewPw ? 'text' : 'password'}
            value={newPw}
            onChange={(e) => {
              setNewPw(e.target.value);
              setPwErrors((p) => ({ ...p, password: undefined }));
              setPwSuccess(false);
            }}
            placeholder="enter new password"
            className="w-full px-4 py-3 pr-11 rounded-2xl text-[14px] font-medium outline-none border text-[var(--ink)] placeholder:text-[var(--ink-faint)] transition"
            style={{
              background: 'var(--surface-muted)',
              borderColor: pwErrors.password ? '#ef4444' : 'var(--border-soft)',
            }}
          />
          <button
            type="button"
            onClick={() => setShowNewPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] hover:text-[var(--ink-soft)] transition cursor-pointer"
            tabIndex={-1}
            aria-label={showNewPw ? 'hide password' : 'show password'}
          >
            {showNewPw ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
          </button>
        </div>

        {/* Real-time Password Strength Bar & Checklist */}
        {newPw.length > 0 && (
          <div className="mt-2.5 space-y-2 px-1">
            {/* Visual Strength Meter */}
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

            {/* Live Requirement Checklist */}
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

      {/* Confirm New Password */}
      <div>
        <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-1.5">
          confirm new password
        </label>
        <div className="relative">
          <input
            type={showConfirmPw ? 'text' : 'password'}
            value={confirmPw}
            onChange={(e) => {
              setConfirmPw(e.target.value);
              setPwErrors((p) => ({ ...p, confirm: undefined }));
              setPwSuccess(false);
            }}
            placeholder="re-enter new password"
            className="w-full px-4 py-3 pr-11 rounded-2xl text-[14px] font-medium outline-none border text-[var(--ink)] placeholder:text-[var(--ink-faint)] transition"
            style={{
              background: 'var(--surface-muted)',
              borderColor: pwErrors.confirm ? '#ef4444' : 'var(--border-soft)',
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] hover:text-[var(--ink-soft)] transition cursor-pointer"
            tabIndex={-1}
            aria-label={showConfirmPw ? 'hide password' : 'show password'}
          >
            {showConfirmPw ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
          </button>
        </div>

        {/* Live Match Indicator */}
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

      {/* Buttons */}
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

      /* 4. THEME & AMBIANCE */
      case 'theme-ambiance':
        return (
          <div className="flex flex-col gap-6 pt-2">
            {/* Color Mode with Sun, Coffee, Moon Icons */}
            <div>
              <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-3">
                color mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('light')}
                  className={`py-4 px-3 rounded-2xl text-[13px] font-bold transition flex flex-col items-center gap-2 border-2 cursor-pointer ${mode === 'light'
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border-soft)] bg-[var(--surface-muted)] hover:border-[var(--accent)]'
                    }`}
                  style={{ color: 'var(--ink)' }}
                >
                  <Sun size={20} className={mode === 'light' ? 'text-[var(--accent)]' : 'text-[var(--ink-soft)]'} />
                  <div className="text-center">
                    <span className="block text-[11px] font-medium opacity-60">light</span>
                    <span className="block text-[12px] font-bold">(milk tea)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('dim')}
                  className={`py-4 px-3 rounded-2xl text-[13px] font-bold transition flex flex-col items-center gap-2 border-2 cursor-pointer ${mode === 'dim'
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border-soft)] bg-[var(--surface-muted)] hover:border-[var(--accent)]'
                    }`}
                  style={{ color: 'var(--ink)' }}
                >
                  <Coffee size={20} className={mode === 'dim' ? 'text-[var(--accent)]' : 'text-[var(--ink-soft)]'} />
                  <div className="text-center">
                    <span className="block text-[11px] font-medium opacity-60">dim</span>
                    <span className="block text-[12px] font-bold">(warm cocoa)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('dark')}
                  className={`py-4 px-3 rounded-2xl text-[13px] font-bold transition flex flex-col items-center gap-2 border-2 cursor-pointer ${mode === 'dark'
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border-soft)] bg-[var(--surface-muted)] hover:border-[var(--accent)]'
                    }`}
                  style={{ color: 'var(--ink)' }}
                >
                  <Moon size={20} className={mode === 'dark' ? 'text-[var(--accent)]' : 'text-[var(--ink-soft)]'} />
                  <div className="text-center">
                    <span className="block text-[11px] font-medium opacity-60">dark</span>
                    <span className="block text-[12px] font-bold">(espresso)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Accent Tone */}
          <div>
            <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-3">
              accent tone
            </label>
            <div className="flex flex-wrap gap-3">
              {ACCENT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setAccent(p.id)}
                  className={`w-12 h-12 rounded-full border-2 transition-all cursor-pointer ${
                    accent === p.id
                      ? 'border-[var(--accent)] ring-2 ring-[var(--accent-soft)] scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ background: p.hex }}
                  title={p.label}
                />
              ))}

              {/* Custom Color Selector Circle */}
              <div className="relative flex items-center justify-center">
                <input
                  type="color"
                  value={customAccent || '#f472b6'}
                  onChange={(e) => {
                    setCustomAccent(e.target.value);
                    setAccent('custom');
                  }}
                  className={`w-12 h-12 rounded-full cursor-pointer border-2 p-0 appearance-none bg-transparent overflow-hidden transition-all [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full ${
                    accent === 'custom'
                      ? 'border-[var(--accent)] ring-2 ring-[var(--accent-soft)] scale-110'
                      : 'border-[var(--border-soft)] hover:scale-105'
                  }`}
                  style={{ backgroundColor: customAccent || '#f472b6' }}
                  title="custom color"
                />
                {/* Plus icon overlay to indicate customizable color selection */}
                <span className="absolute pointer-events-none text-white drop-shadow-sm font-bold text-base">
                  +
                </span>
              </div>
            </div>
          </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen px-4 sm:px-8 md:px-12 py-8 transition-colors duration-200 lowercase"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Header with Profile Dropdown */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
            >
              settings
            </h1>
            <p className="text-[13px] md:text-[14px] font-medium mt-1" style={{ color: 'var(--ink-soft)' }}>
              customize your digital sanctuary.
            </p>
          </div>

          <ProfileDropdown />
        </div>

        {/* Settings Layout: Sidebar + Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div
            className="w-full md:w-56 shrink-0 rounded-3xl p-3 shadow-sm h-fit"
            style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border-soft)',
            }}
          >
            {SETTINGS_PAGES.map((page) => {
              const Icon = page.icon;
              const isActive = activePage === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => setActivePage(page.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13px] font-bold transition cursor-pointer mb-1 ${isActive
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'hover:bg-[var(--surface-muted)]'
                    }`}
                  style={{ color: isActive ? 'var(--accent)' : 'var(--ink-soft)' }}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} />
                    {page.label}
                  </span>
                  {isActive && <ChevronRight size={14} />}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div
            className="flex-1 rounded-3xl p-6 md:p-8 shadow-sm min-h-[420px]"
            style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border-soft)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {renderPage()}
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={avatarInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleAvatarChange}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="sign out of unfiltered?"
        message="we will keep your cozy diary spot safe and warm until you return."
        confirmText="sign out"
        cancelText="stay here"
        confirmVariant="danger"
        icon="logout"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}