import { useEffect, useRef, useState } from 'react';
import { generateEntrySummary } from '../api/groq';

// Fetches the AI journal-insight summary for a saved entry, lazily — only
// on first open, and only for entries that already have an id.
export function useEntryInsight(entryId) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const panelRef = useRef(null);

  const run = async () => {
    if (!entryId) return;
    setLoading(true);
    setError(false);
    const result = await generateEntrySummary(entryId);
    setLoading(false);
    if (result) setText(result);
    else { setText(null); setError(true); }
  };

  const openPanel = () => {
    setOpen(true);
    if (!text && !loading) run();
  };

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return { open, setOpen, text, loading, error, panelRef, openPanel, retry: run };
}