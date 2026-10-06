import MoodFace from '../MoodFace';
import { MOOD_META } from '../../lib/color';

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function CalendarGrid({
  calendarCells,
  selectedDayKey,
  todayKey,
  onSelectDay,
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[var(--ink-soft)] pb-2 border-b border-[var(--border-soft)]">
        {WEEKDAYS.map((w) => (
          <span key={w} className="uppercase tracking-wider">
            {w}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarCells.map((cell) => {
          if (cell.type === 'empty') {
            return <div key={cell.key} className="h-20 sm:h-24 rounded-2xl opacity-0" />;
          }

          const isToday = cell.dateKey === todayKey;
          const isSelected = cell.dateKey === selectedDayKey;
          const hasEntries = cell.entries.length > 0;
          const firstMood = hasEntries ? cell.entries[0].mood : null;
          const moodMeta = firstMood ? MOOD_META[firstMood] : null;

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => onSelectDay(cell.dateKey)}
              className={`h-20 sm:h-24 p-2 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer group relative ${
                isSelected
                  ? 'border-[var(--accent)] ring-2 ring-[var(--accent-soft)] shadow-sm'
                  : isToday
                  ? 'border-[var(--accent)]'
                  : 'border-[var(--border-soft)] hover:border-black/20'
              }`}
              style={{
                background: hasEntries ? 'var(--surface-muted)' : 'var(--surface)',
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday
                      ? 'bg-[var(--accent)] text-white'
                      : isSelected
                      ? 'text-[var(--accent)] font-extrabold'
                      : 'text-[var(--ink)]'
                  }`}
                >
                  {cell.day}
                </span>

                {hasEntries && (
                  <div title={moodMeta?.label || 'mood'}>
                    <MoodFace
                      mood={firstMood || 'good'}
                      size={18}
                      color="var(--ink)"
                      active={true}
                      strokeWidth={1.8}
                    />
                  </div>
                )}
              </div>

              {hasEntries ? (
                <span className="text-[10px] font-bold text-[var(--accent)] truncate block">
                  {cell.entries.length} {cell.entries.length === 1 ? 'entry' : 'entries'}
                </span>
              ) : (
                <span className="text-[10px] text-transparent group-hover:text-[var(--ink-faint)] transition-colors">
                  + add
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}