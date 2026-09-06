// On-device sentiment analysis for journal entries — no network call, no
// API key, works fully offline. Scores the entry's text against a small
// weighted word lexicon (AFINN-style) and maps the result onto the app's
// five mood buckets (great / good / okay / low / sad).
//
// This is intentionally simple and transparent rather than a black-box
// library: every word's weight is visible below, negation handling is a
// one-line rule, and the whole thing is auditable in a few minutes — which
// matters if you need to explain how it works for a paper or defense.

// Weight scale: -5 (very negative) to +5 (very positive).
const LEXICON = {
  // strongly positive
  amazing: 4, wonderful: 4, fantastic: 4, incredible: 4, love: 4, loved: 4,
  loving: 3, excited: 4, thrilled: 4, joy: 4, joyful: 4, blessed: 4,
  grateful: 4, thankful: 3, proud: 3, accomplished: 3, beautiful: 3,
  perfect: 4, happiest: 5, ecstatic: 5, delighted: 4,
  // mildly positive
  happy: 3, good: 2, great: 3, glad: 2, nice: 2, fun: 2, calm: 2,
  peaceful: 3, relaxed: 2, content: 2, hopeful: 2, better: 2, excited2: 0,
  smile: 2, smiled: 2, smiling: 2, laugh: 2, laughed: 2, laughing: 2,
  productive: 2, energized: 2, motivated: 2, confident: 2, fine: 1,
  okay: 0, ok: 0, alright: 0,
  // mildly negative
  tired: -2, bored: -2, meh: -1, awkward: -1, nervous: -2, worried: -2,
  anxious: -3, stressed: -3, stress: -3, overwhelmed: -3, annoyed: -2,
  frustrated: -3, disappointed: -3, uneasy: -2, restless: -2, sore: -1,
  sick: -2, exhausted: -3, drained: -3, lonely: -3, insecure: -2,
  // strongly negative
  sad: -3, sadness: -3, cry: -4, crying: -4, cried: -4, hurt: -3,
  hurting: -3, angry: -4, anger: -4, hate: -4, hated: -4, terrible: -4,
  awful: -4, horrible: -4, miserable: -4, depressed: -5, depression: -5,
  hopeless: -5, worthless: -5, broken: -4, devastated: -5, grief: -4,
  heartbroken: -5, alone: -3, empty: -3, numb: -3, panic: -4, panicking: -4,
  scared: -3, scare: -3, scares: -3, afraid: -3, fear: -3, guilty: -3, ashamed: -3, regret: -3,
  fail: -3, failed: -3, failure: -3,
};

// Words that flip the sign of the very next scored word (simple negation
// window of 1 — "not happy" scores as negative, not positive).
const NEGATORS = new Set(['not', "n't", 'no', 'never', 'without', "isn't", "wasn't", "don't", "didn't", "can't"]);

const MOOD_ORDER = ['sad', 'low', 'okay', 'good', 'great'];

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Scores journal text and suggests one of the app's five moods.
 * Returns null if there isn't enough text to make a meaningful guess.
 */
export function analyzeMood(text) {
  if (!text || text.trim().length < 15) return null;

  const words = tokenize(text);
  if (words.length === 0) return null;

  let total = 0;
  let scoredCount = 0;
  let negateNext = false;

  for (const word of words) {
    if (NEGATORS.has(word)) {
      negateNext = true;
      continue;
    }
    const weight = LEXICON[word];
    if (weight !== undefined) {
      total += negateNext ? -weight : weight;
      scoredCount++;
      negateNext = false;
    }
  }

  // Not enough sentiment-bearing words to make a confident guess.
  if (scoredCount === 0) return null;

  // Average weight per scored word, then bucket it into the 5 moods.
  const avg = total / scoredCount;
  let mood;
  if (avg <= -3) mood = 'sad';
  else if (avg <= -1) mood = 'low';
  else if (avg < 1) mood = 'okay';
  else if (avg < 3) mood = 'good';
  else mood = 'great';

  // Rough confidence signal based on how many sentiment words were found
  // relative to the entry's length — more data points, more confidence.
  const coverage = scoredCount / words.length;
  const confidence = Math.min(1, coverage * 3 + scoredCount / 8);

  return { mood, score: avg, confidence: Number(confidence.toFixed(2)) };
}

export const MOOD_ANALYZER_ORDER = MOOD_ORDER;