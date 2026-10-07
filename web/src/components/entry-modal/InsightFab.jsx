import { Sparkles, Bot, X, Loader2 } from 'lucide-react';

export default function InsightFab({ isNew, insight }) {
  if (isNew) return null;
  const { open, setOpen, text, loading, error, panelRef, openPanel, retry } = insight;

  return (
    <div ref={panelRef} style={{ position: 'fixed', bottom: '2.5rem', right: '2.5rem', zIndex: 60 }}>
      {open && (
        <div
          className="animate-cute-pop"
          style={{
            position: 'absolute', bottom: 'calc(100% + 12px)', right: 0, width: 290,
            background: 'var(--surface)', border: '1.5px solid var(--border-soft)',
            borderRadius: 20, borderBottomRightRadius: 4, boxShadow: 'var(--modal-shadow)', overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border-soft)', background: 'var(--surface-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={14} color="white" strokeWidth={2.4} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.02em' }}>
                journal insights
              </span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="close insights" style={{ width: 24, height: 24, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)' }}>
              <X size={14} strokeWidth={2.4} />
            </button>
          </div>

          <div style={{ padding: '14px', minHeight: 56, display: 'flex', alignItems: 'flex-start' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--ink-faint)', fontStyle: 'italic' }}>reading your entry...</span>
              </div>
            ) : error ? (
              <div>
                <p style={{ fontSize: 13, color: '#e57373', lineHeight: 1.5, margin: 0 }}>couldn't summarize this entry.</p>
                <button onClick={retry} style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: 'var(--accent)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                  try again ↺
                </button>
              </div>
            ) : text ? (
              <p style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.65, margin: 0, maxHeight: 200, overflowY: 'auto' }}>
                {text}
              </p>
            ) : null}
          </div>
        </div>
      )}

      <button
        onClick={open ? () => setOpen(false) : openPanel}
        title="journal insights"
        aria-label="journal insights"
        style={{
          width: 48, height: 48, borderRadius: '50%',
          background: open ? 'var(--accent)' : 'var(--surface)',
          border: '1.5px solid var(--border-soft)', boxShadow: 'var(--modal-shadow)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.18s, transform 0.15s', color: open ? 'white' : 'var(--accent)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <Sparkles size={20} strokeWidth={2.2} />
      </button>
    </div>
  );
}