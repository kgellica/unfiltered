import { Library, ChevronDown } from "lucide-react";
import { MONTH_DATA } from "../../constants/calendar";
import CuteBookIcon from "./CuteBookIcon";

export default function BookshelfView({
  selectedYear,
  setSelectedYear,
  availableYears,
  monthlyStats,
  onSelectMonth,
}) {
  return (
    <div
      className="w-full rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm relative"
      style={{
        background: 'var(--surface)',
        border: '1.5px solid var(--border-soft)',
        boxShadow: 'var(--card-shadow)',
        overflow: 'visible',
      }}
    >
      {/* Bookshelf Title Bar */}
      <div className="flex items-center justify-between">
        <h2
          className="text-xl font-bold tracking-tight text-[var(--ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {selectedYear} library
        </h2>

        {/* Year Selector Dropdown */}
        <div className="relative flex items-center">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="appearance-none bg-[var(--surface-muted)] text-[var(--ink)] text-[12.5px] font-bold px-3.5 py-1.5 pr-7 rounded-full border border-[var(--border-soft)] cursor-pointer focus:outline-none hover:opacity-85 transition-opacity"
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
      </div>

      {/* Bookshelf Graphic Row */}
      <div className="pt-8 pb-4 flex flex-col items-center overflow-visible">
        <div
          className="flex items-end justify-center gap-2 sm:gap-3.5 w-full max-w-4xl px-2 overflow-x-auto pb-1 scrollbar-none"
          style={{ overflowY: 'visible' }}
        >
          <div className="flex items-end gap-2" style={{ height: '174px' }}>
            {MONTH_DATA.map((m) => {
              const count = monthlyStats[m.num]?.count || 0;
              return (
                <div
                  key={m.num}
                  className="relative shrink-0"
                  style={{ width: '54px', height: '174px' }}
                >
                  <button
                    onClick={() => onSelectMonth(m.num)}
                    className="absolute bottom-0 left-0 flex flex-col justify-between items-center py-3 px-1.5 rounded-t-xl transition-all duration-300 ease-out cursor-pointer group hover:-translate-y-2"
                    style={{
                      width: '54px',
                      height: '150px',
                      background: m.color,
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    }}
                    title={`${m.name} ${selectedYear} (${count} entries)`}
                  >
                    <div className="mt-1 mb-1 transition-transform duration-200 group-hover:scale-110">
                      <CuteBookIcon monthNum={m.num} selected={false} />
                    </div>

                    <div className="flex-1 flex items-center justify-center my-2">
                      <span
                        className="text-[13px] font-extrabold uppercase tracking-widest text-white/95"
                        style={{
                          fontFamily: 'var(--font-mono-diary)',
                          writingMode: 'vertical-rl',
                          textOrientation: 'mixed',
                          letterSpacing: '0.2em',
                        }}
                      >
                        {m.short}
                      </span>
                    </div>

                    <div className="w-full px-2 flex flex-col gap-1 opacity-60 mb-1">
                      <div className="h-0.5 w-full bg-white/40 rounded-full" />
                      <div className="h-0.5 w-3/4 mx-auto bg-white/40 rounded-full" />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wooden Shelf Rail */}
        <div
          className="w-full max-w-4xl h-4 rounded-xl shadow-md -mt-1 z-0 relative"
          style={{
            background: 'linear-gradient(180deg, #bfaea2 0%, #87766b 100%)',
            boxShadow: '0 6px 14px rgba(78, 52, 46, 0.18)',
          }}
        />
      </div>

      {/* Overview Info Callout */}
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Library size={32} className="text-[var(--ink-soft)] mb-3 opacity-60" />
        <h3
          className="text-lg font-bold text-[var(--ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          select a journal from the shelf
        </h3>
        <p className="text-xs text-[var(--ink-soft)] max-w-sm mt-1">
          pick any month above to read past reflections, review monthly statistics, or add new entries.
        </p>
      </div>
    </div>
  );
}
