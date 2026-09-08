
const ENGLISH_LEXICON = {
  amazing: 4, wonderful: 4, fantastic: 4, incredible: 4, love: 4, loved: 4,
  loving: 3, excited: 4, thrilled: 4, joy: 4, joyful: 4, blessed: 4,
  grateful: 4, thankful: 3, proud: 3, accomplished: 3, beautiful: 3,
  perfect: 4, happiest: 5, ecstatic: 5, delighted: 4,
  happy: 3, good: 2, great: 3, glad: 2, nice: 2, fun: 2, calm: 2,
  peaceful: 3, relaxed: 2, content: 2, hopeful: 2, better: 2,
  smile: 2, smiled: 2, smiling: 2, laugh: 2, laughed: 2, laughing: 2,
  productive: 2, energized: 2, motivated: 2, confident: 2, fine: 1,
  okay: 0, ok: 0, alright: 0,
  tired: -2, bored: -2, meh: -1, awkward: -1, nervous: -2, worried: -2,
  anxious: -3, stressed: -3, stress: -3, overwhelmed: -3, annoyed: -2,
  frustrated: -3, disappointed: -3, uneasy: -2, restless: -2, sore: -1,
  sick: -2, exhausted: -3, drained: -3, lonely: -3, insecure: -2,
  sad: -3, sadness: -3, cry: -4, crying: -4, cried: -4, hurt: -3,
  hurting: -3, angry: -4, anger: -4, hate: -4, hated: -4, terrible: -4,
  awful: -4, horrible: -4, miserable: -4, depressed: -5, depression: -5,
  hopeless: -5, worthless: -5, broken: -4, devastated: -5, grief: -4,
  heartbroken: -5, alone: -3, empty: -3, numb: -3, panic: -4, panicking: -4,
  scared: -3, scare: -3, scares: -3, afraid: -3, fear: -3, guilty: -3,
  ashamed: -3, regret: -3, fail: -3, failed: -3, failure: -3,
}; // Fully offline, supports English, Tagalog, Cebuano, Bisaya

const FILIPINO_LEXICON = {
  // Tagalog - Positive
  saya: 3, masaya: 3, nasaya: 3, sumaya: 3, masasaya: 3,
  tuwa: 3, natuwa: 3, natutuwa: 3, matuwa: 3, ikinatuwa: 3,
  galak: 3, nagalak: 3, nagagalak: 3, ikinagagalak: 3,
  ligaya: 4, maligaya: 4, naliligaya: 4,
  ganda: 2, maganda: 2, gumanda: 2,
  mabuti: 2, buti: 2, ayos: 1, maayos: 1,
  salamat: 2, pasalamat: 2,

  // Tagalog - Negative
  lungkot: -3, malungkot: -3, nalungkot: -3, nalulungkot: -3,
  lumbay: -3, nalulumbay: -3, nalumbay: -3,
  dusa: -4, nagdusa: -4, nagdurusa: -4,
  galit: -3, nagagalit: -3, nagalit: -3, magalit: -3,
  poot: -4, napopoot: -4, napoot: -4,
  inis: -2, naiinis: -2, nainis: -2,
  suko: -2, nasusuko: -2, nasuko: -2,
  pagod: -2, napapagod: -2, napagod: -2,
  sawa: -2, nasawa: -2, nagsawa: -2,
  takot: -3, natatakot: -3, natakot: -3, matakot: -3,
  hirap: -2, nahihirapan: -2, nahirapan: -2, mahirap: -2,
  problema: -2,
  sama: -2, masama: -2, sumama: -2,
  sakit: -3, masakit: -3, nasaktan: -3, nasasaktan: -3,
  iyak: -4, umiiyak: -4, umiyak: -4,
  tampo: -2, nagtatampo: -2, nagtampo: -2,
  hinayang: -2, nanghihinayang: -2,
  kaba: -2, kinakabahan: -2,
  pagkabigo: -3, nabigo: -3, bigo: -3,

  // Cebuano/Bisaya - Positive
  lipay: 3, malipay: 3, nalipay: 3, malipayon: 3, nalipayon: 3,
  kalipay: 3, malipayun: 3,
  maayo: 2, maau: 2, mayo: 2,
  nindot: 2, nindut: 2,
  gwapa: 2, gwapo: 2,
  kusog: 1, kusgan: 1,
  lamian: 1,

  // Cebuano/Bisaya - Negative 
  subo: -3, masubo: -3, nasubo: -3, "masulob-on": -3,
  guol: -3, naguol: -3, "nag-uol": -3,
  kasakit: -3, sakit: -3, masakit: -3,
  kaguol: -3,
  mingaw: -3, namingaw: -3, mingawon: -3,
  kalisud: -2, lisud: -2, lisod: -2,
  kapoy: -2, gikapoy: -2,
  hadlok: -3, nahadlok: -3,
  lagot: -3, nalagot: -3,
  suko: -2, nasuko: -2,
  sapot: -2, nasapot: -2,
  gubot: -2, nagubot: -2,
  away: -2, "nag-away": -2,
};

const NEGATORS = new Set([
  'not', "n't", 'no', 'never', 'without', "isn't", "wasn't", "don't", "didn't", "can't",
  'hindi', 'di', 'diba', 'wala', 'walang', 'ayaw', 'huwag', 'wag', 'ni',
  'dili', 'dli', 'wa', 'walay'
]);

