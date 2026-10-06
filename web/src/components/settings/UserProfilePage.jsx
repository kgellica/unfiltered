import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useJournal } from '../../hooks/useJournal';
import Avatar from '../Avatar';
import { formatName } from '../../lib/text';

export default function UserProfilePage({ onRequestLogout }) {
  const { user } = useAuth();
  const { entries, streak } = useJournal();

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

  const memberSince = useMemo(() => {
    if (!user?.created_at) return 'member recently';
    const date = new Date(user.created_at);
    return `member since ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  }, [user]);

  return (
    <div className="flex flex-col items-center gap-6 pt-4">
      <Avatar user={user} size={112} />

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

      <div className="w-full grid grid-cols-3 gap-4 pt-2">
        {[
          { value: entries.length, label: 'entries' },
          { value: streak || 0, label: 'streak' },
          { value: uniqueTags, label: 'tags' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-4 rounded-2xl" style={{ background: 'var(--surface-muted)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{stat.value}</div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--ink-soft)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onRequestLogout}
        className="w-full py-3 rounded-2xl text-[14px] font-bold text-red-500 hover:bg-red-50/50 transition border border-red-200 cursor-pointer mt-2"
      >
        sign out
      </button>
    </div>
  );
}