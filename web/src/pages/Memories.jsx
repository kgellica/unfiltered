import { useMemo } from 'react';
import { Bookmark, Calendar, ArrowRight, Plus } from 'lucide-react';
import { useJournal } from '../hooks/useJournal';
import EntryModal from '../components/EntryModal';
import EntryCard from '../components/EntryCard';
import StateMessage from '../components/StateMessage';
import ProfileDropdown from '../components/ProfileDropdown';
import { formatDiaryDate, formatShortDate, formatTime, MOOD_META, getReadableText } from '../lib/color';

export default function Memories() {
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

  // Find the oldest entry for flashback
  const flashbackEntry = useMemo(() => {
    if (entries.length === 0) return null;
    return entries[entries.length - 1];
  }, [entries]);

  // Helper to strip HTML
  function stripHtmlAndEntities(html = '') {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = doc.body.textContent || '';
    return text.replace(/\s+/g, ' ').trim();
  }

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
        {flashbackEntry && (
          <div
            className="rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-sm relative overflow-hidden"
            style={{
              background: flashbackEntry.bg_color || flashbackEntry.color || 'var(--surface)',
              border: '1.5px solid var(--border-soft)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {/* Top Header: Date & Mood Badge */}
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: 'var(--ink-soft)' }}>
                <Calendar size={13} className="shrink-0 opacity-80" />
                <span>{formatShortDate(flashbackEntry.entry_date)}</span>
                {flashbackEntry.created_at && (
                  <span className="text-[11px] opacity-75">• {formatTime(flashbackEntry.created_at)}</span>
                )}
              </div>

              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold shadow-xs shrink-0 transition-transform hover:scale-105"
                style={{
                  background: 'var(--surface-muted)',
                  color: 'var(--ink)',
                }}
                title={MOOD_META[flashbackEntry.mood]?.label || 'good'}
              >
                <span>{MOOD_META[flashbackEntry.mood]?.emoji || '🌸'}</span>
                <span className="text-[11px]">{MOOD_META[flashbackEntry.mood]?.label || 'good'}</span>
              </div>
            </div>

            {/* Entry Title */}
            <h2
              className="text-xl md:text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
            >
              {flashbackEntry.title || 'untitled reflection'}
            </h2>

            {/* Body preview */}
            <p className="text-[14px] font-medium leading-relaxed line-clamp-4 text-[var(--ink-soft)]">
              {stripHtmlAndEntities(flashbackEntry.content) || 'no content written yet...'}
            </p>

            {/* Bottom Row */}
            <div className="flex items-center justify-between pt-2 border-t border-black/5 mt-1">
              <div className="flex flex-wrap gap-1.5">
                {(flashbackEntry.tags || []).length > 0 ? (
                  <>
                    {(flashbackEntry.tags || []).slice(0, 3).map((t) => {
                      const tagName = t.name || t;
                      return (
                        <span
                          key={tagName}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-lg"
                          style={{
                            background: 'var(--accent-soft)',
                            color: 'var(--accent)',
                          }}
                        >
                          #{tagName}
                        </span>
                      );
                    })}
                    {(flashbackEntry.tags || []).length > 3 && (
                      <span className="text-[10px] font-bold opacity-75" style={{ color: 'var(--ink-soft)' }}>
                        +{flashbackEntry.tags.length - 3} more
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[11px] font-medium italic opacity-60" style={{ color: 'var(--ink-soft)' }}>
                    no tags
                  </span>
                )}
              </div>

              <button
                onClick={() => openEntry(flashbackEntry)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[13px] font-bold text-white bg-[var(--accent)] transition hover:scale-105 cursor-pointer shadow-xs shrink-0"
              >
                <span>revisit memory</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-[var(--border-soft)]">
          <Bookmark size={32} className="text-[var(--ink-soft)] mb-3 opacity-60" />
          <h3
            className="text-lg font-bold text-[var(--ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {entries.length === 0 ? 'no memories yet' : 'your memory collection'}
          </h3>
          <p className="text-xs text-[var(--ink-soft)] max-w-sm mt-1">
            {entries.length === 0
              ? 'start capturing your precious moments and reflections'
              : `you have ${entries.length} ${entries.length === 1 ? 'memory' : 'memories'} stored in your collection`}
          </p>
          {entries.length === 0 && (
            <button
              onClick={openNew}
              className="mt-4 px-5 py-2.5 rounded-2xl text-[13px] font-bold text-white transition hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              style={{ background: 'var(--accent)' }}
            >
              <Plus size={16} />
              <span>write your first memory</span>
            </button>
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