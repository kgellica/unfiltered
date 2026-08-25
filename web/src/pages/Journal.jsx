import { useMemo, useState } from 'react';
import { Plus, BookOpen, Calendar, Tag as TagIcon, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJournal } from '../hooks/useJournal';
import TopBar from '../components/TopBar';
import StreakTrail from '../components/StreakTrail';
import EntryCard from '../components/EntryCard';
import EntryModal from '../components/EntryModal';
import AnimatedGreeting from '../components/AnimatedGreeting';
import { normalizeDateKey, formatDiaryDate } from '../lib/color';

export default function Journal() {
  const { user } = useAuth();
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

  const entryDates = useMemo(
    () => entries.map((e) => normalizeDateKey(e.entry_date)).filter(Boolean),
    [entries]
  );

  const visibleEntries = useMemo(() => {
    return entries.filter((e) => {
      // Date filter
      if (date && normalizeDateKey(e.entry_date) !== normalizeDateKey(date)) {
        return false;
      }
      // Tag filter
      if (
        selectedTag &&
        !(e.tags || []).some(
          (t) => (typeof t === 'string' ? t : t.name).toLowerCase() === selectedTag.toLowerCase()
        )
      ) {
        return false;
      }
      // Keyword query filter
      if (query) {
        const q = query.toLowerCase();
        const inTitle = e.title?.toLowerCase().includes(q);
        const inContent = (e.content || '').toLowerCase().includes(q);
        if (!inTitle && !inContent) return false;
      }
      return true;
    });
  }, [entries, date, selectedTag, query]);

  const hasActiveFilters = Boolean(date || selectedTag || query);

  const clearAllFilters = () => {
    setDate('');
    setSelectedTag('');
    setQuery('');
  };

  return (
    <div
      className="min-h-screen px-4 sm:px-8 md:px-12 py-8 transition-colors duration-200"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-7">
        {/* Top Header: Animated Greeting & New Entry Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <AnimatedGreeting userName={user?.name} />

          <button
            onClick={openNew}
            className="flex items-center justify-center gap-2 h-12 px-5 rounded-2xl text-[14px] font-bold shrink-0 shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto lowercase"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              boxShadow: '0 6px 20px -2px var(--accent-soft)',
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>new entry 🌸</span>
          </button>
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
        />

        {/* Active Filters Pill Bar (Allows removing individual filters) */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap -mt-3 text-xs lowercase">
            <span className="font-bold text-[var(--ink-soft)]">active filters:</span>

            {date && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition animate-cute-pop"
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--ink)',
                  border: '1px solid var(--accent)',
                }}
              >
                <Calendar size={12} style={{ color: 'var(--accent)' }} />
                <span>{formatDiaryDate(date)}</span>
                <button
                  onClick={() => setDate('')}
                  className="hover:opacity-75 cursor-pointer"
                  title="remove date filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {selectedTag && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition animate-cute-pop"
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--ink)',
                  border: '1px solid var(--accent)',
                }}
              >
                <TagIcon size={12} style={{ color: 'var(--accent)' }} />
                <span>#{selectedTag}</span>
                <button
                  onClick={() => setSelectedTag('')}
                  className="hover:opacity-75 cursor-pointer"
                  title="remove tag filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            {query && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition animate-cute-pop"
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--ink)',
                  border: '1px solid var(--accent)',
                }}
              >
                <Search size={12} style={{ color: 'var(--accent)' }} />
                <span>"{query}"</span>
                <button
                  onClick={() => setQuery('')}
                  className="hover:opacity-75 cursor-pointer"
                  title="remove search query"
                >
                  <X size={13} />
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-[11.5px] font-bold text-[var(--accent)] hover:underline ml-1 cursor-pointer"
            >
              clear all ✕
            </button>
          </div>
        )}

        {/* Wide Habit & Streak Tracker */}
        <StreakTrail streak={streak} entryDates={entryDates} />

        {/* Journal Entries Stream */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2
              className="text-lg font-bold lowercase flex items-center gap-2"
              style={{ color: 'var(--ink)' }}
            >
              <BookOpen size={18} style={{ color: 'var(--accent)' }} />
              <span>your journal entries</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                {visibleEntries.length}
              </span>
            </h2>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-[var(--accent)] hover:underline lowercase"
              >
                reset filters ✕
              </button>
            )}
          </div>

          {loading ? (
            <div className="rounded-3xl py-16 text-center bg-white/40 border border-[var(--border-soft)] flex flex-col items-center gap-2">
              <Sparkles className="animate-cute-float text-[var(--accent)]" size={24} />
              <p className="text-[13.5px] font-semibold text-[var(--ink-soft)] lowercase">
                gathering your memories... ✨
              </p>
            </div>
          ) : visibleEntries.length === 0 ? (
            <div
              className="rounded-3xl py-16 px-6 text-center flex flex-col items-center gap-3 transition-all"
              style={{
                background: 'var(--surface)',
                border: '2px dashed var(--border-soft)',
              }}
            >
              <div
                className="w-14 h-14 rounded-3xl flex items-center justify-center mb-1"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                <BookOpen size={24} />
              </div>
              <p className="text-[16px] font-bold text-[var(--ink)] lowercase">
                no entries match your active filters ☁️
              </p>
              <p className="text-[13px] font-medium max-w-sm text-[var(--ink-soft)] lowercase">
                {hasActiveFilters
                  ? `you have ${entries.length} total entries. try removing the date or tag filter above to reveal them.`
                  : 'tap "new entry" to capture your first thought today.'}
              </p>

              {hasActiveFilters ? (
                <button
                  onClick={clearAllFilters}
                  className="mt-2 px-5 py-2.5 rounded-2xl text-[13px] font-bold text-white transition hover:scale-105 cursor-pointer"
                  style={{ background: 'var(--accent)' }}
                >
                  show all {entries.length} entries 🌸
                </button>
              ) : (
                <button
                  onClick={openNew}
                  className="mt-2 px-5 py-2.5 rounded-2xl text-[13px] font-bold text-white transition hover:scale-105 cursor-pointer"
                  style={{ background: 'var(--accent)' }}
                >
                  write your first thought today ✨
                </button>
              )}
            </div>
          ) : (
            <div
              className="grid gap-4 sm:gap-5"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
            >
              {visibleEntries.map((entry) => (
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
