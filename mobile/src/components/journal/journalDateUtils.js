export function normalizeDateKey(val) {
  if (!val) return '';
  const match = String(val).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return '';
  const [, y, m, d] = match;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

export function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatShortDate(val) {
  const key = normalizeDateKey(val);
  if (!key) return '';
  const [y, m, d] = key.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  const isToday =
    target.getFullYear() === today.getFullYear() &&
    target.getMonth() === today.getMonth() &&
    target.getDate() === today.getDate();
  const weekday = target.toLocaleDateString('en-US', { weekday: 'short' });
  const month = target.toLocaleDateString('en-US', { month: 'short' });
  return isToday ? `Today, ${month} ${target.getDate()}` : `${weekday}, ${month} ${target.getDate()}`;
}

export function formatDateAndTime(dateVal, createdAt) {
  const dateLabel = formatShortDate(dateVal).toLowerCase();
  if (!createdAt) return dateLabel;
  const t = new Date(createdAt);
  if (isNaN(t.getTime())) return dateLabel;
  const timeLabel = t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  return `${dateLabel} \u2022 ${timeLabel}`;
}
