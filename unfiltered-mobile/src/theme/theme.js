// Matches unfiltered-web/src/styles/theme.css — "Warm Milk Tea & Cream Cafe" (light mode)
// `colors` is a single mutable object (not re-created) so that screens which
// read `colors.x` inside their StyleSheet pick up applyMode/applyAccent
// changes the next time they render, without every screen needing to
// subscribe to ThemeContext individually.
export const colors = {
  // Core surfaces
  background: '#faf5ee',
  surface: '#ffffff',
  surfaceHover: '#fcf9f5',
  surfaceMuted: '#f4ede4',
  borderSoft: '#ebdcd0',
  borderStrong: '#d9c2b0',

  // Sidebar / nav bar (dark cocoa, same as web sidebar)
  navBg: '#382820',
  navBgHover: '#48352b',
  navInk: '#fdf7f2',
  navInkSoft: '#cbb7aa',

  // Ink / text
  onBackground: '#32241e',
  onSurface: '#32241e',
  onSurfaceVariant: '#7a6356',
  onSurfaceFaint: '#ad9a8e',

  // Accent (cute pink, default preset — matches web --accent)
  accent: '#f472b6',
  accentHover: '#ec4899',
  accentSoft: 'rgba(244, 114, 182, 0.16)',
  accentInk: '#ffffff',

  // Legacy aliases kept so existing screens referencing these keep working
  primary: '#f472b6',
  primaryContainer: 'rgba(244, 114, 182, 0.16)',
  onPrimary: '#ffffff',
  secondary: '#7a6356',
  secondaryContainer: '#f4ede4',
  tertiary: '#526258',
  tertiaryContainer: '#d7e9dc',
  surfaceContainer: '#f4ede4',
  surfaceContainerLow: '#fcf9f5',
  surfaceContainerHigh: '#ebdcd0',
  outline: '#ad9a8e',
  outlineVariant: '#ebdcd0',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',

  // Mood scale (same as web)
  moodGreat: '#fcd34d',
  moodGood: '#fda4af',
  moodOkay: '#bae6fd',
  moodLow: '#c4b5fd',
  moodSad: '#94a3b8',
};

// Same 5 presets as unfiltered-web Settings.jsx, plus 'custom' handled separately.
export const ACCENT_PRESETS = [
  { id: 'pink', label: 'sakura pink', hex: '#f472b6' },
  { id: 'purple', label: 'taro purple', hex: '#c084fc' },
  { id: 'green', label: 'matcha green', hex: '#4ade80' },
  { id: 'blue', label: 'baby blue', hex: '#60a5fa' },
  { id: 'brown', label: 'cinnamon latte', hex: '#d4a373' },
];

function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Mutates the shared `colors` object's accent-family fields in place.
export function applyAccent(hex) {
  if (!hex) return;
  colors.accent = hex;
  colors.accentHover = hex;
  colors.accentSoft = hexToRgba(hex, 0.16);
  colors.primary = hex;
  colors.primaryContainer = hexToRgba(hex, 0.16);
}

const MODE_PALETTES = {
  light: {
    background: '#faf5ee',
    surface: '#ffffff',
    surfaceMuted: '#f4ede4',
    onBackground: '#32241e',
    onSurface: '#32241e',
    borderSoft: '#ebdcd0',
  },
  dim: {
    background: '#3d2f28',
    surface: '#4a3a31',
    surfaceMuted: '#443530',
    onBackground: '#f3e9e1',
    onSurface: '#f3e9e1',
    borderSoft: '#5a463c',
  },
  dark: {
    background: '#211814',
    surface: '#2b211c',
    surfaceMuted: '#271d19',
    onBackground: '#f0e6dd',
    onSurface: '#f0e6dd',
    borderSoft: '#3a2d26',
  },
};

// Mutates the shared `colors` object's surface/ink fields for the given mode
// ('light' | 'dim' | 'dark'), matching web's data-mode palettes.
export function applyMode(mode) {
  const palette = MODE_PALETTES[mode] || MODE_PALETTES.light;
  Object.assign(colors, palette);
}

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 12,
  base: 8,
  md: 24,
  lg: 40,
  xl: 64,
  gutter: 16,
};

// Soft cafe-style card shadow, matching web's --card-shadow
export const cardShadow = {
  shadowColor: '#46302a',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.1,
  shadowRadius: 16,
  elevation: 4,
};

export const pixelShadow = cardShadow; // alias kept for older imports

export const fonts = {
  headline: 'System', // swap for a rounded display font (e.g. Fredoka) via expo-font to match web
  body: 'System', // swap for Quicksand via expo-font to match web
};