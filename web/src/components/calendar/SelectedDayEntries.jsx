import EntryCard from '../EntryCard';
import StateMessage from '../StateMessage';

export default function SelectedDayEntries({
  loading,
  selectedDayEntries,
  selectedDayKey,
  onOpenEntry,
  onOpenNewForDate,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3
          className="text-lg font-bold text-[var(--ink)] flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span>reflections for today</span>
        </h3>
      </div>

      {loading ? (
        <StateMessage type="loading" variant="calendar" />
      ) : selectedDayEntries.length === 0 ? (
        <StateMessage
          variant="calendar"
          title="no entries"
          description="take a moment to reflect and write something"
          actionLabel="+ write entry"
          onAction={() => onOpenNewForDate(selectedDayKey)}
        />
      ) : (
        <div
          className="grid gap-4 sm:gap-5"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
        >
          {selectedDayEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onOpen={onOpenEntry} />
          ))}
        </div>
      )}
    </div>
  );
}