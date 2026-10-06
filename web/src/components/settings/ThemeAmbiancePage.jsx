import { useTheme } from '../../context/ThemeContext';
import { Sun, Coffee, Moon } from 'lucide-react';

const ACCENT_PRESETS = [
  { id: 'pink', label: 'sakura pink', hex: '#f472b6' },
  { id: 'purple', label: 'taro purple', hex: '#c084fc' },
  { id: 'green', label: 'matcha green', hex: '#4ade80' },
  { id: 'blue', label: 'baby blue', hex: '#60a5fa' },
  { id: 'brown', label: 'cinnamon latte', hex: '#d4a373' },
];

export default function ThemeAmbiancePage() {
  const { mode, setMode, accent, setAccent, customAccent, setCustomAccent } = useTheme();

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-3">color mode</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setMode('light')}
            className={`py-4 px-3 rounded-2xl text-[13px] font-bold transition flex flex-col items-center gap-2 border-2 cursor-pointer ${mode === 'light'
              ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
              : 'border-[var(--border-soft)] bg-[var(--surface-muted)] hover:border-[var(--accent)]'
              }`}
            style={{ color: 'var(--ink)' }}
          >
            <Sun size={20} className={mode === 'light' ? 'text-[var(--accent)]' : 'text-[var(--ink-soft)]'} />
            <div className="text-center">
              <span className="block text-[11px] font-medium opacity-60">light</span>
              <span className="block text-[12px] font-bold">(milk tea)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode('dim')}
            className={`py-4 px-3 rounded-2xl text-[13px] font-bold transition flex flex-col items-center gap-2 border-2 cursor-pointer ${mode === 'dim'
              ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
              : 'border-[var(--border-soft)] bg-[var(--surface-muted)] hover:border-[var(--accent)]'
              }`}
            style={{ color: 'var(--ink)' }}
          >
            <Coffee size={20} className={mode === 'dim' ? 'text-[var(--accent)]' : 'text-[var(--ink-soft)]'} />
            <div className="text-center">
              <span className="block text-[11px] font-medium opacity-60">dim</span>
              <span className="block text-[12px] font-bold">(warm cocoa)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode('dark')}
            className={`py-4 px-3 rounded-2xl text-[13px] font-bold transition flex flex-col items-center gap-2 border-2 cursor-pointer ${mode === 'dark'
              ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
              : 'border-[var(--border-soft)] bg-[var(--surface-muted)] hover:border-[var(--accent)]'
              }`}
            style={{ color: 'var(--ink)' }}
          >
            <Moon size={20} className={mode === 'dark' ? 'text-[var(--accent)]' : 'text-[var(--ink-soft)]'} />
            <div className="text-center">
              <span className="block text-[11px] font-medium opacity-60">dark</span>
              <span className="block text-[12px] font-bold">(espresso)</span>
            </div>
          </button>
        </div>
      </div>

      <div>
        <label className="text-[12px] font-bold text-[var(--ink-soft)] block mb-3">accent tone</label>
        <div className="flex flex-wrap gap-3">
          {ACCENT_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setAccent(p.id)}
              className={`w-12 h-12 rounded-full border-2 transition-all cursor-pointer ${accent === p.id
                  ? 'border-[var(--accent)] ring-2 ring-[var(--accent-soft)] scale-110'
                  : 'border-transparent hover:scale-105'
                }`}
              style={{ background: p.hex }}
              title={p.label}
            />
          ))}

          <div className="relative flex items-center justify-center">
            <input
              type="color"
              value={customAccent || '#f472b6'}
              onChange={(e) => {
                setCustomAccent(e.target.value);
                setAccent('custom');
              }}
              className={`w-12 h-12 rounded-full cursor-pointer border-2 p-0 appearance-none bg-transparent overflow-hidden transition-all [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full ${accent === 'custom'
                  ? 'border-[var(--accent)] ring-2 ring-[var(--accent-soft)] scale-110'
                  : 'border-[var(--border-soft)] hover:scale-105'
                }`}
              style={{ backgroundColor: customAccent || '#f472b6' }}
              title="custom color"
            />
            <span className="absolute pointer-events-none text-white drop-shadow-sm font-bold text-base">+</span>
          </div>
        </div>
      </div>
    </div>
  );
}