import { useMemo, useState } from 'react';
import { useJournal } from '../hooks/useJournal';
import EntryModal from '../components/EntryModal';
import ProfileDropdown from '../components/ProfileDropdown';
import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarGrid from '../components/calendar/CalendarGrid';
import SelectedDayEntries from '../components/calendar/SelectedDayEntries';
import { normalizeDateKey } from '../lib/color';

export default function CalendarView() {
  const {
    entries,
    loading,
    allTags,
    activeEntry,
    showModal,
    setActiveEntry,
    setShowModal,
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

  // Generate list of available years (e.g. current year - 3 to current year + 1)
  const currentYear = new Date().getFullYear();
  const availableYears = useMemo(
    () => Array.from({ length: 5 }, (_, i) => currentYear - 3 + i),
    [currentYear]
  );

  // Month & Year calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  const monthOnlyName = currentDate
    .toLocaleDateString('en-US', { month: 'long' })
    .toLowerCase();

  // Year change handler
  const handleYearChange = (newYear) => {
    setCurrentDate(new Date(newYear, month, 1));
  };

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
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
            >
              <span>calendar</span>
            </h1>
            <p className="text-[13px] md:text-[14px] font-medium mt-1" style={{ color: 'var(--ink-soft)' }}>
              browse your thoughts by day and visualize your monthly mood patterns.
            </p>
          </div>

          <ProfileDropdown />
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
          <CalendarHeader
            selectedYear={year}
            onYearChange={handleYearChange}
            availableYears={availableYears}
            monthName={monthOnlyName}
            onPrev={prevMonth}
            onNext={nextMonth}
            onToday={() => setCurrentDate(new Date())}
          />

          <CalendarGrid
            calendarCells={calendarCells}
            selectedDayKey={selectedDayKey}
            todayKey={todayKey}
            onSelectDay={setSelectedDayKey}
          />
        </div>

        {/* Selected Date Entries Section */}
        <SelectedDayEntries
          loading={loading}
          selectedDayEntries={selectedDayEntries}
          selectedDayKey={selectedDayKey}
          onOpenEntry={openEntry}
          onOpenNewForDate={openNewForDate}
        />
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