function detectLanguage(text) {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  const filipinoMarkers = ['ng', 'mga', 'po', 'opo', 'kasi', 'dahil', 'kaya', 'naman',
    'talaga', 'lang', 'na', 'pa', 'ba', 'ano', 'saan', 'bakit', 'paano', 'kailan',
    'sino', 'kanino', 'para', 'kay', 'kina', 'sina', 'ni', 'nina', 'ko', 'mo',
    'niya', 'namin', 'ninyo', 'nila'
  ];

  const cebuanoMarkers = ['gud', 'jud', 'gyud', 'daw', 'kuno', 'man', 'gihapon',
    'naa', 'naay', 'wala', 'walay', 'dili', 'dli', 'ako', 'ikaw', 'siya',
    'kami', 'kamo', 'sila', 'ni', 'kani', 'kana', 'kadto', 'dinhi', 'diha', 'didto'
  ];

  let filipinoScore = 0, cebuanoScore = 0, englishScore = 0;

  for (const word of words) {
    if (filipinoMarkers.includes(word)) filipinoScore++;
    if (cebuanoMarkers.includes(word)) { cebuanoScore++; filipinoScore++; }
    if (ENGLISH_LEXICON[word]) englishScore++;
  }

  if (englishScore > filipinoScore && englishScore > 3) return 'en';
  if (cebuanoScore > filipinoScore / 2) return 'ceb';
  if (filipinoScore > 0) return 'tl';
  return 'en';
}

function stemFilipino(word) {
  let stem = word.toLowerCase();

  if (stem.startsWith('ma') && stem.length > 4) {
    const rest = stem.slice(2);
    if (rest.length >= 3 && rest[0] === rest[2]) {
      const root = rest.slice(2);
      if (FILIPINO_LEXICON[root] !== undefined) return root;
    }
  }

  const prefixes = ['nagka', 'nagpa', 'nag', 'mag', 'maka', 'maki',
    'ma', 'na', 'ka', 'pa', 'i', 'pagka', 'paki', 'pakiki',
    'nakiki', 'nakikipag'
  ];

  for (const prefix of prefixes) {
    if (stem.startsWith(prefix)) {
      const rest = stem.slice(prefix.length);
      if (FILIPINO_LEXICON[rest] !== undefined || rest.length >= 2) {
        stem = rest;
        break;
      }
    }
  }

  const suffixes = ['han', 'hin', 'in', 'an', 'on', 'non'];
  for (const suffix of suffixes) {
    if (stem.endsWith(suffix) && stem.length > suffix.length + 2) {
      const rest = stem.slice(0, -suffix.length);
      if (FILIPINO_LEXICON[rest] !== undefined) {
        stem = rest;
        break;
      }
    }
  }

  return stem;
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0 && word.length < 30);
}

const MOOD_ORDER = ['sad', 'low', 'okay', 'good', 'great'];

export function analyzeMood(text) {
  if (!text || text.trim().length < 10) return null;

  const words = tokenize(text);
  if (words.length === 0) return null;

  const detectedLang = detectLanguage(text);
  let total = 0;
  let scoredCount = 0;
  let negateNext = false;
  let usedFilipinoLexicon = false;

  for (const word of words) {
    if (NEGATORS.has(word)) {
      negateNext = true;
      continue;
    }

    let weight = ENGLISH_LEXICON[word];

    if (weight === undefined) {
      weight = FILIPINO_LEXICON[word];
      if (weight !== undefined) usedFilipinoLexicon = true;
    }

    if (weight === undefined) {
      const stemmed = stemFilipino(word);
      if (stemmed !== word) {
        weight = FILIPINO_LEXICON[stemmed];
        if (weight !== undefined) usedFilipinoLexicon = true;
      }
    }

    if (weight === undefined && word.startsWith('ma') && word.length > 3) {
      weight = FILIPINO_LEXICON[word.slice(2)];
      if (weight !== undefined) usedFilipinoLexicon = true;
    }

    if (weight === undefined && word.startsWith('na') && word.length > 3) {
      weight = FILIPINO_LEXICON[word.slice(2)];
      if (weight !== undefined) usedFilipinoLexicon = true;
    }

    if (weight === undefined && word.startsWith('ka') && word.length > 3) {
      weight = FILIPINO_LEXICON[word.slice(2)];
      if (weight !== undefined) usedFilipinoLexicon = true;
    }

    if (weight !== undefined) {
      total += negateNext ? -weight : weight;
      scoredCount++;
      negateNext = false;
    }
  }

  if (scoredCount === 0) {
    return {
      mood: null,
      score: 0,
      confidence: 0,
      language: detectedLang,
      message: "Not enough sentiment words found. Try English, Tagalog, or Cebuano."
    };
  }

  const avg = total / scoredCount;
  let mood;
  if (avg <= -3) mood = 'sad';
  else if (avg <= -1) mood = 'low';
  else if (avg < 1) mood = 'okay';
  else if (avg < 3) mood = 'good';
  else mood = 'great';

  const coverage = scoredCount / words.length;
  const confidence = Math.min(1, coverage * 3 + scoredCount / 8);

  return {
    mood,
    moodIndex: MOOD_ORDER.indexOf(mood),
    score: Number(avg.toFixed(2)),
    confidence: Number(confidence.toFixed(2)),
    language: detectedLang,
    scoredWords: scoredCount,
    totalWords: words.length,
    usedFilipinoLexicon
  };
}

export const MOOD_ANALYZER_ORDER = MOOD_ORDER;

export function lookupWord(word) {
  const clean = word.toLowerCase().trim();
  return {
    english: ENGLISH_LEXICON[clean] || null,
    filipino: FILIPINO_LEXICON[clean] || null,
    stemmed: stemFilipino(clean),
    stemmedLookup: FILIPINO_LEXICON[stemFilipino(clean)] || null
  };
}