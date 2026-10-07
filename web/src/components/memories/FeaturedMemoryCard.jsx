import { Calendar, ArrowRight, Mic } from 'lucide-react';
import MoodFace from '../MoodFace';
import { formatShortDate, formatTime, MOOD_META, getReadableText } from '../../lib/color';

function stripHtmlAndEntities(html = '') {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const text = doc.body.textContent || '';
  return text.replace(/\s+/g, ' ').trim();
}

export default function FeaturedMemoryCard({ flashbackEntry, onOpenEntry }) {
  if (!flashbackEntry) return null;

  const hasCustomBg = Boolean(flashbackEntry.bg_color || flashbackEntry.color);
  const cardColor = flashbackEntry.bg_color || flashbackEntry.color || '';
  const bg = cardColor || 'var(--surface)';
  const ink = hasCustomBg ? getReadableText(cardColor) : 'var(--ink)';
  const softInk = hasCustomBg ? `${ink}bb` : 'var(--ink-soft)';
  const mood = MOOD_META[flashbackEntry.mood] || MOOD_META.good;
  const plainText = stripHtmlAndEntities(flashbackEntry.content);
  const photos = Array.isArray(flashbackEntry.photo_path)
    ? flashbackEntry.photo_path
    : flashbackEntry.photo_path
    ? [flashbackEntry.photo_path]
    : [];
  const hasVoice = Boolean(flashbackEntry.voice_path);

  return (
    <div
      className="rounded-3xl p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden transition-all duration-200"
      style={{
        background: bg,
        border: hasCustomBg ? '1px solid rgba(0,0,0,0.06)' : '1.5px solid var(--border-soft)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      {/* Header Row: Date & Mood Badge */}
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: softInk }}>
          <Calendar size={13} className="shrink-0 opacity-80" />
          <span>{formatShortDate(flashbackEntry.entry_date)}</span>
          {flashbackEntry.created_at && (
            <span className="text-[11px] opacity-75">• {formatTime(flashbackEntry.created_at)}</span>
          )}
        </div>

        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold shadow-xs shrink-0"
          style={{
            background: hasCustomBg ? 'rgba(255,255,255,0.45)' : 'var(--surface-muted)',
            color: ink,
          }}
          title={mood.label}
        >
          <MoodFace mood={flashbackEntry.mood || 'good'} size={14} color={ink} active={true} strokeWidth={1.8} />
          <span className="text-[11px]">{mood.label}</span>
        </div>
      </div>

      {/* Title */}
      <h2
        className="text-xl md:text-2xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-display)', color: ink }}
      >
        {flashbackEntry.title || ''}
      </h2>

      {/* Body */}
      <p
        className="text-[14px] font-medium leading-relaxed"
        style={{ color: softInk }}
      >
        {plainText || 'no content written yet...'}
      </p>

      {/* Attachments Preview Row (Photos & Voice) */}
      {(photos.length > 0 || hasVoice) && (
        <div className="flex items-center gap-2">
          {hasVoice && (
            <div
              className="flex items-center shrink-0"
              style={{ color: hasCustomBg ? ink : 'var(--accent)' }}
              title="audio note"
            >
              <Mic size={16} />
            </div>
          )}

          {photos.slice(0, 4).map((uri, i) => (
            <img
              key={i}
              src={uri}
              alt=""
              className="w-10 h-10 rounded-xl object-cover shrink-0"
              style={{ border: hasCustomBg ? '1px solid rgba(0,0,0,0.08)' : '1px solid var(--border-soft)' }}
            />
          ))}
          {photos.length > 4 && (
            <span className="text-[11px] font-bold opacity-70" style={{ color: softInk }}>
              +{photos.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Bottom Footer Row */}
      <div className="flex items-center justify-between pt-3 border-t border-black/5 mt-1">
        <div className="flex flex-wrap gap-1.5">
          {(flashbackEntry.tags || []).length > 0 ? (
            <>
              {(flashbackEntry.tags || []).slice(0, 4).map((t) => {
                const tagName = t.name || t;
                return (
                  <span
                    key={tagName}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-lg"
                    style={{
                      background: hasCustomBg ? 'rgba(0,0,0,0.06)' : 'var(--accent-soft)',
                      color: hasCustomBg ? ink : 'var(--accent)',
                    }}
                  >
                    #{tagName}
                  </span>
                );
              })}
              {(flashbackEntry.tags || []).length > 4 && (
                <span className="text-[10px] font-bold opacity-75" style={{ color: softInk }}>
                  +{flashbackEntry.tags.length - 4} more
                </span>
              )}
            </>
          ) : (
            <span className="text-[11px] font-medium italic opacity-60" style={{ color: softInk }}>
              no tags
            </span>
          )}
        </div>

        <button
          onClick={() => onOpenEntry(flashbackEntry)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[13px] font-bold text-white bg-[var(--accent)] transition hover:scale-105 cursor-pointer shadow-xs shrink-0"
        >
          <span>revisit memory</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}