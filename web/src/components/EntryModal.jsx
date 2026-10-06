import { useEffect, useRef, useState } from 'react';
import {
  Pencil,
  Trash2,
  Check,
  X,
  List,
  Tag as TagIcon,
  Calendar,
  ListOrdered,
  AlignLeft,
  ImagePlus,
  Loader2,
  Sparkles,
  Bot
} from 'lucide-react';
import { CARD_COLORS, MOOD_META, getReadableText, formatDiaryDate, formatTime, normalizeDateKey } from '../lib/color';
import ConfirmModal from './ConfirmModal';
import PromptBar from './PromptBar';
import MoodFace from './MoodFace';
import { uploadFile } from '../api/uploads';
import { generateEntrySummary } from '../api/groq';
import { analyzeMood } from '../lib/moodAnalyzer';

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
  const [activePopup, setActivePopup] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [listMode, setListMode] = useState(0);
  const [newTagInput, setNewTagInput] = useState('');
  
  const [photoUris, setPhotoUris] = useState(() => {
    if (!entry?.photo_path) return [];
    if (Array.isArray(entry.photo_path)) return entry.photo_path;
    return [entry.photo_path];
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // AI insight panel state
  const [insightOpen, setInsightOpen] = useState(false);
  const [insightText, setInsightText] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState(false);

  const bodyRef = useRef(null);
  const dateInputRef = useRef(null);
  const popupRef = useRef(null);
  const fileInputRef = useRef(null);
  const insightPanelRef = useRef(null);

    useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.innerHTML = entry?.content || '';
      setPlainContent(bodyRef.current.innerText || '');
    }
  }, [entry?.id]);

  // On-device mood suggestion — no network call. Waits for a typing pause,
  // scores the plain text locally, and offers a pill near the toolbar if
  // it disagrees with whatever mood is currently selected.
  const [plainContent, setPlainContent] = useState('');
  const [suggestedMood, setSuggestedMood] = useState(null);
  const moodDebounceRef = useRef(null);

  useEffect(() => {
    if (moodDebounceRef.current) clearTimeout(moodDebounceRef.current);
    moodDebounceRef.current = setTimeout(() => {
      const result = analyzeMood(plainContent);
      if (result && result.mood && result.confidence >= 0.3 && result.mood !== mood) {
        setSuggestedMood(result.mood);
      } else {
        setSuggestedMood(null);
      }
    }, 700);
    return () => clearTimeout(moodDebounceRef.current);
  }, [plainContent, mood]);

  const acceptSuggestedMood = () => {
    if (suggestedMood) setMood(suggestedMood);
    setSuggestedMood(null);
  };

  const dismissSuggestedMood = () => setSuggestedMood(null);

  // Close insight panel when clicking outside it
  useEffect(() => {
    if (!insightOpen) return;
    const handleOutside = (e) => {
      if (insightPanelRef.current && !insightPanelRef.current.contains(e.target)) {
        setInsightOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [insightOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setActivePopup(null);
      }
    };

    if (activePopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePopup]);

  const togglePopup = (name) => {
    setActivePopup((prev) => (prev === name ? null : name));
  };

  const handleListCycle = () => {
    if (bodyRef.current) {
      bodyRef.current.focus();
    }
    if (listMode === 0) {
      document.execCommand('insertOrderedList', false, null);
      setListMode(1);
    } else if (listMode === 1) {
      document.execCommand('insertOrderedList', false, null);
      document.execCommand('insertUnorderedList', false, null);
      setListMode(2);
    } else {
      document.execCommand('insertUnorderedList', false, null);
      setListMode(0);
    }
  };

  const handleAddTag = (e) => {
    if (e) e.preventDefault();
    const clean = newTagInput.trim();
    if (clean && !tagList.includes(clean)) {
      setTagList([...tagList, clean]);
    }
    setNewTagInput('');
  };

  const handleToggleTag = (t) => {
    const clean = t;
    if (tagList.includes(clean)) {
      setTagList(tagList.filter((x) => x !== clean));
    } else {
      setTagList([...tagList, clean]);
    }
  };

  const handleRemoveTag = (t) => {
    setTagList(tagList.filter((x) => x !== t));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Strictly accept pictures and no other file formats
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid picture format (e.g. JPG, PNG).');
      e.target.value = '';
      return;
    }
    
    if (photoUris.length >= 5) {
      alert('You can attach up to 5 photos per entry.');
      return;
    }
    setUploadingPhoto(true);
    try {
      const url = await uploadFile(file, 'photo');
      if (url) {
        setPhotoUris(prev => [...prev, url]);
      }
    } catch (err) {
      alert(err.message || 'Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index) => {
    setPhotoUris(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const rawContent = bodyRef.current?.innerHTML || '';
    const textOnly = bodyRef.current?.innerText?.trim() || '';
    if (!textOnly && !title.trim() && photoUris.length === 0) return;

    onSave({
      ...entry,
      title: title.trim() || null,
      content: rawContent,
      entry_date: date,
      mood,
      bg_color: color || '#FFFFFF',
      color: color || '',
      tags: tagList,
      photo_path: photoUris.length > 0 ? photoUris : null,
    });
    setEditing(false);
  };

  const confirmDeleteAction = () => {
    setShowDeleteConfirm(false);
    onDelete(entry.id);
  };

  const handleUsePrompt = (promptText) => {
    if (!title.trim()) {
      setTitle(promptText.length > 100 ? promptText.slice(0, 100) : promptText);
    } else {
      if (bodyRef.current) {
        bodyRef.current.innerHTML = `<p>${promptText}</p><br>` + bodyRef.current.innerHTML;
      }
    }
  };

  const runInsight = async () => {
    if (!entry?.id) return;
    setInsightLoading(true);
    setInsightError(false);
    const text = await generateEntrySummary(entry.id);
    setInsightLoading(false);
    if (text) {
      setInsightText(text);
    } else {
      setInsightText(null);
      setInsightError(true);
    }
  };

  const openInsightPanel = () => {
    setInsightOpen(true);
    if (!insightText && !insightLoading) runInsight();
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
      <div
        className="w-full max-w-4xl min-h-[560px] max-h-[88vh] rounded-3xl flex flex-col relative shadow-2xl animate-cute-pop transition-colors duration-200"
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

          <div className="flex items-center gap-2">
            {editing ? (
              <button
                onClick={handleSave}
                className="text-[13px] font-bold transition-transform hover:scale-105 p-1"
                style={{ color: 'var(--accent)' }}
                aria-label="save entry"
              >
                <Check size={20} strokeWidth={2.5} />
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
          </div>
        </div>

        {/* Modal Body / Editor Area */}
        <div className="px-6 md:px-8 py-5 flex-1 overflow-y-auto flex flex-col">
          {editing && <PromptBar onUsePrompt={handleUsePrompt} />}

          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="title of your day..."
              className="w-full bg-transparent outline-none text-xl md:text-2xl font-bold tracking-tight mb-4 placeholder:text-black/30"
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
          
          {photoUris.length > 0 && (
            editing ? (
              <div className="flex flex-wrap gap-3 mb-4">
                {photoUris.map((uri, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden shadow-sm border" style={{ borderColor: 'var(--border-soft)' }}>
                    <img src={uri} alt={`photo ${idx + 1}`} className="w-24 h-24 object-cover" />
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
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
            )
          )}

          <div
            ref={bodyRef}
            contentEditable={editing}
            suppressContentEditableWarning
            className={`diary-content flex-1 text-[15px] leading-relaxed outline-none min-h-[220px] font-medium ${editing ? 'empty:before:content-[attr(data-placeholder)] empty:before:opacity-40' : ''
              }`}
                        data-placeholder="pour your thoughts here... unfiltered, calm, and true."
            style={{ color: ink }}
            onInput={(e) => setPlainContent(e.currentTarget.innerText)}
          />

          {editing && suggestedMood && (
            <div
              className="flex items-center gap-2 mt-3 px-3.5 py-2.5 rounded-2xl animate-cute-pop"
              style={{ background: 'var(--accent-soft, rgba(108,140,255,0.12))' }}
            >
              <Sparkles size={14} style={{ color: 'var(--accent)' }} strokeWidth={2.4} />
              <span className="text-[12.5px] font-medium flex-1 lowercase" style={{ color: ink }}>
                sounds like you're feeling {MOOD_META[suggestedMood].label}. use it?
              </span>
              <button
                type="button"
                onClick={acceptSuggestedMood}
                className="text-[12px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
              >
                use
              </button>
              <button
                type="button"
                onClick={dismissSuggestedMood}
                className="p-1 rounded-full hover:bg-black/5"
                aria-label="dismiss mood suggestion"
              >
                <X size={13} style={{ color: ink, opacity: 0.6 }} />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Edit Action Toolbar */}
        {editing && (
          <div
            className="px-6 py-3 border-t shrink-0 relative flex items-center justify-around bg-black/[0.02] rounded-b-3xl"
            style={{ borderColor: color ? 'rgba(0,0,0,0.08)' : 'var(--border-soft)' }}
          >
            {/* Mood */}
            <div className="relative" ref={activePopup === 'mood' ? popupRef : null}>
              <button
                type="button"
                onClick={() => togglePopup('mood')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${activePopup === 'mood' ? 'bg-[var(--accent-soft)] scale-105' : 'hover:bg-black/5'
                  }`}
                style={{ color: ink }}
              >
                <MoodFace mood={mood} size={24} color={ink} active={true} />
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
                    how are you feeling?
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
                        <MoodFace mood={key} size={28} color="var(--ink)" active={mood === key} />
                        <span className="text-[10px] font-bold text-[var(--ink)]">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Photos */}
            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handlePhotoUpload}
              />
              <button
                type="button"
                onClick={() => {
                  if (photoUris.length >= 5) {
                    alert('Limit reached: 5 photos maximum.');
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                disabled={uploadingPhoto}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all hover:bg-black/5 disabled:opacity-50`}
                style={{ color: ink }}
                title="Add photo"
              >
                <div className="relative">
                  {uploadingPhoto ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
                  {photoUris.length > 0 && !uploadingPhoto && (
                    <span
                      className="absolute -top-1 -right-2 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                      style={{ background: 'var(--accent)' }}
                    >
                      {photoUris.length}
                    </span>
                  )}
                </div>
                <span className="text-[11.5px] font-bold">photo</span>
              </button>
            </div>

            {/* Color */}
            <div className="relative" ref={activePopup === 'color' ? popupRef : null}>
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
                          background: 'transparent',
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

            {/* List */}
            <div className="relative">
              <button
                type="button"
                onClick={handleListCycle}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${listMode > 0 ? 'bg-[var(--accent-soft)] scale-105' : 'hover:bg-black/5'
                  }`}
                style={{ color: ink }}
                title={`list mode: ${listMode === 1 ? 'numbered' : listMode === 2 ? 'bulleted' : 'normal text'
                  }`}
              >
                {listMode === 1 ? (
                  <ListOrdered size={20} style={{ color: 'var(--accent)' }} />
                ) : listMode === 2 ? (
                  <List size={20} style={{ color: 'var(--accent)' }} />
                ) : (
                  <AlignLeft size={20} />
                )}
                <span className="text-[11.5px] font-bold">list</span>
              </button>
            </div>

            {/* Tags */}
            <div className="relative" ref={activePopup === 'tag' ? popupRef : null}>
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

                  {allExistingTags.length > 0 && (
                    <div className="mb-3 pt-2 border-t border-[var(--border-soft)]">
                      <span className="text-[10.5px] font-bold text-[var(--ink-soft)] block mb-1.5">
                        quick pick existing:
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {allExistingTags.map((t) => {
                          const isAttached = tagList.includes(t);
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

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="delete this entry?"
        message="this reflection will be erased forever. are you sure you want to let it go?"
        confirmText="delete forever"
        cancelText="keep entry"
        confirmVariant="danger"
        icon="trash"
        onConfirm={confirmDeleteAction}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* AI Insight FAB — only for saved entries */}
      {!isNew && (
        <div
          ref={insightPanelRef}
          style={{ position: 'fixed', bottom: '2.5rem', right: '2.5rem', zIndex: 60 }}
        >
          {/* Floating insights panel */}
          {insightOpen && (
            <div
              className="animate-cute-pop"
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 12px)',
                right: 0,
                width: 290,
                background: 'var(--surface)',
                border: '1.5px solid var(--border-soft)',
                borderRadius: 20,
                borderBottomRightRadius: 4,
                boxShadow: 'var(--modal-shadow)',
                overflow: 'hidden',
              }}
            >
              {/* Panel header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--border-soft)',
                  background: 'var(--surface-muted)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={14} color="white" strokeWidth={2.4} />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--ink)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    journal insights
                  </span>
                </div>
                <button
                  onClick={() => setInsightOpen(false)}
                  aria-label="close insights"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ink-soft)',
                  }}
                >
                  <X size={14} strokeWidth={2.4} />
                </button>
              </div>

              {/* Panel body */}
              <div style={{ padding: '14px', minHeight: 56, display: 'flex', alignItems: 'flex-start' }}>
                {insightLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Loader2
                      size={16}
                      className="animate-spin"
                      style={{ color: 'var(--accent)', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 13, color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                      reading your entry...
                    </span>
                  </div>
                ) : insightError ? (
                  <div>
                    <p style={{ fontSize: 13, color: '#e57373', lineHeight: 1.5, margin: 0 }}>
                      couldn't summarize this entry.
                    </p>
                    <button
                      onClick={runInsight}
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--accent)',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                      }}
                    >
                      try again ↺
                    </button>
                  </div>
                ) : insightText ? (
                  <p
                    style={{
                      fontSize: 13.5,
                      color: 'var(--ink)',
                      lineHeight: 1.65,
                      margin: 0,
                      maxHeight: 200,
                      overflowY: 'auto',
                    }}
                  >
                    {insightText}
                  </p>
                ) : null}
              </div>
            </div>
          )}

          {/* FAB button */}
          <button
            onClick={insightOpen ? () => setInsightOpen(false) : openInsightPanel}
            title="journal insights"
            aria-label="journal insights"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: insightOpen ? 'var(--accent)' : 'var(--surface)',
              border: '1.5px solid var(--border-soft)',
              boxShadow: 'var(--modal-shadow)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.18s, transform 0.15s',
              color: insightOpen ? 'white' : 'var(--accent)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Sparkles size={20} strokeWidth={2.2} />
          </button>
        </div>
      )}
    </div>
  );
}