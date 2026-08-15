import { useState } from 'react';
import { Sparkles, RefreshCw, Heart, Quote, Copy, Check } from 'lucide-react';

const AFFIRMATION_PRESETS = [
  "i am worthy of peace, joy, and gentle days. 🌸",
  "my feelings are valid, and i give myself permission to feel them. ☕",
  "today is a fresh page in my story, and i get to choose the words. ✨",
  "small steps every day lead to beautiful transformations. 🌱",
  "i am gentle with my mind and proud of how far i've come. 🧸",
  "i deserve the same unconditional kindness i give to others. 💕",
  "my voice and reflections are precious and true. ✍️",
];

export default function Affirmations() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('uf_fav_affirmations') || '[]');
    } catch {
      return [];
    }
  });

  const nextAffirmation = () => {
    setCurrentIndex((prev) => (prev + 1) % AFFIRMATION_PRESETS.length);
    setCopied(false);
  };

  const copyCurrent = () => {
    navigator.clipboard.writeText(AFFIRMATION_PRESETS[currentIndex]);
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

  const currentText = AFFIRMATION_PRESETS[currentIndex];
  const isFav = favorites.includes(currentText);

  return (
    <div
      className="min-h-screen px-4 sm:px-8 md:px-12 py-8 transition-colors duration-200 lowercase"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
          >
            <span>daily affirmations</span>
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <Sparkles size={16} />
            </span>
          </h1>
          <p className="text-[13px] md:text-[14px] font-medium mt-1" style={{ color: 'var(--ink-soft)' }}>
            gentle words to nurture your mindset and bring warmth to your day. 🌸
          </p>
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
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            <Quote size={24} className="rotate-180" />
          </div>

          <h2
            key={currentIndex}
            className="text-2xl md:text-3xl font-bold leading-relaxed max-w-xl animate-cute-fade mb-8"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
          >
            "{currentText}"
          </h2>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={nextAffirmation}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[13.5px] font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--accent)' }}
            >
              <RefreshCw size={15} />
              <span>new affirmation</span>
            </button>

            <button
              onClick={() => toggleFavorite(currentText)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-bold transition hover:bg-black/5"
              style={{
                background: isFav ? 'var(--accent-soft)' : 'var(--surface-muted)',
                color: isFav ? 'var(--accent)' : 'var(--ink)',
                border: '1px solid var(--border-soft)',
              }}
            >
              <Heart size={15} className={isFav ? 'fill-current text-[var(--accent)]' : ''} />
              <span>{isFav ? 'saved in heart' : 'save to heart'}</span>
            </button>

            <button
              onClick={copyCurrent}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-bold transition hover:bg-black/5"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--ink)',
                border: '1px solid var(--border-soft)',
              }}
            >
              {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
              <span>{copied ? 'copied!' : 'copy text'}</span>
            </button>
          </div>
        </div>

        {/* Saved Favorites */}
        {favorites.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
              <Heart size={16} className="text-[var(--accent)] fill-current" />
              <span>your favorite affirmations ({favorites.length})</span>
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {favorites.map((fav, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 flex items-start justify-between gap-3 shadow-xs"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border-soft)',
                  }}
                >
                  <p className="text-[13.5px] font-medium leading-relaxed" style={{ color: 'var(--ink)' }}>
                    "{fav}"
                  </p>
                  <button
                    onClick={() => toggleFavorite(fav)}
                    className="text-xs text-red-400 hover:text-red-500 font-bold shrink-0"
                    title="remove favorite"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
