import { ImagePlus, Loader2, Mic, Check, ListOrdered, List, AlignLeft, Tag as TagIcon, X } from 'lucide-react';
import { CARD_COLORS, MOOD_META } from '../../lib/color';
import MoodFace from '../MoodFace';
import EntryVoicePlayer from './EntryVoicePlayer';
import { formatDuration } from '../../hooks/useVoiceRecorder';

export default function EntryToolbar({
  ink, borderColor,
  activePopup, togglePopup, popupRef,
  mood, setMood, setActivePopup,
  color, setColor,
  photoUris, uploadingPhoto, fileInputRef, onPhotoUpload,
  voice,
  listMode, onListCycle,
  tagList, newTagInput, setNewTagInput, onAddTag, onToggleTag, onRemoveTag, allExistingTags,
}) {
  return (
    <div
      className="px-6 py-3 border-t shrink-0 relative flex items-center justify-around bg-black/[0.02] rounded-b-3xl"
      style={{ borderColor }}
    >
      {/* Mood */}
      <div className="relative" ref={activePopup === 'mood' ? popupRef : null}>
        <button
          type="button"
          onClick={() => togglePopup('mood')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${activePopup === 'mood' ? 'bg-[var(--accent-soft)] scale-105' : 'hover:bg-black/5'}`}
          style={{ color: ink }}
        >
          <MoodFace mood={mood} size={24} color={ink} active={true} />
          <span className="text-[11.5px] font-bold">mood</span>
        </button>

        {activePopup === 'mood' && (
          <div
            className="absolute bottom-full mb-3 left-0 sm:left-2 w-[280px] sm:w-[310px] rounded-3xl p-3.5 shadow-2xl animate-cute-pop z-50"
            style={{ background: 'var(--surface)', border: '1.5px solid var(--border-soft)', boxShadow: 'var(--modal-shadow)' }}
          >
            <span className="text-[11.5px] font-bold text-[var(--ink-soft)] block mb-2 px-1">how are you feeling?</span>
            <div className="grid grid-cols-5 gap-1.5">
              {Object.entries(MOOD_META).map(([key, m]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setMood(key); setActivePopup(null); }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${mood === key ? 'bg-[var(--accent-soft)] ring-2 ring-[var(--accent)] scale-105' : 'hover:bg-[var(--surface-muted)]'}`}
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
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onPhotoUpload} />
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
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all hover:bg-black/5 disabled:opacity-50"
          style={{ color: ink }}
          title="Add photo"
        >
          <div className="relative">
            {uploadingPhoto ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
            {photoUris.length > 0 && !uploadingPhoto && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: 'var(--accent)' }}>
                {photoUris.length}
              </span>
            )}
          </div>
          <span className="text-[11.5px] font-bold">photo</span>
        </button>
      </div>

      {/* Voice */}
      <div className="relative" ref={activePopup === 'voice' ? popupRef : null}>
        <button
          type="button"
          onClick={() => togglePopup('voice')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${activePopup === 'voice' ? 'bg-[var(--accent-soft)] scale-105' : 'hover:bg-black/5'}`}
          style={{ color: ink }}
        >
          <div className="relative">
            {voice.isRecording ? (
              <span className="block w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            ) : (
              <Mic size={20} />
            )}
            {voice.voiceUri && !voice.isRecording && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <Check size={10} strokeWidth={3} className="text-white" />
              </span>
            )}
          </div>
          <span className="text-[11.5px] font-bold">voice</span>
        </button>

        {activePopup === 'voice' && (
          <div
            className="absolute bottom-full mb-3 left-0 sm:left-2 w-[260px] rounded-3xl p-4 shadow-2xl animate-cute-pop z-50"
            style={{ background: 'var(--surface)', border: '1.5px solid var(--border-soft)', boxShadow: 'var(--modal-shadow)' }}
          >
            {voice.uploadingVoice && (
              <div className="flex items-center gap-2 mb-2 text-[12px]" style={{ color: 'var(--ink-soft)' }}>
                <Loader2 size={13} className="animate-spin" /> uploading voice...
              </div>
            )}

            {!voice.isRecording && !voice.voiceUri && !voice.uploadingVoice && (
              <button
                type="button"
                onClick={voice.startRecording}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-[13px]"
                style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
              >
                <Mic size={16} /> start recording
              </button>
            )}

            {voice.isRecording && (
              <button
                type="button"
                onClick={voice.stopRecording}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-[13px] text-white"
                style={{ background: '#ef4444' }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                {formatDuration(voice.recordingSeconds)} / 10:00
              </button>
            )}

            {voice.voiceUri && !voice.isRecording && !voice.uploadingVoice && (
              <EntryVoicePlayer
                voiceUri={voice.voiceUri}
                audioElRef={voice.audioElRef}
                isPlaying={voice.isPlaying}
                setIsPlaying={voice.setIsPlaying}
                onToggle={voice.toggleVoicePlayback}
                onRemove={voice.removeVoice}
                ink="var(--ink)"
              />
            )}
          </div>
        )}
      </div>

      {/* Color */}
      <div className="relative" ref={activePopup === 'color' ? popupRef : null}>
        <button
          type="button"
          onClick={() => togglePopup('color')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${activePopup === 'color' ? 'bg-[var(--accent-soft)] scale-105' : 'hover:bg-black/5'}`}
          style={{ color: ink }}
        >
          <div className="w-5 h-5 rounded-full border-2 shadow-xs" style={{ background: color || 'var(--surface)', borderColor: 'var(--accent)' }} />
          <span className="text-[11.5px] font-bold">color</span>
        </button>

        {activePopup === 'color' && (
          <div
            className="absolute bottom-full mb-3 left-0 sm:left-12 w-[280px] sm:w-[310px] rounded-3xl p-3.5 shadow-2xl animate-cute-pop z-50"
            style={{ background: 'var(--surface)', border: '1.5px solid var(--border-soft)', boxShadow: 'var(--modal-shadow)' }}
          >
            <span className="text-[11.5px] font-bold text-[var(--ink-soft)] block mb-2 px-1">choose card tone</span>
            <div className="grid grid-cols-4 gap-2">
              {CARD_COLORS.map((c) => (
                <button
                  key={c.hex || 'default'}
                  type="button"
                  onClick={() => { setColor(c.hex); setActivePopup(null); }}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-2xl transition hover:scale-105"
                  title={c.name}
                >
                  <span
                    className="w-7 h-7 rounded-full border border-black/10 shadow-xs block"
                    style={{ background: c.bg, outline: color === c.hex ? '2.5px solid var(--accent)' : 'none', outlineOffset: '2px' }}
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
          onClick={onListCycle}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${listMode > 0 ? 'bg-[var(--accent-soft)] scale-105' : 'hover:bg-black/5'}`}
          style={{ color: ink }}
          title={`list mode: ${listMode === 1 ? 'numbered' : listMode === 2 ? 'bulleted' : 'normal text'}`}
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
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${activePopup === 'tag' ? 'bg-[var(--accent-soft)] scale-105' : 'hover:bg-black/5'}`}
          style={{ color: ink }}
        >
          <div className="relative">
            <TagIcon size={20} />
            {tagList.length > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: 'var(--accent)' }}>
                {tagList.length}
              </span>
            )}
          </div>
          <span className="text-[11.5px] font-bold">tags</span>
        </button>

        {activePopup === 'tag' && (
          <div
            className="absolute bottom-full mb-3 right-0 sm:right-2 w-[280px] sm:w-[320px] rounded-3xl p-4 shadow-2xl animate-cute-pop z-50"
            style={{ background: 'var(--surface)', border: '1.5px solid var(--border-soft)', boxShadow: 'var(--modal-shadow)' }}
          >
            <span className="text-[12px] font-bold text-[var(--ink)] block mb-2">manage entry tags</span>

            <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
              {tagList.length === 0 ? (
                <span className="text-[11px] text-[var(--ink-faint)] italic">no tags added yet</span>
              ) : (
                tagList.map((t) => (
                  <span key={t} className="flex items-center gap-1 text-[11.5px] font-bold px-2.5 py-1 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    #{t}
                    <button type="button" onClick={() => onRemoveTag(t)} className="hover:opacity-75" aria-label={`remove tag ${t}`}>
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>

            {allExistingTags.length > 0 && (
              <div className="mb-3 pt-2 border-t border-[var(--border-soft)]">
                <span className="text-[10.5px] font-bold text-[var(--ink-soft)] block mb-1.5">quick pick existing:</span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {allExistingTags.map((t) => {
                    const isAttached = tagList.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onToggleTag(t)}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg transition ${isAttached ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-muted)] text-[var(--ink-soft)] hover:bg-[var(--accent-soft)]'}`}
                      >
                        #{t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={onAddTag} className="pt-2 border-t border-[var(--border-soft)] flex items-center gap-2">
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
  );
}