import { Play, Pause, Trash2 } from 'lucide-react';

// Shared between the view-mode body (no onRemove — read-only) and the edit
// toolbar's voice popup (onRemove passed — can delete). Owns the <audio>
// element itself since only one of those two ever renders at a time.
export default function EntryVoicePlayer({ voiceUri, audioElRef, isPlaying, setIsPlaying, onToggle, onRemove, ink }) {
  if (!voiceUri) return null;

  return (
    <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-2xl" style={{ background: 'rgba(0,0,0,0.04)', color: ink }}>
      <audio
        ref={audioElRef}
        src={voiceUri}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <button
        type="button"
        onClick={onToggle}
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'var(--accent)' }}
      >
        {isPlaying ? (
          <Pause size={15} fill="white" stroke="none" />
        ) : (
          <Play size={15} fill="white" stroke="none" className="ml-0.5" />
        )}
      </button>
      <span className="text-[13px] font-semibold flex-1">voice note</span>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label="delete voice recording">
          <Trash2 size={15} style={{ color: '#ef4444' }} />
        </button>
      )}
    </div>
  );
}