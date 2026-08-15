import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('uf_theme_mode') || 'light');
  const [accent, setAccent] = useState(() => localStorage.getItem('uf_theme_accent') || 'pink');
  const [customAccent, setCustomAccent] = useState(
    () => localStorage.getItem('uf_custom_accent') || '#f472b6'
  );

  useEffect(() => {
    localStorage.setItem('uf_theme_mode', mode);
    document.documentElement.setAttribute('data-mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('uf_theme_accent', accent);
    document.documentElement.setAttribute('data-accent', accent);

    if (accent === 'custom') {
      localStorage.setItem('uf_custom_accent', customAccent);
      document.documentElement.style.setProperty('--accent', customAccent);
      document.documentElement.style.setProperty('--accent-hover', customAccent);
      document.documentElement.style.setProperty(
        '--accent-soft',
        `color-mix(in srgb, ${customAccent} 18%, transparent)`
      );
    } else {
      document.documentElement.style.removeProperty('--accent');
      document.documentElement.style.removeProperty('--accent-hover');
      document.documentElement.style.removeProperty('--accent-soft');
    }
  }, [accent, customAccent]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        accent,
        setAccent,
        customAccent,
        setCustomAccent,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
