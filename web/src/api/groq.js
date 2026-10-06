import client from './axios';

export async function generateJournalPrompt() {
  try {
    const { data } = await client.get('/ai/journal-prompt');
    return data?.text || null;
  } catch (err) {
    console.warn('[groq] journal-prompt failed:', err?.response?.status, err?.message);
    return null;
  }
}

export async function generateEntrySummary(entryId) {
  try {
    const { data } = await client.get(`/entries/${entryId}/ai-summary`);
    return data?.text || null;
  } catch (err) {
    console.warn('[ai] entry-summary failed:', err?.response?.status, err?.message);
    return null;
  }
}

