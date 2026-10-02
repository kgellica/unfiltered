import client from './client';

/**
 * Fetches an AI-generated summary for a single journal entry from the
 * backend (/entries/:id/ai-summary), which queries Google Gemini API
 * server-side and verifies the entry belongs to the current user.
 *
 * Returns the summary text on success, or null on any failure (network
 * error, timeout, Gemini not configured, entry has no content, etc.) so
 * callers can show an inline error instead of hanging forever.
 */
export async function generateEntrySummary(entryId) {
  try {
    const { data } = await client.get(`/entries/${entryId}/ai-summary`);
    return data?.text || null;
  } catch (err) {
    console.warn('[gemini] entry-summary failed:', err?.response?.status, err?.message);
    return null;
  }
}
