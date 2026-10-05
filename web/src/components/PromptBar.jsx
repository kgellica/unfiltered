import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Shuffle, Plus, X, NotebookPen, Sparkles, Trash2, PenLine } from 'lucide-react';
import { generateJournalPrompt } from '../api/groq';

const MY_PROMPTS_KEY = 'unfiltered.myPrompts.v1';
const MAX_MY_PROMPTS = 50;
const MAX_PROMPT_LENGTH = 200;

const PRESET_PROMPTS = [
  'Write about the beautiful moments of this week.',
  'What made you smile today, even briefly?',
  'Describe a small win you had recently.',
  'What is something you are looking forward to?',
  'Write a letter to yourself a year from now.',
  'What is weighing on your mind right now?',
  'Name three things you are grateful for today.',
  'What would make today feel like a good day?',
];

export default function PromptBar({ onUsePrompt }) {
  const [visible, setVisible] = useState(true);
  const [prompt, setPrompt] = useState(
    () => PRESET_PROMPTS[Math.floor(Math.random() * PRESET_PROMPTS.length)]
  );
  const [isAi, setIsAi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const [myPrompts, setMyPrompts] = useState([]);
  const [composerVisible, setComposerVisible] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(MY_PROMPTS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMyPrompts(parsed);
      } catch (e) {}
    }
  }, []);

  const persistMyPrompts = useCallback((next) => {
    setMyPrompts(next);
    localStorage.setItem(MY_PROMPTS_KEY, JSON.stringify(next));
  }, []);

  const openComposer = () => {
    setDraft('');
    setComposerVisible(true);
  };

  const saveDraftPrompt = () => {
    const text = draft.trim();
    if (!text) return;
    if (myPrompts.includes(text)) {
      alert('That prompt is already in My Prompts.');
      return;
    }
    const next = [text, ...myPrompts].slice(0, MAX_MY_PROMPTS);
    persistMyPrompts(next);
    setDraft('');
    setComposerVisible(false);
    setPrompt(text);
    setIsAi(false);
    setVisible(true);
  };

  const deleteMyPrompt = (text) => {
    if (window.confirm('Delete this prompt?')) {
      persistMyPrompts(myPrompts.filter((p) => p !== text));
    }
  };

  const newPrompt = async () => {
    setLoading(true);
    const generated = await generateJournalPrompt();
    setLoading(false);
    if (generated) {
      setPrompt(generated);
      setIsAi(true);
      setHistory((prev) => [generated, ...prev].slice(0, 20));
      return;
    }
    const pool = PRESET_PROMPTS.filter((p) => p !== prompt);
    setPrompt(pool[Math.floor(Math.random() * pool.length)] || PRESET_PROMPTS[0]);
    setIsAi(false);
  };

  const allPrompts = useMemo(() => {
    const seen = new Set();
    return [prompt, ...myPrompts, ...history, ...PRESET_PROMPTS].filter((p) => {
      if (seen.has(p)) return false;
      seen.add(p);
      return true;
    });
  }, [prompt, myPrompts, history]);

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/5 bg-black/5 hover:bg-black/10 transition-colors mb-4 w-fit text-[12px] font-bold text-[var(--accent)]"
      >
        <Plus size={14} strokeWidth={2.4} />
        <span>Add Prompt</span>
      </button>
    );
  }

  return (
    <div className="bg-[var(--surface-muted)] rounded-xl border border-[var(--border-soft)] p-3.5 mb-4 shadow-sm relative">
      <div className="flex items-start justify-between gap-2 pr-6">
        <div>
          {isAi && (
            <div className="inline-flex items-center gap-1 bg-[var(--accent-soft)] rounded-full px-1.5 py-0.5 mb-1.5">
              <Sparkles size={10} color="var(--accent)" strokeWidth={2.6} />
              <span className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-wider">AI</span>
            </div>
          )}
          <p className="text-[14px] font-bold text-[var(--ink)] leading-snug">
            {prompt}
          </p>
        </div>
      </div>
      
      <button
        onClick={() => setVisible(false)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/5 text-[var(--ink-soft)] transition-colors"
        title="Dismiss prompt"
      >
        <X size={14} strokeWidth={2.5} />
      </button>

      <div className="flex items-center gap-2.5 mt-3">
        <button
          onClick={newPrompt}
          disabled={loading}
          className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border-soft)] rounded-full px-3 py-1.5 text-[11px] font-bold text-[var(--ink)] hover:bg-black/5 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-[var(--ink)]"></span>
          ) : (
            <>
              <Shuffle size={12} strokeWidth={2.5} />
              <span>New Prompt</span>
            </>
          )}
        </button>

        <button
          onClick={() => onUsePrompt && onUsePrompt(prompt)}
          className="p-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-soft)] hover:bg-black/5 text-[var(--ink)] transition-colors"
          title="Use this prompt as your entry title"
        >
          <NotebookPen size={14} strokeWidth={2.5} />
        </button>

        <button
          onClick={openComposer}
          className="p-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-soft)] hover:bg-black/5 text-[var(--ink)] transition-colors"
          title="Create your own prompt"
        >
          <PenLine size={14} strokeWidth={2.5} />
        </button>

        <button
          onClick={() => setShowAll(true)}
          className="ml-auto text-[11px] font-bold text-[var(--accent)] hover:underline"
        >
          Show All
        </button>
      </div>

      {showAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowAll(false)}>
          <div className="bg-[var(--surface)] rounded-2xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden shadow-xl border border-[var(--border-soft)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-soft)] shrink-0">
              <h3 className="text-[15px] font-bold text-[var(--ink)]">Writing Prompts</h3>
              <button
                onClick={() => {
                  setShowAll(false);
                  openComposer();
                }}
                className="flex items-center gap-1 bg-[var(--accent-soft)] text-[var(--accent)] px-2.5 py-1 rounded-full text-[11px] font-bold hover:bg-[var(--accent)] hover:text-white transition-colors"
              >
                <Plus size={12} strokeWidth={2.5} />
                <span>New</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {myPrompts.length > 0 && (
                <>
                  <div className="text-[10px] font-bold text-[var(--ink-soft)] uppercase tracking-wider px-3 mt-2 mb-1">My Prompts</div>
                  {myPrompts.map((p, i) => (
                    <div key={`mine-${i}`} className="flex items-center gap-1 p-1 hover:bg-[var(--surface-muted)] rounded-xl group">
                      <button
                        onClick={() => {
                          setPrompt(p);
                          setIsAi(false);
                          setShowAll(false);
                        }}
                        className="flex-1 text-left px-3 py-2 text-[13px] text-[var(--ink)] font-medium"
                      >
                        {p}
                      </button>
                      <button
                        onClick={() => deleteMyPrompt(p)}
                        className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-red-50"
                        title="Delete prompt"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="text-[10px] font-bold text-[var(--ink-soft)] uppercase tracking-wider px-3 mt-4 mb-1">Suggested</div>
                </>
              )}
              
              {allPrompts.filter(p => !myPrompts.includes(p)).map((p, i) => (
                <button
                  key={`all-${i}`}
                  onClick={() => {
                    setPrompt(p);
                    setIsAi(false);
                    setShowAll(false);
                  }}
                  className="w-full text-left px-4 py-3 text-[13px] text-[var(--ink)] font-medium hover:bg-[var(--surface-muted)] rounded-xl transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
            
            <div className="p-3 border-t border-[var(--border-soft)] shrink-0 flex justify-center">
              <button
                onClick={() => setShowAll(false)}
                className="text-[13px] font-bold text-[var(--accent)] px-4 py-2 hover:bg-[var(--accent-soft)] rounded-full transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {composerVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setComposerVisible(false)}>
          <div className="bg-[var(--surface)] rounded-2xl w-full max-w-md p-5 shadow-xl border border-[var(--border-soft)]" onClick={e => e.stopPropagation()}>
            <h3 className="text-[15px] font-bold text-[var(--ink)] mb-3">Create a prompt</h3>
            
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. What surprised you today?"
              className="w-full min-h-[90px] bg-[var(--surface-muted)] border border-[var(--border-soft)] rounded-xl p-3 text-[14px] text-[var(--ink)] outline-none focus:border-[var(--accent)] transition-colors resize-none mb-1"
              maxLength={MAX_PROMPT_LENGTH}
              autoFocus
            />
            
            <div className="text-right text-[11px] text-[var(--ink-soft)] mb-4">
              {draft.length}/{MAX_PROMPT_LENGTH}
            </div>
            
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setComposerVisible(false)}
                className="px-4 py-2 text-[12px] font-bold text-[var(--ink-soft)] hover:bg-black/5 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveDraftPrompt}
                disabled={!draft.trim()}
                className="px-4 py-2 text-[12px] font-bold bg-[var(--accent)] text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Save & Use
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
