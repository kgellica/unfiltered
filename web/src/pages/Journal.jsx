import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Tag as TagIcon,
  Search,
  X,
  Sparkles,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJournal } from '../hooks/useJournal';
import TopBar from '../components/TopBar';
import StreakTrail from '../components/StreakTrail';
import EntryCard from '../components/EntryCard';
import EntryModal from '../components/EntryModal';
import AnimatedGreeting from '../components/AnimatedGreeting';
import ProfileDropdown from '../components/ProfileDropdown';
import NewEntryButton from '../components/NewEntryButton';
import StateMessage from '../components/StateMessage';
import { normalizeDateKey, formatDiaryDate, parseDiaryDate } from '../lib/color';
import { MONTH_DATA } from '../constants/calendar';

export default function Journal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get month filter from URL params
  const filterMonth = searchParams.get('month');
  const filterYear = searchParams.get('year');

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const entryDates = useMemo(
    () => entries.map((e) => normalizeDateKey(e.entry_date)).filter(Boolean),
    [entries]
  );

  const visibleEntries = useMemo(() => {
    let filtered = entries;

    // Apply month filter from URL
    if (filterMonth !== null && filterYear !== null) {
      const monthNum = parseInt(filterMonth);
      const yearNum = parseInt(filterYear);
      filtered = filtered.filter((e) => {
        const d = parseDiaryDate(e.entry_date);
        return d && d.getMonth() === monthNum && d.getFullYear() === yearNum;
      });
    }

    // Date filter
    if (date) {
      filtered = filtered.filter((e) => normalizeDateKey(e.entry_date) === normalizeDateKey(date));
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter((e) =>
        (e.tags || []).some(
          (t) => (typeof t === 'string' ? t : t.name).toLowerCase() === selectedTag.toLowerCase()
        )
      );
    }

    // Keyword query filter
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter((e) => {
        const inTitle = e.title?.toLowerCase().includes(q);
        const inContent = (e.content || '').toLowerCase().includes(q);
        return inTitle || inContent;
      });
    }

    // Sort from newest to oldest
    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || a.entry_date);
      const dateB = new Date(b.created_at || b.entry_date);
      return dateB - dateA;
    });
  }, [entries, filterMonth, filterYear, date, selectedTag, query]);

  const hasActiveFilters = Boolean(date || selectedTag || query || filterMonth !== null);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(visibleEntries.length / itemsPerPage));
  const paginatedEntries = visibleEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterMonth, filterYear, date, selectedTag, query]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get month name for display
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

        {/* Search, Date Filter, Tag Filter TopBar */}
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

        {/* Wide Habit & Streak Tracker */}
        <StreakTrail streak={streak} entryDates={entryDates} />

        {/* Journal Entries Stream */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2
              className="text-lg font-bold lowercase flex items-center gap-2"
              style={{ color: 'var(--ink)' }}
            >
              <span>journal entries</span>
              {displayMonth && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                >
                  {displayMonth}
                </span>
              )}
              {filterMonth !== null && (
                <button
                  onClick={() => {
                    navigate('/journal');
                    setCurrentPage(1);
                  }}
                  className="text-xs font-bold hover:underline"
                  style={{ color: 'var(--ink-soft)' }}
                >
                  ✕ clear
                </button>
              )}
            </h2>
            <NewEntryButton onClick={openNew} />
          </div>

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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-soft)] flex-wrap gap-3">
                  <span className="text-[12px] font-medium text-[var(--ink-soft)]">
                    showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, visibleEntries.length)} of {visibleEntries.length} entries
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl transition disabled:opacity-30 hover:bg-black/5"
                      style={{ color: 'var(--ink)' }}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`w-8 h-8 rounded-xl text-[13px] font-bold transition ${
                              currentPage === pageNum
                                ? 'text-white'
                                : 'hover:bg-black/5'
                            }`}
                            style={{
                              background: currentPage === pageNum ? 'var(--accent)' : 'transparent',
                              color: currentPage === pageNum ? 'white' : 'var(--ink)',
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl transition disabled:opacity-30 hover:bg-black/5"
                      style={{ color: 'var(--ink)' }}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
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