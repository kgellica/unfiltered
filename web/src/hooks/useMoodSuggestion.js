import { useEffect, useRef, useState } from 'react';
import { analyzeMood } from '../lib/moodAnalyzer';

// On-device mood suggestion — no network call. Waits for a typing pause,
// scores the plain text locally, and offers a mood if it disagrees with
// whatever is currently selected.
export function useMoodSuggestion(plainContent, currentMood) {
  const [suggestedMood, setSuggestedMood] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const result = analyzeMood(plainContent);
      if (result && result.mood && result.confidence >= 0.3 && result.mood !== currentMood) {
        setSuggestedMood(result.mood);
      } else {
        setSuggestedMood(null);
      }
    }, 700);
    return () => clearTimeout(debounceRef.current);
  }, [plainContent, currentMood]);

  return { suggestedMood, dismiss: () => setSuggestedMood(null) };
}