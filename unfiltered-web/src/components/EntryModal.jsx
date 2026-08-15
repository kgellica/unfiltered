import { useEffect, useRef, useState } from 'react';
import {
  Pencil,
  Trash2,
  Check,
  X,
  Smile,
  Palette,
  List,
  Tag as TagIcon,
  Calendar,
  Sparkles,
  Plus,
  Heart,
  ListOrdered,
  AlignLeft,
} from 'lucide-react';
import { CARD_COLORS, MOOD_META, getReadableText, formatDiaryDate, formatTime, normalizeDateKey } from '../lib/color';

import ConfirmModal from './ConfirmModal';

export default function EntryModal({ entry, onClose, onSave, onDelete, allExistingTags = [] }) {
  const isNew = !entry?.id;
  const [editing, setEditing] = useState(isNew);
  const [title, setTitle] = useState(entry?.title || '');
  const [date, setDate] = useState(
    entry?.entry_date ? normalizeDateKey(entry.entry_date) : new Date().toISOString().split('T')[0]
  );
  const [mood, setMood] = useState(entry?.mood || 'good');
  const [color, setColor] = useState(entry?.bg_color || entry?.color || '');
  const [tagList, setTagList] = useState(
    (entry?.tags || []).map((t) => (typeof t === 'string' ? t : t.name))
  );

  // Bottom toolbar popover states: null | 'mood' | 'color' | 'tag'
  const [activePopup, setActivePopup] = useState(null);

  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // List mode 3-way toggle: 0 = normal, 1 = numbered, 2 = bullet
  const [listMode, setListMode] = useState(0);

  // New tag input state in tag popup
  const [newTagInput, setNewTagInput] = useState('');

  const bodyRef = useRef(null);
  const dateInputRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.innerHTML = entry?.content || '';
    }
  }, [entry?.id]);

  const togglePopup = (name) => {
    setActivePopup((prev) => (prev === name ? null : name));
  };

  // 3-way List Toggle: Normal -> Numbered -> Bullet -> Normal
  const handleListCycle = () => {
    if (bodyRef.current) {
      bodyRef.current.focus();
    }
    if (listMode === 0) {
      document.execCommand('insertOrderedList', false, null);
      setListMode(1);
    } else if (listMode === 1) {
      document.execCommand('insertOrderedList', false, null); // turn off ordered
      document.execCommand('insertUnorderedList', false, null); // turn on bullet
      setListMode(2);
    } else {
      document.execCommand('insertUnorderedList', false, null);
      setListMode(0);
    }
  };

  const handleAddTag = (e) => {
    if (e) e.preventDefault();
    const clean = newTagInput.trim().toLowerCase().replace(/^#/, '');
    if (clean && !tagList.includes(clean)) {
      setTagList([...tagList, clean]);
    }
    setNewTagInput('');
  };

  const handleToggleTag = (t) => {
    const clean = t.toLowerCase();
    if (tagList.includes(clean)) {
      setTagList(tagList.filter((x) => x !== clean));
    } else {
      setTagList([...tagList, clean]);
    }
  };

  const handleRemoveTag = (t) => {
    setTagList(tagList.filter((x) => x !== t));
  };

  const handleSave = () => {
    const rawContent = bodyRef.current?.innerHTML || '';
    const textOnly = bodyRef.current?.innerText?.trim() || '';
    if (!textOnly && !title.trim()) return;

    onSave({
      ...entry,
      title: title.trim() || null,
      content: rawContent,
      entry_date: date,
      mood,
      bg_color: color || '#FFFFFF',
      color: color || '',
      tags: tagList,
    });
    setEditing(false);
  };

  const confirmDeleteAction = () => {
    setShowDeleteConfirm(false);
    onDelete(entry.id);
  };

  const ink = color ? getReadableText(color) : 'var(--ink)';
  const currentMoodMeta = MOOD_META[mood] || MOOD_META.good;
  const readableDate = formatDiaryDate(date);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 lowercase"
      style={{ background: 'rgba(35, 25, 20, 0.65)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop overlay for closing active popup when clicked */}
      {activePopup && (
        <div
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setActivePopup(null)}
        />
      )}

      <div
        className="w-full max-w-2xl min-h-[560px] max-h-[88vh] rounded-3xl flex flex-col relative shadow-2xl animate-cute-pop transition-colors duration-200"
        style={{
          background: color || 'var(--surface)',
          border: color ? '1.5px solid rgba(0,0,0,0.08)' : '1.5px solid var(--border-soft)',
          boxShadow: 'var(--modal-shadow)',
        }}
      >
        {/* Top Header Bar */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0 rounded-t-3xl"
          style={{ borderColor: color ? 'rgba(0,0,0,0.08)' : 'var(--border-soft)' }}
        >
          {/* Left: Date Display / Picker */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => editing && dateInputRef.current?.showPicker?.()}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[13px] font-bold transition-all ${editing ? 'cursor-pointer hover:bg-black/5' : 'cursor-default'
                }`}
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
              onChange={(e) => setDate(e.target.value)}
              className="sr-only"
            />
            {!isNew && entry?.created_at && (
              <span className="text-[11px] opacity-70 hidden sm:inline" style={{ color: ink }}>
                • {formatTime(entry.created_at)}
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {editing ? (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 text-[13px] font-bold shadow-sm transition-transform hover:scale-105"
                style={{ color: 'var(--accent)' }}
                aria-label="save entry"
              >
                <Check size={16} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
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
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-2xl hover:bg-red-50 text-red-500 transition cursor-pointer"
                title="delete entry"
                aria-label="delete entry"
              >
                <Trash2 size={16} />
              </button>
            )}

            {/* <button
              onClick={onClose}
              className="p-2 rounded-2xl hover:bg-black/5 transition ml-1"
              style={{ color: ink }}
              aria-label="close modal"
            >
              <X size={19} />
            </button> */}
          </div>
        </div>

        {/* Modal Body / Editor Area */}
        <div className="px-6 md:px-8 py-5 flex-1 overflow-y-auto flex flex-col">
          {/* Title Field */}
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="title of your day... ✍️"
              className="w-full bg-transparent outline-none text-xl md:text-2xl font-bold tracking-tight mb-4 placeholder:text-black/30 lowercase"
              style={{ fontFamily: 'var(--font-display)', color: ink }}
            />
          ) : (
            <h2
              className="text-xl md:text-2xl font-bold tracking-tight mb-3"
              style={{ fontFamily: 'var(--font-display)', color: ink }}
            >
              {title || 'untitled reflection'}
            </h2>
          )}

          {/* Active Tags Mini-Row when Viewing */}
          {!editing && tagList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tagList.map((t) => (
                <span
                  key={t}
                  className="text-[11.5px] font-semibold px-2.5 py-1 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.06)', color: ink }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Content Editor / Viewer */}
          <div
            ref={bodyRef}
            contentEditable={editing}
            suppressContentEditableWarning
            className={`diary-content flex-1 text-[15px] leading-relaxed outline-none min-h-[220px] font-medium ${editing ? 'empty:before:content-[attr(data-placeholder)] empty:before:opacity-40' : ''
              }`}
            data-placeholder="pour your thoughts here... unfiltered, calm, and true. ✨"
            style={{ color: ink }}
          />
        </div>

        {/* Bottom Edit Action Toolbar (Only in Edit Mode) */}
        {editing && (
          <div
            className="px-6 py-3 border-t shrink-0 relative flex items-center justify-around bg-black/[0.02] rounded-b-3xl"
            style={{ borderColor: color ? 'rgba(0,0,0,0.08)' : 'var(--border-soft)' }}
          >
            {/* 1. Mood Button & Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => togglePopup('mood')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${activePopup === 'mood' ? 'bg-[var(--accent-soft)] scale-105' : 'hover:bg-black/5'
                  }`}
                style={{ color: ink }}
              >
                <span className="text-xl">{currentMoodMeta.emoji}</span>
                <span className="text-[11.5px] font-bold">mood</span>
              </button>

              {activePopup === 'mood' && (
                <div
                  className="absolute bottom-full mb-3 left-0 sm:left-2 w-[280px] sm:w-[310px] rounded-3xl p-3.5 shadow-2xl animate-cute-pop z-50"
                  style={{
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border-soft)',
                    boxShadow: 'var(--modal-shadow)',
                  }}
                >
                  <span className="text-[11.5px] font-bold text-[var(--ink-soft)] block mb-2 px-1">
                    how are you feeling? ✨
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Object.entries(MOOD_META).map(([key, m]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setMood(key);
                          setActivePopup(null);
                        }}
                        className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${mood === key
                          ? 'bg-[var(--accent-soft)] ring-2 ring-[var(--accent)] scale-105'
                          : 'hover:bg-[var(--surface-muted)]'
                          }`}
                        title={m.label}
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <span className="text-[10px] font-bold text-[var(--ink)]">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Color Button & Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => togglePopup('color')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${activePopup === 'color' ? 'bg-[var(--accent-soft)] scale-105' : 'hover:bg-black/5'
                  }`}
                style={{ color: ink }}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 shadow-xs"
                  style={{
                    background: color || 'var(--surface)',
                    borderColor: 'var(--accent)',
                  }}
                />
                <span className="text-[11.5px] font-bold">color</span>
              </button>

              {activePopup === 'color' && (
                <div
                  className="absolute bottom-full mb-3 left-0 sm:left-12 w-[280px] sm:w-[310px] rounded-3xl p-3.5 shadow-2xl animate-cute-pop z-50"
                  style={{
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border-soft)',
                    boxShadow: 'var(--modal-shadow)',
                  }}
                >
                  <span className="text-[11.5px] font-bold text-[var(--ink-soft)] block mb-2 px-1">
                    choose card tone
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {CARD_COLORS.map((c) => (
                      <button
                        key={c.hex || 'default'}
                        type="button"
                        onClick={() => {
                          setColor(c.hex);
                          setActivePopup(null);
                        }}
                        className="flex flex-col items-center gap-1 p-1.5 rounded-2xl transition hover:scale-105"
                        style={{
                          background: color === c.hex ? 'var(--accent-soft)' : 'transparent',
                        }}
                        title={c.name}
                      >
                        <span
                          className="w-7 h-7 rounded-full border border-black/10 shadow-xs block"
                          style={{
                            background: c.bg,
                            outline: color === c.hex ? '2.5px solid var(--accent)' : 'none',
                            outlineOffset: '2px',
                          }}
                        />
                        <span className="text-[9.5px] font-medium text-[var(--ink-soft)] truncate w-full text-center">
                          {c.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. List 3-Way Toggle Button */}
            <div className="relative">
              <button
                type="button"
                onClick={handleListCycle}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${listMode > 0 ? 'bg-[var(--accent-soft)] scale-105' : 'hover:bg-black/5'
                  }`}
                style={{ color: ink }}
                title={`list mode: ${listMode === 1 ? '1. numbered' : listMode === 2 ? '• bulleted' : 'normal text'
                  }`}
              >
                {listMode === 1 ? (
                  <ListOrdered size={20} style={{ color: 'var(--accent)' }} />
                ) : listMode === 2 ? (
                  <List size={20} style={{ color: 'var(--accent)' }} />
                ) : (
                  <AlignLeft size={20} />
                )}
                <span className="text-[11.5px] font-bold flex items-center gap-1">
                  list
                 {/*  {listMode === 1 && <span className="text-[9px] text-[var(--accent)]">(1.)</span>}
                  {listMode === 2 && <span className="text-[9px] text-[var(--accent)]">(•)</span>} */}
                </span>
              </button>
            </div>

            {/* 4. Tag Button & Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => togglePopup('tag')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${activePopup === 'tag' ? 'bg-[var(--accent-soft)] scale-105' : 'hover:bg-black/5'
                  }`}
                style={{ color: ink }}
              >
                <div className="relative">
                  <TagIcon size={20} />
                  {tagList.length > 0 && (
                    <span
                      className="absolute -top-1 -right-2 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                      style={{ background: 'var(--accent)' }}
                    >
                      {tagList.length}
                    </span>
                  )}
                </div>
                <span className="text-[11.5px] font-bold">tags</span>
              </button>

              {activePopup === 'tag' && (
                <div
                  className="absolute bottom-full mb-3 right-0 sm:right-2 w-[280px] sm:w-[320px] rounded-3xl p-4 shadow-2xl animate-cute-pop z-50"
                  style={{
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border-soft)',
                    boxShadow: 'var(--modal-shadow)',
                  }}
                >
                  <span className="text-[12px] font-bold text-[var(--ink)] block mb-2">
                    manage entry tags
                  </span>

                  {/* Attached tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
                    {tagList.length === 0 ? (
                      <span className="text-[11px] text-[var(--ink-faint)] italic">
                        no tags added yet
                      </span>
                    ) : (
                      tagList.map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1 text-[11.5px] font-bold px-2.5 py-1 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"
                        >
                          #{t}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="hover:opacity-75"
                            aria-label={`remove tag ${t}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Quick Select from existing tags */}
                  {allExistingTags.length > 0 && (
                    <div className="mb-3 pt-2 border-t border-[var(--border-soft)]">
                      <span className="text-[10.5px] font-bold text-[var(--ink-soft)] block mb-1.5">
                        quick pick existing:
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {allExistingTags.map((t) => {
                          const isAttached = tagList.includes(t.toLowerCase());
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleToggleTag(t)}
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg transition ${isAttached
                                ? 'bg-[var(--accent)] text-white'
                                : 'bg-[var(--surface-muted)] text-[var(--ink-soft)] hover:bg-[var(--accent-soft)]'
                                }`}
                            >
                              #{t}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Add new tag form */}
                  <form
                    onSubmit={handleAddTag}
                    className="pt-2 border-t border-[var(--border-soft)] flex items-center gap-2"
                  >
                    <input
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="create new tag..."
                      className="flex-1 bg-[var(--surface-muted)] px-3 py-1.5 rounded-xl text-[12px] font-medium outline-none text-[var(--ink)]"
                    />
                    <button
                      type="submit"
                      disabled={!newTagInput.trim()}
                      className="px-3 py-1.5 rounded-xl text-[12px] font-bold text-white bg-[var(--accent)] disabled:opacity-40 transition hover:scale-105"
                    >
                      add
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cute Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="delete this lovely entry? 🧸"
        message="this reflection will be erased forever. are you sure you want to let it go?"
        confirmText="delete forever"
        cancelText="keep entry"
        confirmVariant="danger"
        icon="trash"
        onConfirm={confirmDeleteAction}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
