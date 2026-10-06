import { Plus, X } from 'lucide-react';

export default function CustomList({ customAffirmations, onRemoveCustom }) {
  if (customAffirmations.length === 0) return null;

  return (
    <div
      className="rounded-3xl p-6"
      style={{
        background: 'var(--surface)',
        border: '1.5px solid var(--border-soft)',
      }}
    >
      <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--ink-soft)' }}>
        <Plus size={14} className="text-[var(--accent)]" />
        <span>custom</span>
      </h3>

      <div className="flex flex-col gap-3">
        {customAffirmations.map((aff, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 p-3 rounded-2xl"
            style={{ background: 'var(--bg-page)' }}
          >
            <p className="text-[13px] font-medium leading-relaxed" style={{ color: 'var(--ink)' }}>
              "{aff}"
            </p>
            <button
              onClick={() => onRemoveCustom(aff)}
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