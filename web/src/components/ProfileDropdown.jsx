import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="w-12 h-12 rounded-full flex items-center justify-center text-[18px] font-bold shrink-0 shadow-md transition-transform hover:scale-105 cursor-pointer overflow-hidden border-2 border-[var(--surface)]"
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            boxShadow: '0 6px 20px -2px var(--accent-soft)',
          }}
          title={user?.name}
        >
          {user?.avatar_url || user?.photoURL ? (
            <img
              src={user?.avatar_url || user?.photoURL}
              alt={user?.name || 'profile'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{user?.name?.charAt(0)?.toLowerCase() || 'u'}</span>
          )}
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 mt-2 w-48 rounded-2xl p-2 z-50 shadow-xl animate-cute-pop lowercase"
            style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border-soft)',
              boxShadow: 'var(--modal-shadow)',
            }}
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate('/settings');
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2.5 transition-all hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] cursor-pointer"
              style={{ color: 'var(--ink)' }}
            >
              <Settings size={16} />
              <span>account</span>
            </button>

            <div className="my-1 border-t border-[var(--border-soft)]" />

            <button
              onClick={() => {
                setMenuOpen(false);
                setShowLogoutConfirm(true);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2.5 transition-all hover:bg-red-50 text-red-500 cursor-pointer"
            >
              <LogOut size={16} />
              <span>sign out</span>
            </button>
          </div>
        )}
      </div>

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
          handleLogout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}