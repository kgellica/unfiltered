import client from './client';

export const listEntries = (params = {}) =>
  client.get('/entries', { params }).then((r) => r.data.entries);

export const getEntriesByMonth = (yyyyMM) =>
  listEntries({ month: yyyyMM });

export const getEntryByDate = (yyyyMMdd) =>
  listEntries({ date: yyyyMMdd }).then((entries) => entries[0] ?? null);

export const createEntry = (payload) =>
  client.post('/entries', payload).then((r) => r.data.entry);

export const updateEntry = (id, payload) =>
  client.put(`/entries/${id}`, payload).then((r) => r.data.entry);

export const deleteEntry = (id) => client.delete(`/entries/${id}`);

export const getStats = () => client.get('/entries/stats').then((r) => r.data);
