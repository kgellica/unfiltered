import { useState } from 'react';
import { BellRing, Clock, Sparkles, Check, Coffee, Moon, Sun, Heart } from 'lucide-react';

const PROMPT_IDEAS = [
  { prompt: "what made you smile today, even for a split second? 🌸", tag: "gratitude" },
  { prompt: "write down one feeling or burden you want to release tonight. ☁️", tag: "letting go" },
  { prompt: "describe a sensory detail you noticed today (a smell, sound, or taste). ☕", tag: "mindfulness" },
  { prompt: "what is something you accomplished today that you're proud of? ✨", tag: "wins" },
  { prompt: "if you could whisper advice to yourself this morning, what would it be? 💌", tag: "reflection" },
];

export default function Reminders() {
  const [morningEnabled, setMorningEnabled] = useState(true);
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const [morningTime, setMorningTime] = useState('08:30');
  const [eveningTime, setEveningTime] = useState('21:30');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveReminders = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div
      className="min-h-screen px-4 sm:px-8 md:px-12 py-8 transition-colors duration-200 lowercase"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
          >
            <span>gentle reminders & prompts</span>
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <BellRing size={16} />
            </span>
          </h1>
          <p className="text-[13px] md:text-[14px] font-medium mt-1" style={{ color: 'var(--ink-soft)' }}>
            keep your streak glowing with gentle nudges and inspiring questions. ☕
          </p>
        </div>

        {/* Reminder Time Schedule Card */}
        <div
          className="rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-md"
          style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border-soft)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div className="flex items-center justify-between">
            <h2
              className="text-lg font-bold flex items-center gap-2"
              style={{ color: 'var(--ink)' }}
            >
              <Clock size={18} style={{ color: 'var(--accent)' }} />
              <span>daily journaling schedule</span>
            </h2>
            {savedNotice && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 animate-cute-pop">
                <Check size={12} /> preferences saved ✨
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Morning Nudge */}
            <div
              className="p-5 rounded-2xl flex flex-col gap-3 transition-all"
              style={{
                background: 'var(--surface-muted)',
                border: '1px solid var(--border-soft)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--ink)' }}>
                  <Sun size={18} className="text-amber-500" />
                  <span>morning intention</span>
                </div>
                <input
                  type="checkbox"
                  checked={morningEnabled}
                  onChange={(e) => setMorningEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                />
              </div>
              <p className="text-[12.5px]" style={{ color: 'var(--ink-soft)' }}>
                set a gentle tone before the day begins.
              </p>
              <input
                type="time"
                value={morningTime}
                disabled={!morningEnabled}
                onChange={(e) => setMorningTime(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[var(--surface)] text-[var(--ink)] text-sm font-semibold border border-[var(--border-soft)] w-32 disabled:opacity-50"
              />
            </div>

            {/* Evening Nudge */}
            <div
              className="p-5 rounded-2xl flex flex-col gap-3 transition-all"
              style={{
                background: 'var(--surface-muted)',
                border: '1px solid var(--border-soft)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--ink)' }}>
                  <Moon size={18} className="text-indigo-400" />
                  <span>evening unwind</span>
                </div>
                <input
                  type="checkbox"
                  checked={eveningEnabled}
                  onChange={(e) => setEveningEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                />
              </div>
              <p className="text-[12.5px]" style={{ color: 'var(--ink-soft)' }}>
                reflect and release your thoughts before sleep.
              </p>
              <input
                type="time"
                value={eveningTime}
                disabled={!eveningEnabled}
                onChange={(e) => setEveningTime(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[var(--surface)] text-[var(--ink)] text-sm font-semibold border border-[var(--border-soft)] w-32 disabled:opacity-50"
              />
            </div>
          </div>

          <button
            onClick={handleSaveReminders}
            className="self-start px-5 py-2.5 rounded-2xl text-[13px] font-bold text-white shadow-sm transition hover:scale-105"
            style={{ background: 'var(--accent)' }}
          >
            save reminder times 🌸
          </button>
        </div>

        {/* Daily Prompt Inspo List */}
        <div className="flex flex-col gap-4">
          <h2
            className="text-lg font-bold flex items-center gap-2"
            style={{ color: 'var(--ink)' }}
          >
            <Sparkles size={18} style={{ color: 'var(--accent)' }} />
            <span>daily prompt inspiration</span>
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            {PROMPT_IDEAS.map((item, idx) => (
              <div
                key={idx}
                className="rounded-3xl p-5 flex flex-col justify-between gap-3 shadow-xs hover:border-[var(--accent)] transition"
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border-soft)',
                }}
              >
                <p className="text-[14px] font-medium leading-relaxed" style={{ color: 'var(--ink)' }}>
                  "{item.prompt}"
                </p>
                <span
                  className="self-start text-[11px] font-bold px-2.5 py-0.5 rounded-lg"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                >
                  #{item.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
