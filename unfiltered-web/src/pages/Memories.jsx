import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Sparkles, Calendar, Heart, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import EntryModal from '../components/EntryModal';
import EntryCard from '../components/EntryCard';
import { formatDiaryDate, MOOD_META } from '../lib/color';

export default function Memories() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEntry, setActiveEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/entries');
      setEntries(res.data.entries || []);
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const allTags = useMemo(() => {
    const s = new Set();
    entries.forEach((e) =>
      (e.tags || []).forEach((t) => s.add(typeof t === 'string' ? t : t.name))
    );
    return Array.from(s);
  }, [entries]);

  // Find a random memory or oldest memory for flashback
  const flashbackEntry = useMemo(() => {
    if (entries.length === 0) return null;
    return entries[entries.length - 1];
  }, [entries]);

  const openEntry = (entry) => {
    setActiveEntry(entry);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSave = async (payload) => {
    try {
      if (payload.id) {
        await api.put(`/entries/${payload.id}`, payload);
      } else {
        await api.post('/entries', payload);
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Failed to save entry:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/entries/${id}`);
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  return (
    <div
      className="min-h-screen px-4 sm:px-8 md:px-12 py-8 transition-colors duration-200 lowercase"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
          >
            <span>memories & flashbacks</span>
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <Bookmark size={16} />
            </span>
          </h1>
          <p className="text-[13px] md:text-[14px] font-medium mt-1" style={{ color: 'var(--ink-soft)' }}>
            look back on how much you've grown, learned, and cherished. ✨
          </p>
        </div>

        {/* Featured Flashback Card */}
        {flashbackEntry && (
          <div
            className="rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-sm relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)',
              border: '1.5px solid var(--border-soft)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center gap-1.5">
                <Sparkles size={13} /> memory spotlight
              </span>
              <span className="text-xs font-semibold text-[var(--ink-soft)]">
                {formatDiaryDate(flashbackEntry.entry_date)}
              </span>
            </div>

            <h2
              className="text-xl md:text-2xl font-bold tracking-tight text-[var(--ink)] mt-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              "{flashbackEntry.title || 'a quiet day in your journey'}"
            </h2>

            <p className="text-[14px] font-medium leading-relaxed line-clamp-3 text-[var(--ink-soft)]">
              {(flashbackEntry.content || '').replace(/<[^>]+>/g, ' ')}
            </p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm">
                mood was: {MOOD_META[flashbackEntry.mood]?.emoji || '🌸'}{' '}
                {MOOD_META[flashbackEntry.mood]?.label || 'good'}
              </span>

              <button
                onClick={() => openEntry(flashbackEntry)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[13px] font-bold text-white bg-[var(--accent)] transition hover:scale-105 cursor-pointer shadow-xs"
              >
                <span>revisit memory</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* All Memory Timeline */}
        <div className="flex flex-col gap-4">
          <h2
            className="text-lg font-bold text-[var(--ink)] flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <Calendar size={18} style={{ color: 'var(--accent)' }} />
            <span>your memory timeline ({entries.length})</span>
          </h2>

          {loading ? (
            <p className="text-[13.5px] font-semibold text-[var(--ink-soft)]">
              gathering your nostalgic moments... 🌸
            </p>
          ) : entries.length === 0 ? (
            <div
              className="rounded-3xl py-12 text-center"
              style={{
                background: 'var(--surface)',
                border: '2px dashed var(--border-soft)',
              }}
            >
              <p className="text-sm font-bold text-[var(--ink)]">no memories written yet ☁️</p>
            </div>
          ) : (
            <div
              className="grid gap-4 sm:gap-5"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
            >
              {entries.map((entry) => (
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
