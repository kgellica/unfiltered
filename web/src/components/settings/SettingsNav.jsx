import { UserCheck, User, Lock, Palette, ChevronRight } from 'lucide-react';

const SETTINGS_PAGES = [
  { id: 'user-profile', label: 'user profile', icon: UserCheck },
  { id: 'edit-profile', label: 'edit profile', icon: User },
  { id: 'change-password', label: 'change password', icon: Lock },
  { id: 'theme-ambiance', label: 'theme & ambiance', icon: Palette },
];

export default function SettingsNav({ activePage, onChange }) {
  return (
    <div
      className="w-full md:w-56 shrink-0 rounded-3xl p-3 shadow-sm h-fit"
      style={{ background: 'var(--surface)', border: '1.5px solid var(--border-soft)' }}
    >
      {SETTINGS_PAGES.map((page) => {
        const Icon = page.icon;
        const isActive = activePage === page.id;
        return (
          <button
            key={page.id}
            onClick={() => onChange(page.id)}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13px] font-bold transition cursor-pointer mb-1 ${
              isActive ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'hover:bg-[var(--surface-muted)]'
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
  );
}