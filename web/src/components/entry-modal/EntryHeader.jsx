import { Pencil, Trash2, Check, Calendar } from 'lucide-react';
import { formatTime } from '../../lib/color';

export default function EntryHeader({
  editing, onStartEdit, onSave, onRequestDelete,
  isNew, entry, readableDate, dateInputRef, date, onDateChange, ink, borderColor,
}) {
  return (
    <div
      className="flex items-center justify-between px-6 py-4 border-b shrink-0 rounded-t-3xl"
      style={{ borderColor }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => editing && dateInputRef.current?.showPicker?.()}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[13px] font-bold transition-all ${editing ? 'cursor-pointer hover:bg-black/5' : 'cursor-default'}`}
          style={{ color: ink }}
          title={editing ? 'change date' : ''}
        >
          <Calendar size={15} style={{ color: 'var(--accent)' }} />
          <span>{readableDate}</span>
          {editing && <Pencil size={11} className="opacity-60" />}
        </button>
        <input
          ref={dateInputRef}
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="sr-only"
        />
        {!isNew && entry?.created_at && (
          <span className="text-[11px] opacity-70 hidden sm:inline" style={{ color: ink }}>
            • {formatTime(entry.created_at)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {editing ? (
          <button
            onClick={onSave}
            className="text-[13px] font-bold transition-transform hover:scale-105 p-1"
            style={{ color: 'var(--accent)' }}
            aria-label="save entry"
          >
            <Check size={20} strokeWidth={2.5} />
          </button>
        ) : (
          <button
            onClick={onStartEdit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-[13px] font-bold transition hover:bg-black/5"
            style={{ color: ink }}
            aria-label="edit entry"
          >
            <Pencil size={15} />
          </button>
        )}

        {!isNew && (
          <button
            type="button"
            onClick={onRequestDelete}
            className="p-2 rounded-2xl hover:bg-red-50 text-red-500 transition cursor-pointer"
            title="delete entry"
            aria-label="delete entry"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}