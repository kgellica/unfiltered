import { Flame, Check } from 'lucide-react';
import { normalizeDateKey } from '../lib/color';

const DAY_LABELS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function getWeekDates(reference = new Date()) {
  const day = (reference.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(reference);
  monday.setDate(reference.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toLocalKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function StreakTrail({ streak = 0, entryDates = [] }) {
  const week = getWeekDates();
  const todayKey = toLocalKey(new Date());
  
  // Normalize all incoming entry dates into clean YYYY-MM-DD
  const filledSet = new Set(entryDates.map(normalizeDateKey).filter(Boolean));

  const getStreakMessage = (s) => {
    if (s === 0) return 'start your story today • one day at a time 🌱';
    if (s === 1) return 'first step taken! come back tomorrow 🌸';
    if (s < 5) return 'you are doing wonderful! streak is glowing 🔥';
    return 'unstoppable habit champion! keep it up ✨';
  };

  return (
    <div
      className="w-full rounded-3xl p-5 md:p-6 transition-all shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 lowercase"
      style={{
        background: 'var(--surface)',
        border: '1.5px solid var(--border-soft)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      {/* Left Streak Details (No container box, pure glowing flame icon) */}
      <div className="flex items-center gap-3.5 flex-1">
        <Flame
          size={34}
          style={{
            color: streak > 0 ? 'var(--accent)' : 'var(--ink-faint)',
          }}
          className={`shrink-0 transition-transform ${
            streak > 0 ? 'fill-current animate-cute-float' : 'opacity-60'
          }`}
        />

        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span
              className="text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
            >
              {streak}
            </span>
            <span
              className="text-base font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}
            >
              {streak === 1 ? 'day streak' : 'days streak'}
            </span>
          </div>
          <span
            className="text-[12.5px] font-medium mt-0.5"
            style={{ color: 'var(--ink-soft)' }}
          >
            {getStreakMessage(streak)}
          </span>
        </div>
      </div>

      {/* Right Weekly Trail Dots */}
      <div
        className="flex items-center justify-between md:justify-end gap-2.5 sm:gap-3.5 px-4 py-3 rounded-2xl"
        style={{
          background: 'var(--surface-muted)',
          border: '1px solid var(--border-soft)',
        }}
      >
        {week.map((d, i) => {
          const key = toLocalKey(d);
          const isFilled = filledSet.has(key);
          const isToday = key === todayKey;
          const dayNum = d.getDate();

          return (
            <div key={key} className="flex flex-col items-center gap-1.5 min-w-[28px]">
              <span
                className="text-[11px] font-bold tracking-tight"
                style={{
                  color: isToday ? 'var(--accent)' : 'var(--ink-soft)',
                }}
              >
                {DAY_LABELS[i]}
              </span>

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isFilled
                    ? 'shadow-sm text-white animate-cute-pop'
                    : 'text-[var(--ink-faint)]'
                }`}
                style={{
                  background: isFilled ? 'var(--accent)' : 'var(--surface)',
                  border: isFilled
                    ? 'none'
                    : `1.5px solid ${isToday ? 'var(--accent)' : 'var(--border-soft)'}`,
                  boxShadow: isToday ? '0 0 0 3px var(--accent-soft)' : 'none',
                }}
                title={`${DAY_LABELS[i]} ${dayNum} (${isFilled ? 'recorded' : 'no entry'})`}
              >
                {isFilled ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span className="text-[10.5px]">{dayNum}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
