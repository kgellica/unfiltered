import { X } from 'lucide-react';

export default function AddModal({
  newAffirmation,
  onChangeNewAffirmation,
  onClose,
  onAdd,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(35, 25, 20, 0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="max-w-md w-full rounded-3xl p-6 animate-cute-pop"
        style={{
          background: 'var(--surface)',
          border: '1.5px solid var(--border-soft)',
          boxShadow: 'var(--modal-shadow)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
          >
            add your own affirmation
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 transition"
            style={{ color: 'var(--ink-soft)' }}
            aria-label="close"
          >
            <X size={20} />
          </button>
        </div>

        <textarea
          value={newAffirmation}
          onChange={(e) => onChangeNewAffirmation(e.target.value)}
          placeholder="write your personal affirmation..."
          className="w-full px-4 py-3 rounded-2xl border text-[14px] font-medium outline-none resize-none min-h-[120px] transition focus:border-[var(--accent)]"
          style={{
            background: 'var(--surface-muted)',
            borderColor: 'var(--border-soft)',
            color: 'var(--ink)',
          }}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-[14px] font-bold transition hover:bg-black/5 cursor-pointer"
            style={{ color: 'var(--ink-soft)', background: 'var(--surface-muted)' }}
          >
            cancel
          </button>
          <button
            onClick={onAdd}
            disabled={!newAffirmation.trim()}
            className="flex-1 py-3 rounded-2xl text-[14px] font-bold text-white transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
            style={{ background: 'var(--accent)' }}
          >
            add
          </button>
        </div>
      </div>
    </div>
  );
}