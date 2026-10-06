import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CalendarCheck, ArrowLeft, Library, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJournal } from '../hooks/useJournal';
import EntryModal from '../components/EntryModal';
import EntryCard from '../components/EntryCard';
import AnimatedGreeting from '../components/AnimatedGreeting';
import ProfileDropdown from '../components/ProfileDropdown';
import NewEntryButton from '../components/NewEntryButton';
import { parseDiaryDate } from '../lib/color';
import { MONTH_DATA, MONTH_ICONS } from '../constants/calendar';
import StateMessage from '../components/StateMessage';
import { useTheme } from '../context/ThemeContext';

function CuteBookIcon({ monthNum, selected }) {
  const Icon = MONTH_ICONS[monthNum] || MONTH_ICONS[7];
  const { mode } = useTheme();

  const getIconColor = () => {
    if (selected) return '#ffffff';
    if (mode === 'light') return '#8B7355'; // Brown for light mode
    return 'rgba(255,255,255,0.7)'; // White for dim/dark
  };

  const getBgColor = () => {
    if (selected) return 'rgba(255,255,255,0.2)';
    if (mode === 'light') return 'rgba(139, 115, 85, 0.15)';
    return 'rgba(255,255,255,0.08)';
  };

  return (
    <div
      className="flex items-center justify-center rounded-full ring-1 ring-white/35 shadow-inner shrink-0"
      style={{
        width: selected ? '3rem' : '2.5rem',
        height: selected ? '3rem' : '2.5rem',
        background: getBgColor(),
        backdropFilter: 'blur(4px)',
      }}
    >
      <Icon size={selected ? 24 : 20} color={getIconColor()} />
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

  // Initial state: null (no month automatically selected on load)
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  // Generate a list of available years (e.g. current year - 3 to current year + 1)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 3 + i);

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

  const sortedMonthEntries = useMemo(() => {
    if (selectedMonth === null) return [];
    return [...currentMonthData.entries].sort(
      (a, b) => new Date(b.entry_date) - new Date(a.entry_date)
    );
  }, [currentMonthData, selectedMonth]);

  return (
    <div
      className="min-h-screen px-4 sm:px-8 md:px-12 py-8 transition-colors duration-200 lowercase"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <AnimatedGreeting userName={user?.name} />
          <ProfileDropdown />
        </div>

        {selectedMonth === null ? (
          /* 📚 Bookshelf Monthly Overview Container */
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
                          onClick={() => setSelectedMonth(m.num)}
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
        ) : (
          /* Master-Detail Split View when a Month is Clicked */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-cute-fade">
            {/* Left Column: Collapsed Vertical Shelf Bar */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-soft)]">
                <button
                  onClick={() => setSelectedMonth(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>close shelf</span>
                </button>
                <span className="text-xs font-bold text-[var(--ink-faint)]">
                  {selectedYear}
                </span>
              </div>

              {/* Vertical Stack of Month Spines */}
              <div className="flex flex-col gap-1 max-h-[600px] overflow-y-auto pr-1 scrollbar-none">
                {MONTH_DATA.map((m) => {
                  const isSelected = selectedMonth === m.num;
                  const count = monthlyStats[m.num]?.count || 0;

                  return (
                    <button
                      key={m.num}
                      onClick={() => setSelectedMonth(m.num)}
                      className="w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer group text-left"
                      style={{
                        background: isSelected ? 'var(--accent)' : 'transparent',
                        color: isSelected ? '#ffffff' : 'var(--ink)',
                        border: isSelected
                          ? '1.5px solid var(--accent)'
                          : 'none',
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

            {/* Right Column: Month Header Stats & Stacked Entries */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div
                className="rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
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

              {/* Entries Action Bar */}
              <div className="flex items-center justify-between">
                <h3
                  className="text-base font-bold text-[var(--ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  reflections in {currentMonthMeta.name}
                </h3>
                <NewEntryButton onClick={openNew} />
              </div>

              {/* Stacked Entries List */}
              {loading ? (
                <StateMessage type="loading" variant="journal" />
              ) : sortedMonthEntries.length === 0 ? (
                <StateMessage
                  variant="journal"
                  title={`no entries in ${currentMonthMeta.name} ${selectedYear}`}
                  description="take a moment to reflect and write something"
                  onAction={openNew}
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Show first 5 entries */}
                  {sortedMonthEntries.slice(0, 5).map((entry) => (
                    <EntryCard key={entry.id} entry={entry} onOpen={openEntry} />
                  ))}

                  {/* View All Button - only show if more than 5 entries */}
                  {sortedMonthEntries.length > 5 && (
                    <button
                      onClick={() => navigate(`/journal?month=${selectedMonth}&year=${selectedYear}`)}
                      className="w-full py-3 rounded-2xl text-[14px] font-bold transition hover:scale-[1.02] active:scale-95 cursor-pointer"
                      style={{
                        background: 'var(--surface-muted)',
                        color: 'var(--ink)',
                        border: '1px solid var(--border-soft)',
                      }}
                    >
                      view all {sortedMonthEntries.length} entries for {currentMonthMeta.name}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
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