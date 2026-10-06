import { useMemo } from 'react';
import { useJournal } from '../hooks/useJournal';
import EntryModal from '../components/EntryModal';
import ProfileDropdown from '../components/ProfileDropdown';
import FeaturedMemoryCard from '../components/memories/FeaturedMemoryCard';
import MemoryCollectionSummary from '../components/memories/MemoryCollectionSummary';

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

  // Find the oldest entry for flashback
  const flashbackEntry = useMemo(() => {
    if (entries.length === 0) return null;
    return entries[entries.length - 1];
  }, [entries]);

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

        {/* Featured Memory Card */}
        <FeaturedMemoryCard
          flashbackEntry={flashbackEntry}
          onOpenEntry={openEntry}
        />

        {/* Bottom Collection Summary */}
        <MemoryCollectionSummary
          entriesCount={entries.length}
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