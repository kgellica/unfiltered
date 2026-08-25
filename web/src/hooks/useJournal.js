import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api/axios';

export function useJournal() {
  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeEntry, setActiveEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, entriesRes] = await Promise.all([
        api.get('/entries/stats'),
        api.get('/entries'),
      ]);
      setStreak(statsRes.data.current_streak || 0);
      setEntries(entriesRes.data.entries || []);
    } catch (err) {
      console.error('Failed to load journal data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const allTags = useMemo(() => {
    const s = new Set();
    entries.forEach((e) =>
      (e.tags || []).forEach((t) => s.add(typeof t === 'string' ? t : t.name))
    );
    return Array.from(s);
  }, [entries]);

  const openEntry = useCallback((entry) => {
    setActiveEntry(entry);
    setShowModal(true);
  }, []);

  const openNew = useCallback(() => {
    setActiveEntry(null);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleSave = useCallback(async (payload) => {
    try {
      if (payload.id) {
        await api.put(`/entries/${payload.id}`, payload);
      } else {
        await api.post('/entries', payload);
      }
      if (payload._quickSave) {
        fetchData();
      } else {
        closeModal();
        fetchData();
      }
    } catch (err) {
      console.error('Failed to save entry:', err);
    }
  }, [fetchData, closeModal]);

  const handleDelete = useCallback(async (id) => {
    try {
      await api.delete(`/entries/${id}`);
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  }, [fetchData, closeModal]);

  return {
    entries,
    streak,
    loading,
    allTags,
    activeEntry,
    showModal,
    setActiveEntry,
    setShowModal,
    fetchData,
    openEntry,
    openNew,
    closeModal,
    handleSave,
    handleDelete,
  };
}
