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
