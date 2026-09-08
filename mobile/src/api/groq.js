import client from './client';

/**
 * Fetches today's AI-generated daily affirmation from the backend
 * (/ai/affirmation), which proxies to Groq server-side.
 *
 * Returns the affirmation text on success, or null on any failure
 * (network error, timeout, Groq not configured, etc.) so callers can
 * fall back to a local preset instead of hanging forever.
 */
export async function generateAffirmation() {
  try {
    const { data } = await client.get('/ai/affirmation');
    return data?.text || null;
  } catch (err) {
    // Temporary: log the real reason instead of silently falling back.
    console.warn('[groq] affirmation failed:', err?.response?.status, err?.message);
    return null;
  }
}

/**
 * Fetches an AI-generated journal writing prompt from the backend
 * (/ai/journal-prompt). Returns null on any failure.
 */
export async function generateJournalPrompt() {
  try {
    const { data } = await client.get('/ai/journal-prompt');
    return data?.text || null;
  } catch (err) {
    // Temporary: log the real reason instead of silently falling back.
    console.warn('[groq] journal-prompt failed:', err?.response?.status, err?.message);
    return null;
  }
}

export { generateEntrySummary } from './gemini';