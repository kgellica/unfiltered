import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyMode, applyAccent, ACCENT_PRESETS } from '../theme/theme';

const ThemeContext = createContext(null);

const MODE_KEY = 'uf_theme_mode';
const ACCENT_KEY = 'uf_theme_accent';
const CUSTOM_ACCENT_KEY = 'uf_custom_accent';
const PREMIUM_KEY = 'uf_is_premium';

export { ACCENT_PRESETS };

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState('light');
  const [accent, setAccentState] = useState('pink');
  const [customAccent, setCustomAccentState] = useState('#f472b6');
  const [isPremium, setIsPremiumState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [storedMode, storedAccent, storedCustom, storedPremium] = await Promise.all([
        AsyncStorage.getItem(MODE_KEY),
        AsyncStorage.getItem(ACCENT_KEY),
        AsyncStorage.getItem(CUSTOM_ACCENT_KEY),
        AsyncStorage.getItem(PREMIUM_KEY),
      ]);
      const m = storedMode || 'light';
      const a = storedAccent || 'pink';
      const c = storedCustom || '#f472b6';
      applyMode(m);
      applyAccent(a === 'custom' ? c : a);
      setModeState(m);
      setAccentState(a);
      setCustomAccentState(c);
      setIsPremiumState(storedPremium === '1');
      setReady(true);
    })();
  }, []);

  const setMode = useCallback((m) => {
    setModeState(m);
    applyMode(m);
    AsyncStorage.setItem(MODE_KEY, m);
  }, []);

  const setAccent = useCallback(
    (a) => {
      setAccentState(a);
      applyAccent(a === 'custom' ? customAccent : a);
      AsyncStorage.setItem(ACCENT_KEY, a);
    },
    [customAccent]
  );

  const setCustomAccent = useCallback(
    (hex) => {
      setCustomAccentState(hex);
      AsyncStorage.setItem(CUSTOM_ACCENT_KEY, hex);
      if (accent === 'custom') applyAccent(hex);
    },
    [accent]
  );

  const togglePremium = useCallback(() => {
    setIsPremiumState((prev) => {
      const next = !prev;
      AsyncStorage.setItem(PREMIUM_KEY, next ? '1' : '0');
      return next;
    });
  }, []);

  if (!ready) return null;

  return (
    <ThemeContext.Provider
      value={{ mode, setMode, accent, setAccent, customAccent, setCustomAccent, isPremium, togglePremium }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}