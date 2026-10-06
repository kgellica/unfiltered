import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileDropdown from '../components/ProfileDropdown';
import ConfirmModal from '../components/ConfirmModal';
import SettingsNav from '../components/settings/SettingsNav';
import UserProfilePage from '../components/settings/UserProfilePage';
import EditProfilePage from '../components/settings/EditProfilePage';
import ChangePasswordPage from '../components/settings/ChangePasswordPage';
import ThemeAmbiancePage from '../components/settings/ThemeAmbiancePage';

const PAGE_COMPONENTS = {
  'user-profile': UserProfilePage,
  'edit-profile': EditProfilePage,
  'change-password': ChangePasswordPage,
  'theme-ambiance': ThemeAmbiancePage,
};

export default function Settings() {
  const { logout } = useAuth();
  const [activePage, setActivePage] = useState('user-profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const ActivePage = PAGE_COMPONENTS[activePage];

  return (
    <div
      className="min-h-screen px-4 sm:px-8 md:px-12 py-8 transition-colors duration-200 lowercase"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
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

        <div className="flex flex-col md:flex-row gap-6">
          <SettingsNav activePage={activePage} onChange={setActivePage} />

          <div
            className="flex-1 rounded-3xl p-6 md:p-8 shadow-sm min-h-[420px]"
            style={{ background: 'var(--surface)', border: '1.5px solid var(--border-soft)', boxShadow: 'var(--card-shadow)' }}
          >
            <ActivePage onRequestLogout={() => setShowLogoutConfirm(true)} />
          </div>
        </div>
      </div>

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