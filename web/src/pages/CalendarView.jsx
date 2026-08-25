import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
} from 'lucide-react';
import { useJournal } from '../hooks/useJournal';
import EntryModal from '../components/EntryModal';
import EntryCard from '../components/EntryCard';
import { normalizeDateKey, MOOD_META, parseDiaryDate, formatDiaryDate } from '../lib/color';

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function CalendarView() {
  const {
    entries,
    loading,
    allTags,
    activeEntry,
    showModal,
    setActiveEntry,
    setShowModal,
    fetchData,
    openEntry,
    closeModal,
    handleSave,
    handleDelete,
  } = useJournal();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayKey, setSelectedDayKey] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [newEntryDate, setNewEntryDate] = useState('');

  // Group entries by normalized date key YYYY-MM-DD
  const entriesByDate = useMemo(() => {
    const map = {};
    entries.forEach((e) => {
      const key = normalizeDateKey(e.entry_date);
      if (key) {
        if (!map[key]) map[key] = [];
        map[key].push(e);
      }
    });
    return map;
  }, [entries]);

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  const monthName = currentDate
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    .toLowerCase();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Calendar cells array
  const calendarCells = useMemo(() => {
    const cells = [];
    // Empty padding cells before first day of month
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ type: 'empty', key: `empty-${i}` });
    }
    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${mStr}-${dStr}`;
      const dayEntries = entriesByDate[dateKey] || [];
      cells.push({
        type: 'day',
        day,
        dateKey,
        entries: dayEntries,
      });
    }
    return cells;
  }, [year, month, daysInMonth, firstDayIndex, entriesByDate]);

  const selectedDayEntries = entriesByDate[selectedDayKey] || [];

  const openNewForDate = (dateKey) => {
    setNewEntryDate(dateKey || selectedDayKey);
    setActiveEntry(null);
    setShowModal(true);
  };

  const todayKey = new Date().toISOString().split('T')[0];

  return (
    <div
      className="min-h-screen px-4 sm:px-8 md:px-12 py-8 transition-colors duration-200 lowercase"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
            >
              <span>calendar diary view</span>
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                <CalendarDays size={16} />
              </span>
            </h1>
            <p className="text-[13px] md:text-[14px] font-medium mt-1" style={{ color: 'var(--ink-soft)' }}>
              browse your thoughts by day and visualize your monthly mood patterns. 🌸
            </p>
          </div>

          <button
            onClick={() => openNewForDate(todayKey)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[13px] font-bold text-white shadow-xs transition hover:scale-105 cursor-pointer"
            style={{ background: 'var(--accent)' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>write for today</span>
          </button>
        </div>

        {/* Calendar Card */}
        <div
          className="rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6"
          style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border-soft)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <h2
              className="text-xl font-bold tracking-tight text-[var(--ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {monthName}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-2xl bg-[var(--surface-muted)] hover:bg-black/5 transition text-[var(--ink)] cursor-pointer"
                title="previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--accent-soft)] text-[var(--accent)] hover:opacity-85 transition cursor-pointer"
              >
                today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-2xl bg-[var(--surface-muted)] hover:bg-black/5 transition text-[var(--ink)] cursor-pointer"
                title="next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

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
            {calendarCells.map((cell, idx) => {
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
                  onClick={() => setSelectedDayKey(cell.dateKey)}
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
                      <span className="text-sm select-none" title={moodMeta?.label}>
                        {moodMeta?.emoji || '✨'}
                      </span>
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

        {/* Selected Date Entries Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3
              className="text-lg font-bold text-[var(--ink)] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <BookOpen size={18} style={{ color: 'var(--accent)' }} />
              <span>reflections for {formatDiaryDate(selectedDayKey)}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                {selectedDayEntries.length}
              </span>
            </h3>

            <button
              onClick={() => openNewForDate(selectedDayKey)}
              className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>write entry for this day</span>
            </button>
          </div>

          {selectedDayEntries.length === 0 ? (
            <div
              className="rounded-3xl py-10 px-6 text-center flex flex-col items-center gap-2"
              style={{
                background: 'var(--surface)',
                border: '2px dashed var(--border-soft)',
              }}
            >
              <p className="text-sm font-bold text-[var(--ink)]">
                no entries recorded on {formatDiaryDate(selectedDayKey)} ☁️
              </p>
              <button
                onClick={() => openNewForDate(selectedDayKey)}
                className="mt-2 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-[var(--accent)] transition hover:scale-105 cursor-pointer"
              >
                + write entry for this date ✨
              </button>
            </div>
          ) : (
            <div
              className="grid gap-4 sm:gap-5"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
            >
              {selectedDayEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onOpen={openEntry} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <EntryModal
          entry={
            activeEntry || (newEntryDate ? { entry_date: newEntryDate } : null)
          }
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
          allExistingTags={allTags}
        />
      )}
    </div>
  );
}
