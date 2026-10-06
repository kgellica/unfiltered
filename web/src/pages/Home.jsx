import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useJournal } from '../hooks/useJournal';
import EntryModal from '../components/EntryModal';
import AnimatedGreeting from '../components/AnimatedGreeting';
import ProfileDropdown from '../components/ProfileDropdown';
import BookshelfView from '../components/home/BookshelfView';
import SidebarShelf from '../components/home/SidebarShelf';
import MonthEntriesView from '../components/home/MonthEntriesView';
import { parseDiaryDate } from '../lib/color';
import { MONTH_DATA } from '../constants/calendar';

export default function Home() {
  const { user } = useAuth();

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

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const availableYears = useMemo(
    () => Array.from({ length: 5 }, (_, i) => currentYear - 3 + i),
    [currentYear]
  );

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
          <BookshelfView
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            availableYears={availableYears}
            monthlyStats={monthlyStats}
            onSelectMonth={setSelectedMonth}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-cute-fade lg:h-[calc(100vh-10rem)]">
            <SidebarShelf
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              monthlyStats={monthlyStats}
              onSelectMonth={setSelectedMonth}
              onCloseShelf={() => setSelectedMonth(null)}
            />

            <MonthEntriesView
              currentMonthMeta={currentMonthMeta}
              currentMonthData={currentMonthData}
              selectedYear={selectedYear}
              loading={loading}
              sortedEntries={sortedMonthEntries}
              onOpenEntry={openEntry}
              onOpenNew={openNew}
            />
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