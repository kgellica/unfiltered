import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarHeader({ monthName, onPrev, onNext, onToday }) {
  return (
    <div className="flex items-center justify-between">
      <h2
        className="text-xl font-bold tracking-tight text-[var(--ink)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {monthName}
      </h2>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="p-2 rounded-2xl bg-[var(--surface-muted)] hover:bg-black/5 transition text-[var(--ink)] cursor-pointer"
          title="previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onToday}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--accent-soft)] text-[var(--accent)] hover:opacity-85 transition cursor-pointer"
        >
          today
        </button>
        <button
          onClick={onNext}
          className="p-2 rounded-2xl bg-[var(--surface-muted)] hover:bg-black/5 transition text-[var(--ink)] cursor-pointer"
          title="next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}