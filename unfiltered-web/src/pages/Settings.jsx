import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Settings as SettingsIcon,
  Palette,
  Sun,
  Moon,
  Coffee,
  Sparkles,
  Crown,
  Check,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function Settings() {
  const { user, logout } = useAuth();
  const { mode, setMode, accent, setAccent, customAccent, setCustomAccent } = useTheme();

  const [isPremium, setIsPremium] = useState(
    () => localStorage.getItem('uf_is_premium') === '1'
  );
  const [saveToast, setSaveToast] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const togglePremium = () => {
    const next = !isPremium;
    setIsPremium(next);
    localStorage.setItem('uf_is_premium', next ? '1' : '0');
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const ACCENT_PRESETS = [
    { id: 'pink', label: 'sakura pink', hex: '#f472b6' },
    { id: 'purple', label: 'taro purple', hex: '#c084fc' },
    { id: 'green', label: 'matcha green', hex: '#4ade80' },
    { id: 'blue', label: 'baby blue', hex: '#60a5fa' },
    { id: 'brown', label: 'cinnamon latte', hex: '#d4a373' },
  ];

  return (
    <div
      className="min-h-screen px-4 sm:px-8 md:px-12 py-8 transition-colors duration-200 lowercase"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
          >
            <span>settings & preferences</span>
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <SettingsIcon size={16} />
            </span>
          </h1>
          <p className="text-[13px] md:text-[14px] font-medium mt-1" style={{ color: 'var(--ink-soft)' }}>
            customize your digital sanctuary, colors, and subscription tier. 🌸
          </p>
        </div>

        {/* Profile Card */}
        <div
          className="rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm"
          style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border-soft)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-sm"
              style={{ background: 'var(--accent)' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2
                className="text-lg font-bold flex items-center gap-2"
                style={{ color: 'var(--ink)' }}
              >
                <span>{user?.name}</span>
                {isPremium && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                    <Crown size={12} className="fill-current" /> premium
                  </span>
                )}
              </h2>
              <p className="text-[13px] font-medium" style={{ color: 'var(--ink-soft)' }}>
                {user?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-bold text-red-500 hover:bg-red-50 transition border border-red-200 cursor-pointer"
          >
            <LogOut size={15} />
            <span>sign out</span>
          </button>
        </div>

        {/* Theme & Appearance */}
        <div
          className="rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm"
          style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border-soft)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <h2
            className="text-lg font-bold flex items-center gap-2"
            style={{ color: 'var(--ink)' }}
          >
            <Palette size={18} style={{ color: 'var(--accent)' }} />
            <span>theme & ambiance</span>
          </h2>

          {/* Mode Selector */}
          <div>
            <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-2.5">
              color mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setMode('light')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  mode === 'light'
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] font-bold'
                    : 'border-[var(--border-soft)] bg-[var(--surface-muted)]'
                }`}
              >
                <Sun size={22} className="text-amber-500" />
                <span className="text-[13px]" style={{ color: 'var(--ink)' }}>
                  light (milk tea)
                </span>
              </button>

              <button
                onClick={() => setMode('dim')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  mode === 'dim'
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] font-bold'
                    : 'border-[var(--border-soft)] bg-[var(--surface-muted)]'
                }`}
              >
                <Coffee size={22} className="text-amber-700" />
                <span className="text-[13px]" style={{ color: 'var(--ink)' }}>
                  dim (warm cocoa)
                </span>
              </button>

              <button
                onClick={() => setMode('dark')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  mode === 'dark'
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] font-bold'
                    : 'border-[var(--border-soft)] bg-[var(--surface-muted)]'
                }`}
              >
                <Moon size={22} className="text-indigo-400" />
                <span className="text-[13px]" style={{ color: 'var(--ink)' }}>
                  dark (espresso)
                </span>
              </button>
            </div>
          </div>

          {/* Accent Color Preset Selector */}
          <div>
            <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-2.5">
              accent tone
            </label>
            <div className="flex flex-wrap gap-2.5">
              {ACCENT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setAccent(p.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 transition-all ${
                    accent === p.id
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] font-bold'
                      : 'border-[var(--border-soft)] bg-[var(--surface-muted)]'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shadow-xs"
                    style={{ background: p.hex }}
                  />
                  <span className="text-[13px]" style={{ color: 'var(--ink)' }}>
                    {p.label}
                  </span>
                  {accent === p.id && <Check size={14} className="text-[var(--accent)]" />}
                </button>
              ))}

              {/* Custom Color Wheel (Interactive Hex Customizer) */}
              <div className="flex items-center gap-2 pl-2">
                <button
                  onClick={() => {
                    if (isPremium) {
                      setAccent('custom');
                    } else {
                      alert('✨ custom color wheel is a premium feature! upgrade below to unlock.');
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 transition-all ${
                    accent === 'custom'
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] font-bold'
                      : 'border-[var(--border-soft)] bg-[var(--surface-muted)]'
                  }`}
                >
                  <input
                    type="color"
                    value={customAccent}
                    disabled={!isPremium}
                    onChange={(e) => {
                      setCustomAccent(e.target.value);
                      setAccent('custom');
                    }}
                    className="w-5 h-5 rounded-full cursor-pointer border-0 bg-transparent disabled:opacity-50"
                  />
                  <span className="text-[13px]" style={{ color: 'var(--ink)' }}>
                    color wheel 🎨
                  </span>
                  {!isPremium && <Crown size={12} className="text-amber-500 fill-current" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Freemium Subscription Upgrade Card */}
        <div
          className="rounded-3xl p-6 md:p-8 flex flex-col gap-5 shadow-sm border-2 border-amber-200/60 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.35) 0%, var(--surface) 100%)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-xl bg-amber-100 text-amber-700">
                  <Crown size={18} className="fill-current" />
                </span>
                <h2
                  className="text-lg font-bold text-amber-900"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  unfiltered plus+
                </h2>
              </div>
              <p className="text-[13px] text-amber-800 font-medium max-w-md">
                unlock unlimited pastel card backgrounds, custom hex color wheel, and cloud backup.
              </p>
            </div>

            <button
              onClick={togglePremium}
              className={`px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all shadow-sm ${
                isPremium
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-amber-500 text-white hover:bg-amber-600 hover:scale-105'
              }`}
            >
              {isPremium ? '✓ premium active' : 'upgrade for free (demo) 🌸'}
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 pt-2 text-[12.5px] font-semibold text-amber-900">
            <div className="flex items-center gap-1.5">
              <Check size={15} className="text-amber-600" />
              <span>custom hex color wheel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={15} className="text-amber-600" />
              <span>all 7 pastel card palettes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={15} className="text-amber-600" />
              <span>priority streak badges</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="sign out of unfiltered? 🌸"
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
