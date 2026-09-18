import { useState } from 'react';
import ProfileDropdown from '../components/ProfileDropdown';
import { RefreshCw, Heart, Copy, Check, Plus, X, Quote } from 'lucide-react';

const AFFIRMATION_PRESETS = [
  "i am worthy of peace, joy, and gentle days",
  "my feelings are valid, and i give myself permission to feel them",
  "today is a fresh page in my story, and i get to choose the words",
  "small steps every day lead to beautiful transformations",
  "i am gentle with my mind and proud of how far i've come",
  "i deserve the same unconditional kindness i give to others",
  "my voice and reflections are precious and true",
];

export default function Affirmations() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [customAffirmations, setCustomAffirmations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('uf_custom_affirmations') || '[]');
    } catch {
      return [];
    }
  });

  const allAffirmations = [...AFFIRMATION_PRESETS, ...customAffirmations];

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('uf_fav_affirmations') || '[]');
    } catch {
      return [];
    }
  });

  const nextAffirmation = () => {
    setCurrentIndex((prev) => (prev + 1) % allAffirmations.length);
    setCopied(false);
  };

  const copyCurrent = () => {
    navigator.clipboard.writeText(allAffirmations[currentIndex]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = (text) => {
    setFavorites((prev) => {
      const next = prev.includes(text) ? prev.filter((x) => x !== text) : [...prev, text];
      localStorage.setItem('uf_fav_affirmations', JSON.stringify(next));
      return next;
    });
  };

  const handleAddAffirmation = () => {
    if (newAffirmation.trim()) {
      const updated = [...customAffirmations, newAffirmation.trim()];
      setCustomAffirmations(updated);
      localStorage.setItem('uf_custom_affirmations', JSON.stringify(updated));
      setNewAffirmation('');
      setShowAddModal(false);
      setCurrentIndex(allAffirmations.length);
    }
  };

  const handleRemoveCustomAffirmation = (text) => {
    const updated = customAffirmations.filter((a) => a !== text);
    setCustomAffirmations(updated);
    localStorage.setItem('uf_custom_affirmations', JSON.stringify(updated));
    if (allAffirmations[currentIndex] === text && currentIndex >= allAffirmations.length - 1) {
      setCurrentIndex(0);
    }
  };

  const currentText = allAffirmations[currentIndex] || allAffirmations[0];
  const isFav = favorites.includes(currentText);

  return (
    <div
      className="min-h-screen px-4 sm:px-8 md:px-12 py-8 transition-colors duration-200"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Header */}
          {/* Header with Profile Dropdown */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
            >
              daily affirmations
            </h1>
            <p className="text-[13px] md:text-[14px] font-medium mt-1" style={{ color: 'var(--ink-soft)' }}>
              gentle words to nurture your mindset and bring warmth to your day
            </p>
          </div>
          
          <ProfileDropdown />
        </div>

        {/* Featured Affirmation Card */}
        <div
          className="rounded-3xl p-8 md:p-12 text-center flex flex-col items-center justify-center relative shadow-lg transition-all"
          style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border-soft)',
            boxShadow: 'var(--modal-shadow)',
          }}
        >
          <Quote size={40} className="rotate-180 mb-6" style={{ color: 'var(--accent)' }} />

          <h2
            key={currentIndex}
            className="text-2xl md:text-3xl font-bold leading-relaxed max-w-xl animate-cute-fade mb-8"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
          >
            "{currentText}"
          </h2>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              onClick={nextAffirmation}
              className="p-2 rounded-full transition hover:bg-black/5 hover:scale-110 active:scale-95"
              style={{ color: 'var(--ink)' }}
              title="new affirmation"
              aria-label="new affirmation"
            >
              <RefreshCw size={20} />
            </button>

            <button
              onClick={() => toggleFavorite(currentText)}
              className="p-2 rounded-full transition hover:bg-black/5 hover:scale-110 active:scale-95"
              style={{ color: isFav ? 'var(--accent)' : 'var(--ink)' }}
              title={isFav ? 'remove from favorites' : 'save to favorites'}
              aria-label={isFav ? 'remove from favorites' : 'save to favorites'}
            >
              <Heart size={20} className={isFav ? 'fill-current' : ''} />
            </button>

            <button
              onClick={copyCurrent}
              className="p-2 rounded-full transition hover:bg-black/5 hover:scale-110 active:scale-95"
              style={{ color: copied ? 'var(--accent)' : 'var(--ink)' }}
              title={copied ? 'copied' : 'copy text'}
              aria-label={copied ? 'copied' : 'copy text'}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 rounded-full transition hover:bg-black/5 hover:scale-110 active:scale-95"
              style={{ color: 'var(--ink)' }}
              title="add your own affirmation"
              aria-label="add your own affirmation"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Favorites & Custom Affirmations in a Grid */}
        {(favorites.length > 0 || customAffirmations.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Favorites */}
            {favorites.length > 0 && (
              <div
                className="rounded-3xl p-6"
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border-soft)',
                }}
              >
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--ink-soft)' }}>
                  <Heart size={14} className="text-[var(--accent)] fill-current" />
                  <span>favorites ({favorites.length})</span>
                </h3>

                <div className="flex flex-col gap-3">
                  {favorites.map((fav, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-3 p-3 rounded-2xl"
                      style={{ background: 'var(--bg-page)' }}
                    >
                      <p className="text-[13px] font-medium leading-relaxed" style={{ color: 'var(--ink)' }}>
                        "{fav}"
                      </p>
                      <button
                        onClick={() => toggleFavorite(fav)}
                        className="p-1 rounded-full hover:bg-red-50 transition shrink-0 mt-0.5"
                        style={{ color: 'var(--ink-soft)' }}
                        title="remove"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Affirmations */}
            {customAffirmations.length > 0 && (
              <div
                className="rounded-3xl p-6"
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border-soft)',
                }}
              >
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--ink-soft)' }}>
                  <Plus size={14} className="text-[var(--accent)]" />
                  <span>custom ({customAffirmations.length})</span>
                </h3>

                <div className="flex flex-col gap-3">
                  {customAffirmations.map((aff, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-3 p-3 rounded-2xl"
                      style={{ background: 'var(--bg-page)' }}
                    >
                      <p className="text-[13px] font-medium leading-relaxed" style={{ color: 'var(--ink)' }}>
                        "{aff}"
                      </p>
                      <button
                        onClick={() => handleRemoveCustomAffirmation(aff)}
                        className="p-1 rounded-full hover:bg-red-50 transition shrink-0 mt-0.5"
                        style={{ color: 'var(--ink-soft)' }}
                        title="remove"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Affirmation Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(35, 25, 20, 0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="max-w-md w-full rounded-3xl p-6 animate-cute-pop"
            style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border-soft)',
              boxShadow: 'var(--modal-shadow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
              >
                add your own affirmation
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-black/5 transition"
                style={{ color: 'var(--ink-soft)' }}
                aria-label="close"
              >
                <X size={20} />
              </button>
            </div>

            <textarea
              value={newAffirmation}
              onChange={(e) => setNewAffirmation(e.target.value)}
              placeholder="write your personal affirmation..."
              className="w-full px-4 py-3 rounded-2xl border text-[14px] font-medium outline-none resize-none min-h-[120px] transition focus:border-[var(--accent)]"
              style={{
                background: 'var(--surface-muted)',
                borderColor: 'var(--border-soft)',
                color: 'var(--ink)',
              }}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-2xl text-[14px] font-bold transition hover:bg-black/5 cursor-pointer"
                style={{ color: 'var(--ink-soft)', background: 'var(--surface-muted)' }}
              >
                cancel
              </button>
              <button
                onClick={handleAddAffirmation}
                disabled={!newAffirmation.trim()}
                className="flex-1 py-3 rounded-2xl text-[14px] font-bold text-white transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
                style={{ background: 'var(--accent)' }}
              >
                add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}