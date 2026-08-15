import { useEffect, useRef, useState } from 'react';
import { Search, Calendar, Tag, ChevronDown, X, Sparkles, CalendarDays } from 'lucide-react';
import { formatDiaryDate } from '../lib/color';

export default function TopBar({
  query,
  onQueryChange,
  date,
  onDateChange,
  tags,
  selectedTag,
  onTagChange,
  user,
}) {
  const [tagOpen, setTagOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const tagRef = useRef(null);
  const dateRef = useRef(null);
  const dateInputRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (tagRef.current && !tagRef.current.contains(e.target)) setTagOpen(false);
      if (dateRef.current && !dateRef.current.contains(e.target)) setDateOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleSelectDatePreset = (preset) => {
    if (preset === 'all') onDateChange('');
    if (preset === 'today') onDateChange(getTodayStr());
    if (preset === 'yesterday') onDateChange(getYesterdayStr());
    setDateOpen(false);
  };

  const dateLabel = date ? formatDiaryDate(date) : 'any date';

  return (
    <div className="flex items-center gap-3 flex-wrap lowercase">
      {/* Search Input */}
      <div
        className="flex items-center gap-2.5 h-11 px-4 rounded-2xl flex-1 min-w-[220px] transition-all shadow-sm focus-within:ring-2 focus-within:ring-[var(--accent-soft)]"
        style={{
          background: 'var(--surface)',
          border: '1.5px solid var(--border-soft)',
        }}
      >
        <Search size={17} style={{ color: 'var(--ink-faint)' }} />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="search your thoughts... 💭"
          className="bg-transparent outline-none text-[13.5px] font-medium flex-1 lowercase placeholder:text-[var(--ink-faint)]"
          style={{ color: 'var(--ink)' }}
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="p-1 rounded-full hover:bg-black/5"
            style={{ color: 'var(--ink-faint)' }}
            aria-label="clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Interactive Date Filter Popover */}
      <div className="relative" ref={dateRef}>
        <button
          onClick={() => setDateOpen((v) => !v)}
          className="flex items-center gap-2 h-11 px-4 rounded-2xl text-[13px] font-medium transition-all shadow-sm hover:border-[var(--accent)]"
          style={{
            background: date ? 'var(--accent-soft)' : 'var(--surface)',
            border: `1.5px solid ${date ? 'var(--accent)' : 'var(--border-soft)'}`,
            color: date ? 'var(--ink)' : 'var(--ink-soft)',
          }}
        >
          <Calendar size={16} style={{ color: date ? 'var(--accent)' : 'var(--ink-soft)' }} />
          <span className="font-semibold">{dateLabel}</span>
          <ChevronDown size={14} />
        </button>

        {dateOpen && (
          <div
            className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 rounded-3xl p-3 z-30 shadow-xl animate-cute-pop"
            style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border-soft)',
              boxShadow: 'var(--modal-shadow)',
            }}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-soft)]">
              <span className="text-[12px] font-bold text-[var(--ink-soft)] flex items-center gap-1.5">
                <CalendarDays size={14} /> filter by date
              </span>
              {date && (
                <button
                  onClick={() => handleSelectDatePreset('all')}
                  className="text-[11px] font-semibold text-[var(--accent)] hover:underline"
                >
                  clear
                </button>
              )}
            </div>

            {/* Quick date presets */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              <button
                onClick={() => handleSelectDatePreset('all')}
                className={`py-1.5 px-2 rounded-xl text-[12px] font-semibold transition ${
                  !date
                    ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                    : 'bg-[var(--surface-muted)] text-[var(--ink-soft)] hover:bg-[var(--accent-soft)]'
                }`}
              >
                all
              </button>
              <button
                onClick={() => handleSelectDatePreset('today')}
                className={`py-1.5 px-2 rounded-xl text-[12px] font-semibold transition ${
                  date === getTodayStr()
                    ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                    : 'bg-[var(--surface-muted)] text-[var(--ink-soft)] hover:bg-[var(--accent-soft)]'
                }`}
              >
                today
              </button>
              <button
                onClick={() => handleSelectDatePreset('yesterday')}
                className={`py-1.5 px-2 rounded-xl text-[12px] font-semibold transition ${
                  date === getYesterdayStr()
                    ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                    : 'bg-[var(--surface-muted)] text-[var(--ink-soft)] hover:bg-[var(--accent-soft)]'
                }`}
              >
                yesterday
              </button>
            </div>

            {/* Custom calendar picker */}
            <div className="mt-2">
              <label className="text-[11px] font-semibold text-[var(--ink-faint)] block mb-1">
                pick specific day:
              </label>
              <input
                ref={dateInputRef}
                type="date"
                value={date}
                onChange={(e) => {
                  onDateChange(e.target.value);
                  setDateOpen(false);
                }}
                className="w-full px-3 py-2 text-[12.5px] rounded-xl font-medium outline-none bg-[var(--surface-muted)] border border-[var(--border-soft)] text-[var(--ink)] cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tag Filter Dropdown */}
      <div className="relative" ref={tagRef}>
        <button
          onClick={() => setTagOpen((v) => !v)}
          className="flex items-center gap-2 h-11 px-4 rounded-2xl text-[13px] font-medium transition-all shadow-sm hover:border-[var(--accent)]"
          style={{
            background: selectedTag ? 'var(--accent-soft)' : 'var(--surface)',
            border: `1.5px solid ${selectedTag ? 'var(--accent)' : 'var(--border-soft)'}`,
            color: selectedTag ? 'var(--ink)' : 'var(--ink-soft)',
          }}
        >
          <Tag size={15} style={{ color: selectedTag ? 'var(--accent)' : 'var(--ink-soft)' }} />
          <span className="font-semibold">{selectedTag ? `#${selectedTag}` : 'all tags'}</span>
          <ChevronDown size={14} />
        </button>

        {tagOpen && (
          <div
            className="absolute right-0 mt-2 w-52 rounded-3xl p-2.5 z-30 shadow-xl animate-cute-pop max-h-64 overflow-y-auto"
            style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border-soft)',
              boxShadow: 'var(--modal-shadow)',
            }}
          >
            <button
              onClick={() => {
                onTagChange('');
                setTagOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-[13px] font-semibold transition ${
                !selectedTag
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'text-[var(--ink-soft)] hover:bg-[var(--surface-muted)]'
              }`}
            >
              #all tags
            </button>

            {tags.length === 0 ? (
              <p className="px-3 py-3 text-[12px] text-center text-[var(--ink-faint)]">
                no tags yet 🏷️
              </p>
            ) : (
              <div className="mt-1 space-y-1">
                {tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      onTagChange(t);
                      setTagOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-[13px] font-semibold truncate transition flex items-center justify-between ${
                      selectedTag === t
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'text-[var(--ink)] hover:bg-[var(--surface-muted)]'
                    }`}
                  >
                    <span>#{t}</span>
                    {selectedTag === t && <Sparkles size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm shrink-0 border-2 border-[var(--border-soft)] transition-transform hover:scale-105"
        style={{
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
        }}
        title={user?.name}
      >
        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    </div>
  );
}
