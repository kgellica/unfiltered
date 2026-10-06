import NewEntryButton from '../NewEntryButton';

export default function JournalHeader({
  displayMonth,
  filterMonth,
  onClearMonthFilter,
  onOpenNew,
}) {
  return (
    <div className="flex items-center justify-between">
      <h2
        className="text-lg font-bold lowercase flex items-center gap-2"
        style={{ color: 'var(--ink)' }}
      >
        <span>journal entries</span>
        {displayMonth && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            {displayMonth}
          </span>
        )}
        {filterMonth !== null && (
          <button
            onClick={onClearMonthFilter}
            className="text-xs font-bold hover:underline cursor-pointer"
            style={{ color: 'var(--ink-soft)' }}
          >
            ✕ clear
          </button>
        )}
      </h2>
      <NewEntryButton onClick={onOpenNew} />
    </div>
  );
}