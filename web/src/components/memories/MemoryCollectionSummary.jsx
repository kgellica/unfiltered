import { Bookmark, Plus } from 'lucide-react';

export default function MemoryCollectionSummary({ entriesCount, onOpenNew }) {
  const hasNoEntries = entriesCount === 0;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-[var(--border-soft)]">
      <Bookmark size={32} className="text-[var(--ink-soft)] mb-3 opacity-60" />
      <h3
        className="text-lg font-bold text-[var(--ink)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {hasNoEntries ? 'no memories yet' : 'your memory collection'}
      </h3>
      <p className="text-xs text-[var(--ink-soft)] max-w-sm mt-1">
        {hasNoEntries
          ? 'start capturing your precious moments and reflections'
          : `you have ${entriesCount} ${entriesCount === 1 ? 'memory' : 'memories'} stored in your collection`}
      </p>
      {hasNoEntries && (
        <button
          onClick={onOpenNew}
          className="mt-4 px-5 py-2.5 rounded-2xl text-[13px] font-bold text-white transition hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          style={{ background: 'var(--accent)' }}
        >
          <Plus size={16} />
          <span>write your first memory</span>
        </button>
      )}
    </div>
  );
}