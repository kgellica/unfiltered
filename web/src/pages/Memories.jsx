// web/src/pages/Memories.jsx
import { useState, useMemo } from 'react';
import { useJournal } from '../hooks/useJournal';
import EntryModal from '../components/EntryModal';
import ProfileDropdown from '../components/ProfileDropdown';
import FeaturedMemoryCard from '../components/memories/FeaturedMemoryCard';
import MemoryCollectionSummary from '../components/memories/MemoryCollectionSummary';
import MemoryFilterPills from '../components/memories/MemoryFilterPills';

export default function Memories() {
  const {
    entries,
    allTags,
    activeEntry,
    showModal,
    openEntry,
    openNew,
    closeModal,
    handleSave,
    handleDelete,
  } = useJournal();

  const [activeFilter, setActiveFilter] = useState('all');

  // Filter entries based on the selected pill
  const filteredEntries = useMemo(() => {
    if (activeFilter === 'photos') {
      return entries.filter(
        (e) => e.photo_path && (Array.isArray(e.photo_path) ? e.photo_path.length > 0 : Boolean(e.photo_path))
      );
    }
    if (activeFilter === 'voice') {
      return entries.filter((e) => Boolean(e.voice_path));
    }
    return entries;
  }, [entries, activeFilter]);

  // Find the oldest entry among filtered items for flashback
  const flashbackEntry = useMemo(() => {
    if (filteredEntries.length === 0) return null;
    return filteredEntries[filteredEntries.length - 1];
  }, [filteredEntries]);

  return (
    <div
      className="min-h-screen px-4 sm:px-8 md:px-12 py-8 transition-colors duration-200 lowercase"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Header with Profile Dropdown */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
            >
              <span>memories</span>
            </h1>
            <p className="text-[13px] md:text-[14px] font-medium mt-1" style={{ color: 'var(--ink-soft)' }}>
              look back on how much you've grown, learned, and cherished.
            </p>
          </div>

          <ProfileDropdown />
        </div>

        {/* Filter Pills */}
        <MemoryFilterPills
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Featured Memory Card */}
        <FeaturedMemoryCard
          flashbackEntry={flashbackEntry}
          onOpenEntry={openEntry}
        />

        {/* Bottom Collection Summary */}
        <MemoryCollectionSummary
          entriesCount={filteredEntries.length}
          onOpenNew={openNew}
        />
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