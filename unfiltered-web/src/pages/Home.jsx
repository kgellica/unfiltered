import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  CalendarCheck,
  Plus,
  Sparkles,
  ChevronRight,
  Flame,
  Calendar,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import EntryModal from '../components/EntryModal';
import EntryCard from '../components/EntryCard';
import AnimatedGreeting from '../components/AnimatedGreeting';
import { normalizeDateKey, parseDiaryDate } from '../lib/color';

const MONTH_DATA = [
  { num: 0, name: 'january', short: 'JAN', color: '#40354a', days: 31 },
  { num: 1, name: 'february', short: 'FEB', color: '#543b43', days: 28 },
  { num: 2, name: 'march', short: 'MAR', color: '#3b4d40', days: 31 },
  { num: 3, name: 'april', short: 'APR', color: '#3d445c', days: 30 },
  { num: 4, name: 'may', short: 'MAY', color: '#4a463a', days: 31 },
  { num: 5, name: 'june', short: 'JUN', color: '#543846', days: 30 },
  { num: 6, name: 'july', short: 'JUL', color: '#364954', days: 31 },
  { num: 7, name: 'august', short: 'AUG', color: '#544338', days: 31 },
  { num: 8, name: 'september', short: 'SEP', color: '#4d3b32', days: 30 },
  { num: 9, name: 'october', short: 'OCT', color: '#543f32', days: 31 },
  { num: 10, name: 'november', short: 'NOV', color: '#3d3029', days: 30 },
  { num: 11, name: 'december', short: 'DEC', color: '#2d3b34', days: 31 },
];

const MONTH_ICONS = {
  0: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M26 8v36M14 15l24 22M14 37l24-22M18 6l8 18 8-18M18 46l8-18 8 18" />
        <circle cx="26" cy="26" r="4" fill={color} stroke="none" />
      </g>
    </svg>
  ),
  1: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M26 39c-9-6.5-14.5-12-14.5-18.5A7.5 7.5 0 0 1 19 13a8.5 8.5 0 0 1 7 3.5A8.5 8.5 0 0 1 33 13a7.5 7.5 0 0 1 7.5 7.5C40.5 27 35 32.5 26 39Z" fill={color} fillOpacity="0.2" />
        <path d="M13 18h6M33 18h6M26 12v6M26 40v6" />
      </g>
    </svg>
  ),
  2: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 33c5.5-9 9-14 15-14s9.5 5 15 14" />
        <path d="M15 31c3.5-4 6.5-6 11-6s7.5 2 11 6" />
        <path d="M26 12c4.8 0 8.5 3.8 8.5 8.5S30.8 29 26 29s-8.5-3.8-8.5-8.5S21.2 12 26 12Z" fill={color} fillOpacity="0.18" />
        <path d="M18 38c-1.5 0-3 1-3 3s1.5 3 3 3h16c1.5 0 3-1 3-3s-1.5-3-3-3H18Z" fill={color} fillOpacity="0.2" />
      </g>
    </svg>
  ),
  3: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M26 9c8 0 13 6 13 13 0 9-7.5 17-13 21-5.5-4-13-12-13-21 0-7 5-13 13-13Z" fill={color} fillOpacity="0.18" />
        <path d="M26 16v12M20 22h12" />
      </g>
    </svg>
  ),
  4: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="26" cy="26" r="9" fill={color} fillOpacity="0.18" />
        <path d="M26 6v7M26 39v7M6 26h7M39 26h7M12 12l5 5M35 35l5 5M35 12l-5 5M17 35l-5 5" />
      </g>
    </svg>
  ),
  5: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="26" cy="26" r="4" fill={color} fillOpacity="0.2" />
        <path d="M26 7v8M26 37v8M7 26h8M37 26h8M14 14l6 6M32 32l6 6M32 14l-6 6M20 32l-6 6" />
        <path d="M26 18c7 0 12 5 12 12s-5 12-12 12-12-5-12-12 5-12 12-12Z" fill={color} fillOpacity="0.12" />
      </g>
    </svg>
  ),
  6: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M26 14c-4 0-7 3-7 7 0 4 3 7 7 7 4 0 7-3 7-7 0-4-3-7-7-7Z" fill={color} fillOpacity="0.16" />
        <path d="M26 8v8M26 36v8M8 26h8M36 26h8M13 13l6 6M33 33l6 6M33 13l-6 6M19 33l-6 6" />
        <path d="M17 30c2.5 4.5 6.5 7 9 7 3.5 0 6.5-2.5 9-7" />
      </g>
    </svg>
  ),
  7: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="35" cy="16" r="7" fill={color} fillOpacity="0.15" />
        <path d="M18 28h16c4.5 0 8 3.5 8 8v5H10v-5c0-4.5 3.5-8 8-8Z" fill={color} fillOpacity="0.12" />
        <path d="M16 30c1.5 0 3.5 1.5 5 3.5 3-4 7-5.5 10-5.5" />
        <path d="M13 38c2.5-7 8.5-11 14-11 6.5 0 10.5 4 13.5 11" />
      </g>
    </svg>
  ),
  8: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 30c6.5 0 9.5-5 15-5s8.5 5 17 5" />
        <path d="M10 35c6.5 0 9.5-5 15-5s8.5 5 17 5" />
        <path d="M16 18c4-5 7.5-7 10-7 4.5 0 8.5 3 10 8" />
        <path d="M21 21c-2.5 3.5-4 7-4 10.5" />
      </g>
    </svg>
  ),
  9: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M26 10c7.5 0 13 5.5 13 13 0 7.5-5.5 13-13 13s-13-5.5-13-13c0-7.5 5.5-13 13-13Z" fill={color} fillOpacity="0.12" />
        <path d="M26 16v10M21 21h10M20 31h12M18 38h16" />
      </g>
    </svg>
  ),
  10: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 34h20l-2 8H18l-2-8Z" fill={color} fillOpacity="0.12" />
        <path d="M18 33c0-7 3.5-12 8-12s8 5 8 12" />
        <path d="M20 22c0-3 2.5-6 6-6s6 2.5 6 6" />
        <path d="M26 9v6" />
        <path d="M14 38h24" />
      </g>
    </svg>
  ),
  11: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 23h16v13H18z" fill={color} fillOpacity="0.12" />
        <path d="M15 23c0-6.5 5-11 11-11s11 4.5 11 11" />
        <path d="M13 37h26" />
        <path d="M18 18c0-2.5 2.5-4 8-4" />
        <path d="M24 29h4" />
      </g>
    </svg>
  ),
};

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

  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  const [activeEntry, setActiveEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, entriesRes] = await Promise.all([
        api.get('/entries/stats'),
        api.get('/entries'),
      ]);
      setStreak(statsRes.data.current_streak || 0);
      setEntries(entriesRes.data.entries || []);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const allTags = useMemo(() => {
    const s = new Set();
    entries.forEach((e) =>
      (e.tags || []).forEach((t) => s.add(typeof t === 'string' ? t : t.name))
    );
    return Array.from(s);
  }, [entries]);

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

  const openNew = () => {
    setActiveEntry(null);
    setShowModal(true);
  };

  const openEntry = (entry) => {
    setActiveEntry(entry);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSave = async (payload) => {
    try {
      if (payload.id) {
        await api.put(`/entries/${payload.id}`, payload);
      } else {
        await api.post('/entries', payload);
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Failed to save entry:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/entries/${id}`);
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
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
