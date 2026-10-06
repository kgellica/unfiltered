// Strips HTML tags and collapses whitespace — used to render plain-text
// previews from rich-text entry content (entry cards, memory flashbacks).
export function stripHtmlAndEntities(html = '') {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const text = doc.body.textContent || '';
  return text.replace(/\s+/g, ' ').trim();
}

// Capitalizes the first letter of each word — used for display names.
export function formatName(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}