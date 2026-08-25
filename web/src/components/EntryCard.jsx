import { getReadableText, MOOD_META, formatShortDate, formatTime } from '../lib/color';
import { Calendar, Tag as TagIcon, Sparkles } from 'lucide-react';

export default function EntryCard({ entry, onOpen }) {
  const hasCustomBg = Boolean(entry.bg_color || entry.color);
  const cardColor = entry.bg_color || entry.color || '';
  const bg = cardColor || 'var(--surface)';
  const ink = hasCustomBg ? getReadableText(cardColor) : 'var(--ink)';
  const softInk = hasCustomBg ? `${ink}bb` : 'var(--ink-soft)';
  const mood = MOOD_META[entry.mood] || MOOD_META.good;

  // Clean HTML from content for preview
  const plainText = (entry.content || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const formattedDate = formatShortDate(entry.entry_date);

  return (
    <button
      onClick={() => onOpen(entry)}
      className="text-left rounded-3xl p-5 md:p-6 flex flex-col gap-3.5 h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg lowercase cursor-pointer relative overflow-hidden group"
      style={{
        background: bg,
        border: hasCustomBg ? '1px solid rgba(0,0,0,0.06)' : '1.5px solid var(--border-soft)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      {/* Top Header: Date & Mood Badge */}
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: softInk }}>
          <Calendar size={13} className="shrink-0 opacity-80" />
          <span>{formattedDate}</span>
          {entry.created_at && (
            <span className="text-[11px] opacity-75">• {formatTime(entry.created_at)}</span>
          )}
        </div>

        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold shadow-xs shrink-0 transition-transform group-hover:scale-105"
          style={{
            background: hasCustomBg ? 'rgba(255,255,255,0.45)' : 'var(--surface-muted)',
            color: ink,
          }}
          title={mood.label}
        >
          <span>{mood.emoji}</span>
          <span className="text-[11px]">{mood.label}</span>
        </div>
      </div>

      {/* Entry Title */}
      <h3
        className="text-[17px] font-bold tracking-tight line-clamp-1 group-hover:text-[var(--accent)] transition-colors"
        style={{ fontFamily: 'var(--font-display)', color: ink }}
      >
        {entry.title || 'untitled reflection'}
      </h3>

      {/* Body preview */}
      <p
        className="text-[13.5px] leading-relaxed line-clamp-3 font-medium flex-1"
        style={{ color: softInk }}
      >
        {plainText || 'no content written yet... ✨'}
      </p>

      {/* Bottom Tag List */}
      <div className="mt-auto pt-2 flex items-center justify-between gap-2 border-t border-black/5 w-full">
        <div className="flex flex-wrap gap-1.5">
          {(entry.tags || []).length === 0 ? (
            <span className="text-[11px] font-medium italic opacity-60" style={{ color: softInk }}>
              no tags
            </span>
          ) : (
            (entry.tags || []).slice(0, 3).map((t) => {
              const tagName = t.name || t;
              return (
                <span
                  key={tagName}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1"
                  style={{
                    background: hasCustomBg ? 'rgba(0,0,0,0.06)' : 'var(--accent-soft)',
                    color: hasCustomBg ? ink : 'var(--accent)',
                  }}
                >
                  #{tagName}
                </span>
              );
            })
          )}
          {(entry.tags || []).length > 3 && (
            <span className="text-[10px] font-bold opacity-75" style={{ color: softInk }}>
              +{entry.tags.length - 3} more
            </span>
          )}
        </div>

        <span
          className="text-[11px] font-semibold opacity-70 flex items-center gap-1 shrink-0"
          style={{ color: softInk }}
        >
          open <Sparkles size={11} />
        </span>
      </div>
    </button>
  );
}
