import { useNavigate } from 'react-router-dom';
import EntryCard from '../EntryCard';
import NewEntryButton from '../NewEntryButton';
import StateMessage from '../StateMessage';

export default function MonthEntriesView({
  currentMonthMeta,
  currentMonthData,
  selectedYear,
  loading,
  sortedEntries,
  onOpenEntry,
  onOpenNew,
}) {
  const navigate = useNavigate();

  // Limit display to top 5 entries
  const visibleEntries = sortedEntries.slice(0, 5);
  const hasMoreEntries = sortedEntries.length > 5;

  return (
    <div className="lg:col-span-8 flex flex-col gap-6 lg:h-full lg:overflow-y-auto lg:pr-2">
      {/* Header Banner */}
      <div
        className="rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm shrink-0"
        style={{
          background: 'var(--surface)',
          border: '1.5px solid var(--border-soft)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div>
          <h2
            className="text-xl font-bold tracking-tight text-[var(--ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {currentMonthMeta.name} {selectedYear}
          </h2>
          <p className="text-[13px] font-medium text-[var(--ink-soft)] mt-0.5">
            {currentMonthData.count === 0
              ? 'no entries written for this month yet'
              : `you recorded ${currentMonthData.count} reflections this month`}
          </p>
        </div>

        <div className="flex items-center gap-6 flex-wrap sm:ml-auto">
          <div className="text-right sm:text-left">
            <span className="text-[10px] font-bold text-[var(--ink-faint)] uppercase block">
              entries
            </span>
            <span
              className="text-lg font-bold text-[var(--ink)]"
              style={{ fontFamily: 'var(--font-mono-diary)' }}
            >
              {currentMonthData.count}
            </span>
          </div>

          <div className="text-right sm:text-left">
            <span className="text-[10px] font-bold text-[var(--ink-faint)] uppercase block">
              days
            </span>
            <span
              className="text-lg font-bold text-[var(--ink)]"
              style={{ fontFamily: 'var(--font-mono-diary)' }}
            >
              {currentMonthData.activeDays.size}/{currentMonthMeta.days}
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between shrink-0">
        <h3
          className="text-base font-bold text-[var(--ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          reflections in {currentMonthMeta.name}
        </h3>
        <NewEntryButton onClick={onOpenNew} />
      </div>

      {/* List / Empty / Loading State */}
      {loading ? (
        <StateMessage type="loading" variant="journal" />
      ) : sortedEntries.length === 0 ? (
        <StateMessage
          variant="journal"
          title={`no entries in ${currentMonthMeta.name} ${selectedYear}`}
          description="take a moment to reflect and write something"
          onAction={onOpenNew}
        />
      ) : (
        <div className="flex flex-col gap-4 pb-8">
          {visibleEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onOpen={onOpenEntry} />
          ))}

          {hasMoreEntries && (
            <button
              onClick={() => navigate('/journal')}
              className="w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer border hover:opacity-85 text-center mt-2"
              style={{
                background: 'var(--surface-muted)',
                borderColor: 'var(--border-soft)',
                color: 'var(--ink)',
              }}
            >
              see all {sortedEntries.length} entries in journal →
            </button>
          )}
        </div>
      )}
    </div>
  );
}