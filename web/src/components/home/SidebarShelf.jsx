import { ArrowLeft } from "lucide-react";
import { MONTH_DATA } from "../../constants/calendar";
import CuteBookIcon from "./CuteBookIcon";

export default function SidebarShelf({
  selectedMonth,
  selectedYear,
  monthlyStats,
  onSelectMonth,
  onCloseShelf,
}) {
  return (
    <div className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-8 shrink-0">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-soft)]">
        <button
          onClick={onCloseShelf}
          className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:opacity-80 transition-opacity cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>close shelf</span>
        </button>
        <span className="text-xs font-bold text-[var(--ink-faint)]">
          {selectedYear}
        </span>
      </div>

      <div className="flex flex-col gap-1 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1 scrollbar-none">
        {MONTH_DATA.map((m) => {
          const isSelected = selectedMonth === m.num;
          const count = monthlyStats[m.num]?.count || 0;

          return (
            <button
              key={m.num}
              onClick={() => onSelectMonth(m.num)}
              className="w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer group text-left"
              style={{
                background: isSelected ? 'var(--accent)' : 'transparent',
                color: isSelected ? '#ffffff' : 'var(--ink)',
                border: isSelected ? '1.5px solid var(--accent)' : 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <CuteBookIcon monthNum={m.num} selected={isSelected} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium tracking-wide">
                    {m.name}
                  </span>
                  <span
                    className="text-[11px] font-medium opacity-60"
                    style={{
                      color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--ink-soft)',
                    }}
                  >
                    {count} {count === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm mr-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}