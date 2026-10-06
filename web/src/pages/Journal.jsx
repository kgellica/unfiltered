import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJournal } from '../hooks/useJournal';
import TopBar from '../components/TopBar';
import StreakTrail from '../components/StreakTrail';
import EntryCard from '../components/EntryCard';
import EntryModal from '../components/EntryModal';
import AnimatedGreeting from '../components/AnimatedGreeting';
import ProfileDropdown from '../components/ProfileDropdown';
import StateMessage from '../components/StateMessage';
import JournalHeader from '../components/journal/JournalHeader';
import JournalPagination from '../components/journal/JournalPagination';
import { normalizeDateKey, parseDiaryDate } from '../lib/color';
import { MONTH_DATA } from '../constants/calendar';

export default function Journal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterMonth = searchParams.get('month');
  const filterYear = searchParams.get('year');

  const {
    entries,
    streak,
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

  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const entryDates = useMemo(
    () => entries.map((e) => normalizeDateKey(e.entry_date)).filter(Boolean),
    [entries]
  );

  const visibleEntries = useMemo(() => {
    let filtered = entries;

    if (filterMonth !== null && filterYear !== null) {
      const monthNum = parseInt(filterMonth);
      const yearNum = parseInt(filterYear);
      filtered = filtered.filter((e) => {
        const d = parseDiaryDate(e.entry_date);
        return d && d.getMonth() === monthNum && d.getFullYear() === yearNum;
      });
    }

    if (date) {
      filtered = filtered.filter((e) => normalizeDateKey(e.entry_date) === normalizeDateKey(date));
    }

    if (selectedTag) {
      filtered = filtered.filter((e) =>
        (e.tags || []).some(
          (t) => (typeof t === 'string' ? t : t.name).toLowerCase() === selectedTag.toLowerCase()
        )
      );
    }

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter((e) => {
        const inTitle = e.title?.toLowerCase().includes(q);
        const inContent = (e.content || '').toLowerCase().includes(q);
        return inTitle || inContent;
      });
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || a.entry_date);
      const dateB = new Date(b.created_at || b.entry_date);
      return dateB - dateA;
    });
  }, [entries, filterMonth, filterYear, date, selectedTag, query]);

  const hasActiveFilters = Boolean(date || selectedTag || query || filterMonth !== null);

  const totalPages = Math.max(1, Math.ceil(visibleEntries.length / itemsPerPage));
  const paginatedEntries = visibleEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterMonth, filterYear, date, selectedTag, query]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearMonthFilter = () => {
    navigate('/journal');
    setCurrentPage(1);
  };

  const monthName = filterMonth !== null ? MONTH_DATA[parseInt(filterMonth)]?.name : null;
  const displayMonth = monthName ? `${monthName} ${filterYear}` : null;

  return (
    <div
      className="min-h-screen px-4 sm:px-8 md:px-12 py-8 transition-colors duration-200"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <AnimatedGreeting userName={user?.name} />
          <ProfileDropdown />
        </div>

        <TopBar
          query={query}
          onQueryChange={setQuery}
          date={date}
          onDateChange={setDate}
          tags={allTags}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          user={user}
          totalEntries={entries.length}
        />

        <StreakTrail streak={streak} entryDates={entryDates} />

        <div className="flex flex-col gap-4">
          <JournalHeader
            displayMonth={displayMonth}
            filterMonth={filterMonth}
            onClearMonthFilter={handleClearMonthFilter}
            onOpenNew={openNew}
          />

          {loading ? (
            <StateMessage type="loading" variant="journal" />
          ) : visibleEntries.length === 0 ? (
            <StateMessage
              variant="journal"
              title={hasActiveFilters ? 'no entries match your filters' : 'no entries yet'}
              description={hasActiveFilters ? 'try clearing your filters' : 'start your first journal entry today'}
              actionLabel={!hasActiveFilters ? '+ write entry' : undefined}
              onAction={!hasActiveFilters ? openNew : undefined}
            />
          ) : (
            <>
              <div
                className="grid gap-4 sm:gap-5"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
              >
                {paginatedEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onOpen={openEntry} />
                ))}
              </div>

              <JournalPagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalEntries={visibleEntries.length}
                onGoToPage={goToPage}
              />
            </>
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