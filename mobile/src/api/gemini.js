// Calls your own Laravel API, which proxies Gemini server-side. The Gemini
// key lives only in the backend's .env (GEMINI_API_KEY) — it is never
// bundled into the mobile app or visible in network traffic from the phone.
//
// Backend setup (see backend/.env):
//   GEMINI_API_KEY=your-gemini-api-key-here
// Get a free key at https://aistudio.google.com/apikey
//
// Both functions fail soft — if the backend has no key configured, or the
// request errors, they return `null` and callers fall back to local presets.

import client from './client';

export async function generateAffirmation() {
  try {
    const res = await client.get('/ai/affirmation');
    return res.data?.text || null;
  } catch (err) {
    console.warn('AI affirmation request failed:', err.message);
    return null;
  }
}

export async function generateJournalPrompt() {
  try {
    const res = await client.get('/ai/journal-prompt');
    return res.data?.text || null;
  } catch (err) {
    console.warn('AI journal prompt request failed:', err.message);
    return null;
  }
}
