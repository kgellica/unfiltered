import { useState, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useJournal } from '../hooks/useJournal';
import ProfileDropdown from '../components/ProfileDropdown';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api/axios';
import { uploadFile } from '../api/uploads';
import { User, Settings as SettingsIcon, Palette, Camera, Lock, ChevronRight, Loader2, Eye, EyeOff, Check } from 'lucide-react';


const SETTINGS_PAGES = [
  { id: 'profile', label: 'profile', icon: User },
  { id: 'account', label: 'account', icon: SettingsIcon },
  { id: 'preferences', label: 'preferences', icon: Palette },
];

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const { mode, setMode, accent, setAccent, customAccent, setCustomAccent } = useTheme();
  const { entries, streak } = useJournal();
  const [activePage, setActivePage] = useState('profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

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

  const ACCENT_PRESETS = [
    { id: 'pink', label: 'sakura pink', hex: '#f472b6' },
    { id: 'purple', label: 'taro purple', hex: '#c084fc' },
    { id: 'green', label: 'matcha green', hex: '#4ade80' },
    { id: 'blue', label: 'baby blue', hex: '#60a5fa' },
    { id: 'brown', label: 'cinnamon latte', hex: '#d4a373' },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'profile':
        return (
          <div className="flex flex-col items-center gap-6 pt-4">
            {/* Profile Picture */}
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
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition disabled:opacity-60"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                {avatarUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
            </div>

            {/* Name & Email */}
            <div className="text-center">
              <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
                {user?.name || 'User'}
              </h2>
              <p className="text-[14px] font-medium" style={{ color: 'var(--ink-soft)' }}>
                {user?.email || 'user@email.com'}
              </p>
            </div>

            {/* Stats */}
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
              className="w-full py-3 rounded-2xl text-[14px] font-bold text-red-500 hover:bg-red-50 transition border border-red-200 cursor-pointer mt-2"
            >
              sign out
            </button>
          </div>
        );

      case 'account':
        return (
          <div className="flex flex-col gap-6 pt-4">
            {/* Profile Picture with Edit */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg overflow-hidden"
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
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition disabled:opacity-60"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  {avatarUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-1.5">
                name
              </label>
              <input
                type="text"
                value={user?.name || ''}
                className="w-full px-4 py-3 rounded-xl text-[14px] font-medium outline-none border border-[var(--border-soft)] text-[var(--ink)]"
                style={{ background: 'var(--surface-muted)' }}
                readOnly
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-1.5">
                email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-3 rounded-xl text-[14px] font-medium outline-none border border-[var(--border-soft)] text-[var(--ink)]"
                style={{ background: 'var(--surface-muted)' }}
                readOnly
              />
            </div>

            {/* Change Password */}
            <form onSubmit={handleChangePassword} className="pt-2 border-t border-[var(--border-soft)]">
              <h3 className="text-[14px] font-bold mb-3" style={{ color: 'var(--ink)' }}>
                change password
              </h3>

              {pwErrors.general && (
                <p className="text-[12px] text-red-500 mb-3 px-1">{pwErrors.general}</p>
              )}
              {pwSuccess && (
                <div className="flex items-center gap-2 text-[12px] font-bold text-emerald-500 mb-3 px-1">
                  <Check size={14} strokeWidth={2.5} /> password updated successfully!
                </div>
              )}

              <div className="space-y-3">
                {/* Current Password */}
                <div>
                  <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-1.5">
                    current password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPw}
                      onChange={(e) => { setCurrentPw(e.target.value); setPwErrors((p) => ({ ...p, current_password: undefined, general: undefined })); setPwSuccess(false); }}
                      placeholder="enter current password"
                      className="w-full px-4 py-3 pr-11 rounded-xl text-[14px] font-medium outline-none border text-[var(--ink)] placeholder:text-[var(--ink-faint)] transition"
                      style={{
                        background: 'var(--surface-muted)',
                        borderColor: pwErrors.current_password ? '#ef4444' : 'var(--border-soft)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] hover:text-[var(--ink-soft)] transition"
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
                      onChange={(e) => { setNewPw(e.target.value); setPwErrors((p) => ({ ...p, password: undefined })); setPwSuccess(false); }}
                      placeholder="min 8 chars, 1 uppercase, 1 number"
                      className="w-full px-4 py-3 pr-11 rounded-xl text-[14px] font-medium outline-none border text-[var(--ink)] placeholder:text-[var(--ink-faint)] transition"
                      style={{
                        background: 'var(--surface-muted)',
                        borderColor: pwErrors.password ? '#ef4444' : 'var(--border-soft)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] hover:text-[var(--ink-soft)] transition"
                      tabIndex={-1}
                      aria-label={showNewPw ? 'hide password' : 'show password'}
                    >
                      {showNewPw ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                    </button>
                  </div>
                  {/* Format hints */}
                  {newPw.length > 0 && (() => {
                    const fErrs = validatePassword(newPw);
                    return fErrs.length > 0 ? (
                      <p className="text-[11px] text-amber-500 mt-1 px-1">needs: {fErrs.join(' · ')}</p>
                    ) : (
                      <p className="text-[11px] text-emerald-500 mt-1 px-1 flex items-center gap-1"><Check size={11} strokeWidth={3} /> looks good</p>
                    );
                  })()}
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
                      onChange={(e) => { setConfirmPw(e.target.value); setPwErrors((p) => ({ ...p, confirm: undefined })); setPwSuccess(false); }}
                      placeholder="re-enter new password"
                      className="w-full px-4 py-3 pr-11 rounded-xl text-[14px] font-medium outline-none border text-[var(--ink)] placeholder:text-[var(--ink-faint)] transition"
                      style={{
                        background: 'var(--surface-muted)',
                        borderColor: pwErrors.confirm ? '#ef4444' : 'var(--border-soft)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] hover:text-[var(--ink-soft)] transition"
                      tabIndex={-1}
                      aria-label={showConfirmPw ? 'hide password' : 'show password'}
                    >
                      {showConfirmPw ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                    </button>
                  </div>
                  {confirmPw.length > 0 && newPw !== confirmPw && !pwErrors.confirm && (
                    <p className="text-[11px] text-amber-500 mt-1 px-1">passwords don't match yet</p>
                  )}
                  {pwErrors.confirm && (
                    <p className="text-[11px] text-red-500 mt-1 px-1">{pwErrors.confirm}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full py-3 rounded-2xl text-[14px] font-bold text-white transition hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: 'var(--accent)' }}
                >
                  {pwLoading ? <><Loader2 size={15} className="animate-spin" /> updating...</> : 'update password'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'preferences':
        return (
          <div className="flex flex-col gap-6 pt-4">
            {/* Color Mode */}
            <div>
              <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-2">
                color mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setMode('light')}
                  className={`py-4 px-4 rounded-2xl text-[13px] font-bold transition border-2 ${
                    mode === 'light'
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border-soft)] bg-[var(--surface-muted)]'
                  }`}
                  style={{ color: 'var(--ink)' }}
                >
                  <span className="block text-[11px] font-medium opacity-60">light</span>
                  <span className="block text-[13px]">(milk tea)</span>
                </button>
                <button
                  onClick={() => setMode('dim')}
                  className={`py-4 px-4 rounded-2xl text-[13px] font-bold transition border-2 ${
                    mode === 'dim'
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border-soft)] bg-[var(--surface-muted)]'
                  }`}
                  style={{ color: 'var(--ink)' }}
                >
                  <span className="block text-[11px] font-medium opacity-60">dim</span>
                  <span className="block text-[13px]">(warm cocoa)</span>
                </button>
                <button
                  onClick={() => setMode('dark')}
                  className={`py-4 px-4 rounded-2xl text-[13px] font-bold transition border-2 ${
                    mode === 'dark'
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border-soft)] bg-[var(--surface-muted)]'
                  }`}
                  style={{ color: 'var(--ink)' }}
                >
                  <span className="block text-[11px] font-medium opacity-60">dark</span>
                  <span className="block text-[13px]">(espresso)</span>
                </button>
              </div>
            </div>

            {/* Accent Tone */}
            <div>
              <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-2">
                accent tone
              </label>
              <div className="flex flex-wrap gap-3">
                {ACCENT_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setAccent(p.id)}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      accent === p.id
                        ? 'border-[var(--accent)] ring-2 ring-[var(--accent-soft)] scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ background: p.hex }}
                    title={p.label}
                  />
                ))}
                <div className="relative">
                  <input
                    type="color"
                    value={customAccent}
                    onChange={(e) => {
                      setCustomAccent(e.target.value);
                      setAccent('custom');
                    }}
                    className={`w-12 h-12 rounded-full cursor-pointer border-2 p-1 ${
                      accent === 'custom'
                        ? 'border-[var(--accent)] ring-2 ring-[var(--accent-soft)] scale-110'
                        : 'border-transparent'
                    }`}
                    title="custom color"
                  />
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
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div
            className="w-48 shrink-0 rounded-3xl p-3 shadow-sm h-fit"
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-bold transition ${
                    isActive
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
            className="flex-1 rounded-3xl p-6 md:p-8 shadow-sm min-h-[400px]"
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