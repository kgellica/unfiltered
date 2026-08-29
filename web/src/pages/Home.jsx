import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  FileText,
  CalendarCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJournal } from '../hooks/useJournal';
import EntryModal from '../components/EntryModal';
import EntryCard from '../components/EntryCard';
import AnimatedGreeting from '../components/AnimatedGreeting';
import { parseDiaryDate } from '../lib/color';
import { MONTH_DATA, MONTH_ICONS } from '../constants/calendar';

function CuteBookIcon({ monthNum, selected }) {
  const Icon = MONTH_ICONS[monthNum] || MONTH_ICONS[7];
  const innerColor = selected ? '#ffffff' : 'rgba(255,255,255,0.9)';

  return (
    <div
      className="flex items-center justify-center rounded-full ring-1 ring-white/35 shadow-inner"
      style={{
        width: selected ? '2.5rem' : '2.1rem',
        height: selected ? '2.5rem' : '2.1rem',
        background: selected ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <Icon color={innerColor} />
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    entries,
    loading,
    allTags,
    activeEntry,
    showModal,
    openEntry,
    openNew,
    closeModal,
    handleSave,
    handleDelete,
  } = useJournal();

  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  // Group entries by month
  const monthlyStats = useMemo(() => {
    const map = {};
    MONTH_DATA.forEach((m) => {
      map[m.num] = { count: 0, activeDays: new Set(), entries: [] };
    });

    entries.forEach((e) => {
      const d = parseDiaryDate(e.entry_date);
      if (d && d.getFullYear() === selectedYear) {
        const monthNum = d.getMonth();
        if (map[monthNum]) {
          map[monthNum].count += 1;
          map[monthNum].activeDays.add(d.getDate());
          map[monthNum].entries.push(e);
        }
      }
    });

    return map;
  }, [entries, selectedYear]);

  const currentMonthMeta = MONTH_DATA[selectedMonth] || MONTH_DATA[7];
  const currentMonthData = monthlyStats[selectedMonth] || {
    count: 0,
    activeDays: new Set(),
    entries: [],
  };

  return (
    <div
      className="min-h-screen px-4 sm:px-8 md:px-12 py-8 transition-colors duration-200 lowercase"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <AnimatedGreeting userName={user?.name} />

          <button
            onClick={openNew}
            className="flex items-center justify-center gap-2 h-12 px-5 rounded-2xl text-[14px] font-bold shrink-0 shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              boxShadow: '0 6px 20px -2px var(--accent-soft)',
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>new entry</span>
          </button>
        </div>

        {/* 📚 Bookshelf Monthly Overview Container */}
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
            <div className="flex items-center gap-2">
              <BookOpen size={20} style={{ color: 'var(--accent)' }} />
              <h2
                className="text-xl font-bold tracking-tight text-[var(--ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                your {selectedYear} journal library
              </h2>
            </div>

            <span className="text-[12.5px] font-bold text-[var(--ink-soft)] bg-[var(--surface-muted)] px-3 py-1 rounded-full">
              {entries.length} total reflections 
            </span>
          </div>

          {/* Bookshelf Graphic Row */}
          <div className="pt-8 pb-4 flex flex-col items-center overflow-visible">
            {/* Books Row */}
            <div
              className="flex items-end justify-center gap-2 sm:gap-3.5 w-full max-w-4xl px-2 overflow-x-auto pb-1 scrollbar-none"
              style={{ overflowY: 'visible' }}
            >
              {MONTH_DATA.map((m) => {
                const isSelected = selectedMonth === m.num;
                const count = monthlyStats[m.num]?.count || 0;
                // Height based on entries count and selected state
                const baseHeight = isSelected ? 190 : Math.min(130 + count * 12, 170);

                return (
                  <button
                    key={m.num}
                    onClick={() => setSelectedMonth(m.num)}
                    className={`relative flex flex-col justify-between items-center py-3 px-1.5 rounded-t-xl transition-all duration-300 cursor-pointer shrink-0 group ${
                      isSelected
                        ? 'scale-90 shadow-xl z-10'
                        : 'opacity-85 hover:opacity-100 hover:-translate-y-1'
                    }`}
                    style={{
                      width: isSelected ? '62px' : '52px',
                      height: `${baseHeight}px`,
                      background: isSelected ? 'var(--accent)' : m.color,
                      border: isSelected
                        ? '2px solid rgba(255,255,255,0.6)'
                        : '1px solid rgba(255,255,255,0.1)',
                      boxShadow: isSelected
                        ? '0 12px 28px -4px var(--accent-soft)'
                        : '0 4px 10px rgba(0,0,0,0.15)',
                      overflow: 'visible',
                      transformOrigin: 'bottom center',
                    }}
                    title={`${m.name} 2026 (${count} entries)`}
                  >
                    {/* Bookmark Ribbon on Selected Book */}
                    {isSelected && (
                      <div
                        className="absolute -top-3 right-2 w-3.5 h-6 rounded-t-xs shadow-md animate-cute-pop"
                        style={{
                          background: '#ffffff',
                          clipPath:
                            'polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 4px), 0 100%)',
                        }}
                      />
                    )}

                    {/* Book Top Symbol Stamp */}
                    <div className="mt-1 mb-1 transition-transform duration-200 group-hover:scale-110">
                      <CuteBookIcon monthNum={m.num} selected={isSelected} />
                    </div>

                    {/* Vertical Month Title */}
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

                    {/* Book Spine Detail Ribs */}
                    <div className="w-full px-2 flex flex-col gap-1 opacity-60 mb-1">
                      <div className="h-0.5 w-full bg-white/40 rounded-full" />
                      <div className="h-0.5 w-3/4 mx-auto bg-white/40 rounded-full" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Solid Wooden Shelf Rail */}
            <div
              className="w-full max-w-4xl h-4 rounded-xl shadow-md -mt-1 z-0 relative"
              style={{
                background: 'linear-gradient(180deg, #bfaea2 0%, #87766b 100%)',
                boxShadow: '0 6px 14px rgba(78, 52, 46, 0.18)',
              }}
            />
          </div>

          {/* Selected Month Info Panel (Matching Reference UI) */}
          <div
            className="rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all animate-cute-fade"
            style={{
              background: 'var(--surface-muted)',
              border: '1.5px solid var(--border-soft)',
            }}
          >
            {/* Month & Year Title */}
            <div>
              <h3
                className="text-2xl font-bold tracking-tight text-[var(--ink)] flex items-center gap-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <span>
                  {currentMonthMeta.name} {selectedYear}
                </span>
                <div className="flex items-center justify-center rounded-full bg-white/60 p-1.5 shadow-sm">
                  <CuteBookIcon monthNum={selectedMonth} selected={true} />
                </div>
              </h3>
              <p className="text-[13px] font-medium text-[var(--ink-soft)] mt-0.5">
                {currentMonthData.count === 0
                  ? 'no entries written for this month yet. start a new page! 🌸'
                  : `you recorded ${currentMonthData.count} beautiful memories this month ✨`}
              </p>
            </div>

            {/* Stats Pills */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Entries count pill */}
              <div
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-xs"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--accent)]"
                  style={{ background: 'var(--accent-soft)' }}
                >
                  <FileText size={16} />
                </div>
                <div>
                  <span className="text-[10.5px] font-bold text-[var(--ink-faint)] uppercase block">
                    entries
                  </span>
                  <span
                    className="text-[15px] font-bold text-[var(--ink)]"
                    style={{ fontFamily: 'var(--font-mono-diary)' }}
                  >
                    {currentMonthData.count} this month
                  </span>
                </div>
              </div>

              {/* Consistency ratio pill */}
              <div
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-xs"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-500"
                  style={{ background: 'rgba(74, 222, 128, 0.18)' }}
                >
                  <CalendarCheck size={16} />
                </div>
                <div>
                  <span className="text-[10.5px] font-bold text-[var(--ink-faint)] uppercase block">
                    consistency
                  </span>
                  <span
                    className="text-[15px] font-bold text-[var(--ink)]"
                    style={{ fontFamily: 'var(--font-mono-diary)' }}
                  >
                    {currentMonthData.activeDays.size}/{currentMonthMeta.days} days
                  </span>
                </div>
              </div>

              {/* Quick action button */}
              <button
                onClick={openNew}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-[13px] font-bold text-white shadow-xs transition hover:scale-105 cursor-pointer"
                style={{ background: 'var(--accent)' }}
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>write entry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Month Entries Grid */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3
              className="text-lg font-bold text-[var(--ink)] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span>reflections in {currentMonthMeta.name}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                {currentMonthData.entries.length}
              </span>
            </h3>

            <button
              onClick={() => navigate('/journal')}
              className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>go to full journal stream</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {currentMonthData.entries.length === 0 ? (
            <div
              className="rounded-3xl py-12 px-6 text-center flex flex-col items-center gap-2"
              style={{
                background: 'var(--surface)',
                border: '2px dashed var(--border-soft)',
              }}
            >
              <p className="text-[15px] font-bold text-[var(--ink)]">
                no entries recorded in {currentMonthMeta.name} {selectedYear} 📖
              </p>
              <p className="text-[12.5px] font-medium text-[var(--ink-soft)]">
                tap the button below to add your thoughts for this chapter.
              </p>
              <button
                onClick={openNew}
                className="mt-2 px-5 py-2.5 rounded-2xl text-[13px] font-bold text-white transition hover:scale-105 cursor-pointer"
                style={{ background: 'var(--accent)' }}
              >
                + write entry for {currentMonthMeta.name} ✨
              </button>
            </div>
          ) : (
            <div
              className="grid gap-4 sm:gap-5"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
            >
              {currentMonthData.entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onOpen={openEntry} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <EntryModal
          entry={activeEntry}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
          allExistingTags={allTags}
        />
      )}
    </div>
  );
}