import { Heart, X } from 'lucide-react';

export default function FavoritesList({ favorites, onRemoveFavorite }) {
  if (favorites.length === 0) return null;

  return (
    <div
      className="rounded-3xl p-6"
      style={{
        background: 'var(--surface)',
        border: '1.5px solid var(--border-soft)',
      }}
    >
      <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--ink-soft)' }}>
        <Heart size={14} className="text-[var(--accent)] fill-current" />
        <span>favorites</span>
      </h3>

      <div className="flex flex-col gap-3">
        {favorites.map((fav, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 p-3 rounded-2xl"
            style={{ background: 'var(--bg-page)' }}
          >
            <p className="text-[13px] font-medium leading-relaxed" style={{ color: 'var(--ink)' }}>
              "{fav}"
            </p>
            <button
              onClick={() => onRemoveFavorite(fav)}
              className="p-1 rounded-full hover:bg-red-50 transition shrink-0 mt-0.5"
              style={{ color: 'var(--ink-soft)' }}
              title="remove"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}