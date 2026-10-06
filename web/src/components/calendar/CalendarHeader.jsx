import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export default function CalendarHeader({
  selectedYear,
  onYearChange,
  availableYears,
  monthName,
  onPrev,
  onNext,
  onToday,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left: Year Selection Dropdown */}
      <div className="relative flex items-center">
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="appearance-none bg-[var(--surface-muted)] text-[var(--ink)] text-xs font-bold px-3.5 py-2 pr-7 rounded-full border border-[var(--border-soft)] cursor-pointer focus:outline-none hover:opacity-85 transition-opacity"
        >
          {availableYears.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 pointer-events-none text-[var(--ink-soft)]"
        />
      </div>

      {/* Center: Month Name */}
      <h2
        className="text-xl font-bold tracking-tight text-[var(--ink)] text-center capitalize"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {monthName}
      </h2>

      {/* Right: Navigation Arrows & Today Button */}
      <div className="flex items-center gap-2 shrink-0">
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