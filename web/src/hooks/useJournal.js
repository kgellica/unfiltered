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
      setStreak(statsRes.data?.current_streak || 0);
      setEntries(entriesRes.data?.entries || []);
      return { success: true };
    } catch (err) {
      console.error('Failed to load journal data:', err);
      return { success: false, error: err.message || 'failed to load entries' };
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

  const handleSave = useCallback(
    async (payload) => {
      try {
        let res;
        if (payload.id) {
          res = await api.put(`/entries/${payload.id}`, payload);
        } else {
          res = await api.post('/entries', payload);
        }

        if (!payload._quickSave) {
          closeModal();
        }

        await fetchData();

        return {
          success: true,
          message: res?.data?.message || 'entry saved successfully!',
          data: res?.data,
        };
      } catch (err) {
        console.error('Failed to save entry:', err);
        return {
          success: false,
          error: err.message || 'failed to save entry.',
          errors: err.errors || null,
        };
      }
    },
    [fetchData, closeModal]
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        const res = await api.delete(`/entries/${id}`);
        closeModal();
        await fetchData();

        return {
          success: true,
          message: res?.data?.message || 'entry deleted successfully!',
        };
      } catch (err) {
        console.error('Failed to delete entry:', err);
        return {
          success: false,
          error: err.message || 'failed to delete entry.',
        };
      }
    },
    [fetchData, closeModal]
  );

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