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
      try {
        const [storedMode, storedAccent, storedCustom, storedPremium] = await Promise.all([
          AsyncStorage.getItem(MODE_KEY),
          AsyncStorage.getItem(ACCENT_KEY),
          AsyncStorage.getItem(CUSTOM_ACCENT_KEY),
          AsyncStorage.getItem(PREMIUM_KEY),
        ]);
        
        const m = storedMode || 'light';
        const a = storedAccent || 'pink';
        const c = storedCustom || '#f472b6';
        
        // Apply the theme
        applyMode(m);
        applyAccent(a === 'custom' ? c : a);
        
        setModeState(m);
        setAccentState(a);
        setCustomAccentState(c);
        setIsPremiumState(storedPremium === '1');
      } catch (error) {
        console.error('Error loading theme settings:', error);
        // Fallback to defaults
        applyMode('light');
        applyAccent('#f472b6');
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setMode = useCallback((m) => {
    setModeState(m);
    applyMode(m);
    AsyncStorage.setItem(MODE_KEY, m).catch(err => console.error('Error saving mode:', err));
  }, []);

  const setAccent = useCallback(
    (a) => {
      setAccentState(a);
      applyAccent(a === 'custom' ? customAccent : a);
      AsyncStorage.setItem(ACCENT_KEY, a).catch(err => console.error('Error saving accent:', err));
    },
    [customAccent]
  );

  const setCustomAccent = useCallback(
    (hex) => {
      setCustomAccentState(hex);
      AsyncStorage.setItem(CUSTOM_ACCENT_KEY, hex).catch(err => console.error('Error saving custom accent:', err));
      if (accent === 'custom') {
        applyAccent(hex);
      }
    },
    [accent]
  );

  const togglePremium = useCallback(() => {
    setIsPremiumState((prev) => {
      const next = !prev;
      AsyncStorage.setItem(PREMIUM_KEY, next ? '1' : '0').catch(err => console.error('Error saving premium status:', err));
      return next;
    });
  }, []);

  if (!ready) {
    // You can return a loading screen here if you want
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{ 
        mode, 
        setMode, 
        accent, 
        setAccent, 
        customAccent, 
        setCustomAccent, 
        isPremium, 
        togglePremium 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}