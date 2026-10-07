import { X } from 'lucide-react';

export default function EntryPhotoGallery({ photoUris, editing, onRemove }) {
  if (photoUris.length === 0) return null;

  if (editing) {
    return (
      <div className="flex flex-wrap gap-3 mb-4">
        {photoUris.map((uri, idx) => (
          <div key={idx} className="relative group rounded-xl overflow-hidden shadow-sm border" style={{ borderColor: 'var(--border-soft)' }}>
            <img src={uri} alt={`photo ${idx + 1}`} className="w-24 h-24 object-cover" />
            <button
              onClick={() => onRemove(idx)}
              className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`gap-3 mb-4 ${photoUris.length === 1 ? '' : 'grid grid-cols-2 sm:grid-cols-3'}`}>
      {photoUris.map((uri, idx) => (
        <a
          key={idx}
          href={uri}
          target="_blank"
          rel="noreferrer"
          className="block rounded-2xl overflow-hidden shadow-sm border hover:opacity-90 transition-opacity"
          style={{ borderColor: 'var(--border-soft)' }}
        >
          <img
            src={uri}
            alt={`photo ${idx + 1}`}
            className={photoUris.length === 1 ? 'w-full max-h-[340px] object-cover' : 'w-full h-40 object-cover'}
          />
        </a>
      ))}
    </div>
  );
}