import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BookHeart,
  CalendarDays,
  Sparkles,
  BellRing,
  Settings,
  Bookmark,
  LogOut,
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';

const NAV_ITEMS = [
  { to: '/home', label: 'home', icon: Home },
  { to: '/journal', label: 'journal', icon: BookHeart },
  { to: '/memories', label: 'memories', icon: Bookmark },
  { to: '/calendar', label: 'calendar', icon: CalendarDays },
  { to: '/affirmations', label: 'affirmations', icon: Sparkles },
  { to: '/reminders', label: 'reminders', icon: BellRing },
  { to: '/settings', label: 'settings', icon: Settings },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('uf_sidebar_collapsed') === '1'
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('uf_sidebar_collapsed', next ? '1' : '0');
      return next;
    });
  };

  return (
    <aside
      className="h-screen sticky top-0 flex flex-col shrink-0 transition-all duration-300 ease-out z-20"
      style={{
        width: collapsed ? '80px' : '230px',
        background: 'var(--bg-sidebar)',
      }}
    >
      {/* Clickable Brand Header (Click Logo to Toggle Collapse) */}
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-3 px-3.5 h-22 shrink-0 w-full text-left transition-all hover:bg-white/5 cursor-pointer select-none group"
        title={collapsed ? 'click to expand sidebar' : 'click to collapse sidebar'}
        aria-label={collapsed ? 'expand sidebar' : 'collapse sidebar'}
      >
        <div className="w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm transition-transform group-hover:scale-105">
          <img
            src={logoImg}
            alt="unfiltered logo"
            className="w-full h-full object-contain"
          />
        </div>

        {!collapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span
              className="text-lg font-bold tracking-tight truncate group-hover:text-[var(--accent)] transition-colors"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--sidebar-ink)' }}
            >
              unfiltered
            </span>
            <span
              className="text-[11px] tracking-wide truncate -mt-1 font-medium opacity-80"
              style={{ color: 'var(--sidebar-ink-soft)' }}
            >
              digital diary
            </span>
          </div>
        )}
      </button>

      {/* Navigation Items with Seamless Notches */}
      <nav className="flex-1 pl-3 pr-0 pt-3 space-y-1.5 relative overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="block relative">
            {({ isActive }) => (
              <div
                className={`relative flex items-center gap-3.5 h-11 pl-3.5 transition-all duration-200 ${isActive
                    ? 'font-bold rounded-l-2xl rounded-r-none'
                    : 'font-medium hover:bg-white/5 opacity-85 hover:opacity-100 mr-3 rounded-2xl'
                  } ${collapsed ? 'justify-center pr-0' : 'pr-4'}`}
              >
                {/* Seamless Notch Tab when Active */}
                {isActive && (
                  <>
                    <span className="nav-pill" aria-hidden="true" />
                    <span className="nav-notch-top" aria-hidden="true" />
                    <span className="nav-notch-bottom" aria-hidden="true" />
                  </>
                )}

                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.4 : 2}
                  className="relative z-10 shrink-0 transition-transform duration-200"
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--sidebar-ink-soft)',
                  }}
                />
                {!collapsed && (
                  <span
                    className="relative z-10 text-[13.5px] truncate lowercase"
                    style={{
                      color: isActive ? 'var(--ink)' : 'var(--sidebar-ink)',
                    }}
                  >
                    {label}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className={`px-3 pb-2 shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          title={collapsed ? 'log out' : undefined}
          aria-label="log out"
          className={`flex items-center gap-3.5 h-11 rounded-2xl transition-all duration-200 opacity-85 hover:opacity-100 hover:bg-white/5 cursor-pointer w-full ${
            collapsed ? 'justify-center px-0' : 'pl-3.5 pr-4'
          }`}
        >
          <LogOut
            size={19}
            strokeWidth={2}
            className="shrink-0"
            style={{ color: 'var(--sidebar-ink-soft)' }}
          />
          {!collapsed && (
            <span
              className="text-[13.5px] font-medium truncate lowercase"
              style={{ color: 'var(--sidebar-ink)' }}
            >
              log out
            </span>
          )}
        </button>
      </div>

      {/* Bottom Padding for Clean Finish */}
      <div className="h-4 shrink-0" />

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="log out of unfiltered?"
        message={`see you soon${user?.name ? `, ${user.name.split(' ')[0]}` : ''}! you'll need to sign back in to access your entries.`}
        confirmText={loggingOut ? 'logging out...' : 'log out'}
        cancelText="cancel"
        confirmVariant="danger"
        icon="logout"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </aside>
  );
}
