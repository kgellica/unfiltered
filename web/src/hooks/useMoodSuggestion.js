import { useEffect, useRef, useState } from 'react';
import { analyzeMood } from '../lib/moodAnalyzer';

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