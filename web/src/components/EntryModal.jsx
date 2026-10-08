import { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { CARD_COLORS, MOOD_META, getReadableText, formatDiaryDate, normalizeDateKey } from '../lib/color';
import ConfirmModal from './ConfirmModal';
import PromptBar from './PromptBar';
import { uploadFile } from '../api/uploads';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useMoodSuggestion } from '../hooks/useMoodSuggestion';
import { useEntryInsight } from '../hooks/useEntryInsight';
import EntryHeader from './entry-modal/EntryHeader';
import EntryPhotoGallery from './entry-modal/EntryPhotoGallery';
import EntryVoicePlayer from './entry-modal/EntryVoicePlayer';
import EntryToolbar from './entry-modal/EntryToolbar';
import InsightFab from './entry-modal/InsightFab';

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
  const [plainContent, setPlainContent] = useState('');

  const [photoUris, setPhotoUris] = useState(() => {
    if (!entry?.photo_path) return [];
    return Array.isArray(entry.photo_path) ? entry.photo_path : [entry.photo_path];
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const voice = useVoiceRecorder(entry?.voice_path || null);
  const { suggestedMood, dismiss: dismissSuggestedMood } = useMoodSuggestion(plainContent, mood);
  const insight = useEntryInsight(entry?.id);

  const bodyRef = useRef(null);
  const dateInputRef = useRef(null);
  const popupRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.innerHTML = entry?.content || '';
      setPlainContent(bodyRef.current.innerText || '');
    }
  }, [entry?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setActivePopup(null);
    };
    if (activePopup) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePopup]);

  const togglePopup = (name) => setActivePopup((prev) => (prev === name ? null : name));

  const acceptSuggestedMood = () => {
    if (suggestedMood) setMood(suggestedMood);
    dismissSuggestedMood();
  };

  const handleListCycle = () => {
    bodyRef.current?.focus();
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
    if (clean && !tagList.includes(clean)) setTagList([...tagList, clean]);
    setNewTagInput('');
  };

  const handleToggleTag = (t) => {
    setTagList(tagList.includes(t) ? tagList.filter((x) => x !== t) : [...tagList, t]);
  };

  const handleRemoveTag = (t) => setTagList(tagList.filter((x) => x !== t));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      if (url) setPhotoUris((prev) => [...prev, url]);
    } catch (err) {
      alert(err.message || 'Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index) => setPhotoUris((prev) => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    const rawContent = bodyRef.current?.innerHTML || '';
    const textOnly = bodyRef.current?.innerText?.trim() || '';
    const cleanTitle = title.trim();

    // Block saving ONLY if every single field is completely empty
    const isEmpty =
      !cleanTitle &&
      !textOnly &&
      photoUris.length === 0 &&
      !voice.voiceUri;

    if (isEmpty) return;

    onSave({
      ...entry,
      title: cleanTitle || null,
      content: rawContent || '',
      entry_date: date,
      mood,
      bg_color: color || '#FFFFFF',
      color: color || '',
      tags: tagList,
      photo_path: photoUris.length > 0 ? photoUris : null,
      voice_path: voice.voiceUri || null,
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
    } else if (bodyRef.current) {
      bodyRef.current.innerHTML = `<p>${promptText}</p><br>` + bodyRef.current.innerHTML;
    }
  };

  const ink = color ? getReadableText(color) : 'var(--ink)';
  const readableDate = formatDiaryDate(date);
  const borderColor = color ? 'rgba(0,0,0,0.08)' : 'var(--border-soft)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 lowercase"
      style={{ background: 'rgba(35, 25, 20, 0.65)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-4xl min-h-[560px] max-h-[88vh] rounded-3xl flex flex-col relative shadow-2xl animate-cute-pop transition-colors duration-200"
        style={{ background: color || 'var(--surface)', border: color ? '1.5px solid rgba(0,0,0,0.08)' : '1.5px solid var(--border-soft)', boxShadow: 'var(--modal-shadow)' }}
      >
        <EntryHeader
          editing={editing}
          onStartEdit={() => setEditing(true)}
          onSave={handleSave}
          onRequestDelete={() => setShowDeleteConfirm(true)}
          isNew={isNew}
          entry={entry}
          readableDate={readableDate}
          dateInputRef={dateInputRef}
          date={date}
          onDateChange={setDate}
          ink={ink}
          borderColor={borderColor}
        />

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
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3" style={{ fontFamily: 'var(--font-display)', color: ink }}>
              {title || ''}
            </h2>
          )}

          {!editing && tagList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tagList.map((t) => (
                <span key={t} className="text-[11.5px] font-semibold px-2.5 py-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.06)', color: ink }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          <EntryPhotoGallery photoUris={photoUris} editing={editing} onRemove={removePhoto} />

          {!editing && (
            <EntryVoicePlayer
              voiceUri={voice.voiceUri}
              audioElRef={voice.audioElRef}
              isPlaying={voice.isPlaying}
              setIsPlaying={voice.setIsPlaying}
              onToggle={voice.toggleVoicePlayback}
              ink={ink}
            />
          )}

          <div
            ref={bodyRef}
            contentEditable={editing}
            suppressContentEditableWarning
            className={`diary-content flex-1 text-[15px] leading-relaxed outline-none min-h-[220px] font-medium ${editing ? 'empty:before:content-[attr(data-placeholder)] empty:before:opacity-40' : ''}`}
            data-placeholder="pour your thoughts here... unfiltered, calm, and true."
            style={{ color: ink }}
            onInput={(e) => setPlainContent(e.currentTarget.innerText)}
          />

          {editing && suggestedMood && (
            <div className="flex items-center gap-2 mt-3 px-3.5 py-2.5 rounded-2xl animate-cute-pop" style={{ background: 'var(--accent-soft, rgba(108,140,255,0.12))' }}>
              <Sparkles size={14} style={{ color: 'var(--accent)' }} strokeWidth={2.4} />
              <span className="text-[12.5px] font-medium flex-1 lowercase" style={{ color: ink }}>
                sounds like you're feeling <strong className="font-bold">{MOOD_META[suggestedMood].label}</strong>.
              </span>
              <button type="button" onClick={acceptSuggestedMood} className="text-[12px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
                use it as mood
              </button>
              <button type="button" onClick={dismissSuggestedMood} className="p-1 rounded-full hover:bg-black/5" aria-label="dismiss mood suggestion">
                <X size={13} style={{ color: ink, opacity: 0.6 }} />
              </button>
            </div>
          )}
        </div>

        {editing && (
          <EntryToolbar
            ink={ink}
            borderColor={borderColor}
            activePopup={activePopup}
            togglePopup={togglePopup}
            popupRef={popupRef}
            mood={mood}
            setMood={setMood}
            setActivePopup={setActivePopup}
            color={color}
            setColor={setColor}
            photoUris={photoUris}
            uploadingPhoto={uploadingPhoto}
            fileInputRef={fileInputRef}
            onPhotoUpload={handlePhotoUpload}
            voice={voice}
            listMode={listMode}
            onListCycle={handleListCycle}
            tagList={tagList}
            newTagInput={newTagInput}
            setNewTagInput={setNewTagInput}
            onAddTag={handleAddTag}
            onToggleTag={handleToggleTag}
            onRemoveTag={handleRemoveTag}
            allExistingTags={allExistingTags}
          />
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

      <InsightFab isNew={isNew} insight={insight} />
    </div>
  );
}