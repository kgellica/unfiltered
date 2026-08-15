export const CARD_COLORS = [
  { hex: '', name: 'default cream', bg: 'var(--surface)' },
  { hex: '#fff0f5', name: 'strawberry milk', bg: '#fff0f5' },
  { hex: '#fff8eb', name: 'warm honey', bg: '#fff8eb' },
  { hex: '#f0fdf4', name: 'matcha latte', bg: '#f0fdf4' },
  { hex: '#f5f3ff', name: 'taro lavender', bg: '#f5f3ff' },
  { hex: '#eff6ff', name: 'baby cloud', bg: '#eff6ff' },
  { hex: '#f7eee7', name: 'cozy cinnamon', bg: '#f7eee7' },
];

// Simple luminance check so text stays readable against any custom card color.
export function getReadableText(hex) {
  if (!hex) return 'var(--ink)';
  const c = hex.replace('#', '');
  if (c.length !== 6) return 'var(--ink)';
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? '#382820' : '#fdf7f2';
}

export const MOOD_META = {
  great: { label: 'great', emoji: '😄', color: 'var(--mood-great)', text: 'feeling amazing ✨' },
  good: { label: 'good', emoji: '🌸', color: 'var(--mood-good)', text: 'feeling happy 🌸' },
  okay: { label: 'okay', emoji: '☁️', color: 'var(--mood-okay)', text: 'feeling okay ☁️' },
  low: { label: 'low', emoji: '🌧️', color: 'var(--mood-low)', text: 'feeling a bit low 🌧️' },
  sad: { label: 'sad', emoji: '🧸', color: 'var(--mood-sad)', text: 'feeling down 🧸' },
};

/**
 * Normalizes any date format into YYYY-MM-DD key reliably.
 */
export function normalizeDateKey(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  const match = String(val).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const [, y, m, d] = match;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return '';
}

/**
 * Universal date parser that extracts local year, month, date safely without timezone/NaN bugs.
 */
export function parseDiaryDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  const match = String(val).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const [, y, m, d] = match.map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format date string into cute conversational text:
 * e.g., "today • sat, aug 15", "yesterday • fri, aug 14", "sat, aug 15, 2026"
 */
export function formatDiaryDate(dateString) {
  const targetDate = parseDiaryDate(dateString);
  if (!targetDate) return '';
  
  const today = new Date();
  const isToday =
    targetDate.getFullYear() === today.getFullYear() &&
    targetDate.getMonth() === today.getMonth() &&
    targetDate.getDate() === today.getDate();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    targetDate.getFullYear() === yesterday.getFullYear() &&
    targetDate.getMonth() === yesterday.getMonth() &&
    targetDate.getDate() === yesterday.getDate();

  const weekday = targetDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  const month = targetDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
  const dayNum = targetDate.getDate();

  if (isToday) {
    return `today • ${weekday}, ${month} ${dayNum}`;
  }
  if (isYesterday) {
    return `yesterday • ${weekday}, ${month} ${dayNum}`;
  }
  return `${weekday}, ${month} ${dayNum}, ${targetDate.getFullYear()}`;
}

export function formatShortDate(dateString) {
  const targetDate = parseDiaryDate(dateString);
  if (!targetDate) return '';

  const today = new Date();
  const isToday =
    targetDate.getFullYear() === today.getFullYear() &&
    targetDate.getMonth() === today.getMonth() &&
    targetDate.getDate() === today.getDate();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    targetDate.getFullYear() === yesterday.getFullYear() &&
    targetDate.getMonth() === yesterday.getMonth() &&
    targetDate.getDate() === yesterday.getDate();

  const weekday = targetDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  const month = targetDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
  const dayNum = targetDate.getDate();

  if (isToday) {
    return `today, ${month} ${dayNum}`;
  }
  if (isYesterday) {
    return `yesterday, ${month} ${dayNum}`;
  }
  return `${weekday}, ${month} ${dayNum}`;
}

export function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
}
