import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BookHeart,
  CalendarDays,
  Sparkles,
  Settings,
  Bookmark,
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const NAV_ITEMS = [
  { to: '/home', label: 'home', icon: Home },
  { to: '/journal', label: 'journal', icon: BookHeart },
  { to: '/memories', label: 'memories', icon: Bookmark },
  { to: '/calendar', label: 'calendar', icon: CalendarDays },
  { to: '/affirmations', label: 'affirmations', icon: Sparkles },
  { to: '/settings', label: 'settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('uf_sidebar_collapsed') === '1'
  );

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
      {/* Clickable Brand Header */}
      <button
        type="button"
        onClick={toggle}
        className={`flex items-center h-20 shrink-0 w-full text-left transition-all hover:bg-white/5 cursor-pointer select-none group ${
          collapsed ? 'justify-center px-2' : 'gap-3 px-4'
        }`}
        title={collapsed ? 'click to expand sidebar' : 'click to collapse sidebar'}
        aria-label={collapsed ? 'expand sidebar' : 'collapse sidebar'}
      >
        <img
          src={logoImg}
          alt="unfiltered logo"
          className={`shrink-0 object-contain transition-transform group-hover:scale-105 ${
            collapsed ? 'w-14 h-14' : 'w-16 h-16'
          }`}
        />

        {!collapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span
              className="text-xl font-bold tracking-tight truncate group-hover:text-[var(--accent)] transition-colors"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--sidebar-ink)' }}
            >
              unfiltered
            </span>
            <span
              className="text-[11px] tracking-wide truncate -mt-0.5 font-medium opacity-80"
              style={{ color: 'var(--sidebar-ink-soft)' }}
            >
              digital diary
            </span>
          </div>
        )}
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 pl-3 pt-4 space-y-2 relative overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="block relative w-full">
            {({ isActive }) => (
              <div
                className={`relative flex items-center h-12 transition-all duration-200 ${
                  isActive
                    ? 'nav-item-active font-bold'
                    : 'font-medium rounded-l-2xl hover:bg-white/5 opacity-85 hover:opacity-100'
                } ${collapsed ? 'justify-center px-0' : 'gap-3.5 pl-4 pr-4'}`}
              >
                {/* Seamless Notch Tab Curves when Active */}
                {isActive && (
                  <>
                    <span className="nav-notch-top" aria-hidden="true" />
                    <span className="nav-notch-bottom" aria-hidden="true" />
                  </>
                )}

                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.4 : 2}
                  className="relative z-10 shrink-0 transition-transform duration-200"
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--sidebar-ink-soft)',
                  }}
                />
                {!collapsed && (
                  <span
                    className="relative z-10 text-[14px] truncate lowercase"
                    style={{
                      color: isActive ? 'var(--accent)' : 'var(--sidebar-ink)',
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

      {/* Bottom Padding */}
      <div className="h-4 shrink-0" />
    </aside>
  );
}