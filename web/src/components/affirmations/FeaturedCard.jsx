import { RefreshCw, Heart, Copy, Check, Plus, Quote } from 'lucide-react';

export default function FeaturedCard({
  currentText,
  currentIndex,
  isFav,
  copied,
  onNext,
  onToggleFavorite,
  onCopy,
  onOpenAddModal,
}) {
  return (
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
          onClick={onNext}
          className="p-2 rounded-full transition hover:bg-black/5 hover:scale-110 active:scale-95"
          style={{ color: 'var(--ink)' }}
          title="new affirmation"
          aria-label="new affirmation"
        >
          <RefreshCw size={20} />
        </button>

        <button
          onClick={() => onToggleFavorite(currentText)}
          className="p-2 rounded-full transition hover:bg-black/5 hover:scale-110 active:scale-95"
          style={{ color: isFav ? 'var(--accent)' : 'var(--ink)' }}
          title={isFav ? 'remove from favorites' : 'save to favorites'}
          aria-label={isFav ? 'remove from favorites' : 'save to favorites'}
        >
          <Heart size={20} className={isFav ? 'fill-current' : ''} />
        </button>

        <button
          onClick={onCopy}
          className="p-2 rounded-full transition hover:bg-black/5 hover:scale-110 active:scale-95"
          style={{ color: copied ? 'var(--accent)' : 'var(--ink)' }}
          title={copied ? 'copied' : 'copy text'}
          aria-label={copied ? 'copied' : 'copy text'}
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </button>

        <button
          onClick={onOpenAddModal}
          className="p-2 rounded-full transition hover:bg-black/5 hover:scale-110 active:scale-95"
          style={{ color: 'var(--ink)' }}
          title="add your own affirmation"
          aria-label="add your own affirmation"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}