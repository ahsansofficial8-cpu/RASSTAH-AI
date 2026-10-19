const DEFAULT_MODELS = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash'];
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MAX_HISTORY_ITEMS = 3;
const MAX_HISTORY_CHARS = 1200;

function getModels(env = process.env) {
  const configured = env.GEMINI_MODELS
    ?.split(',')
    .map((model) => model.trim())
    .filter(Boolean);
  const models = configured?.length ? configured : DEFAULT_MODELS;
  if (models.length > 5 || models.some((model) => !/^[a-zA-Z0-9._-]{1,100}$/.test(model))) {
    throw new Error('GEMINI_MODELS must contain at most 5 valid comma-separated model IDs.');
  }
  return [...new Set(models)];
}

function makeGeminiContents(message, history) {
  const validHistory = Array.isArray(history)
    ? history.filter((item) => (
      item
      && ['user', 'assistant'].includes(item.role)
      && typeof item.content === 'string'
      && item.content.trim()
    )).slice(-MAX_HISTORY_ITEMS)
    : [];

  return [
    ...validHistory.map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.content.slice(0, MAX_HISTORY_CHARS) }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];
}

async function generateWithModel({ model, apiKey, contents, systemInstruction, fetchImpl, timeoutMs, jsonMode = false }) {
  const url = `${GEMINI_API_URL}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const generationConfig = { 
    temperature: 0.7, 
    maxOutputTokens: 2048 
  };
  if (jsonMode) {
    generationConfig.responseMimeType = 'application/json';
  }

  const response = await fetchImpl(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
        contents,
        generationConfig
      }),
      signal: AbortSignal.timeout(timeoutMs)
    }
  );

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`Gemini returned invalid JSON (HTTP ${response.status}).`, { cause: error });
  }
  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini returned HTTP ${response.status}.`);
  }

  const text = (data?.candidates?.[0]?.content?.parts || [])
    .map((part) => typeof part.text === 'string' ? part.text : '')
    .join('')
    .trim();
  if (!text) throw new Error('Gemini returned no reply text.');
  return text;
}

async function generateChatReply({
  message,
  history,
  context,
  env = process.env,
  fetchImpl = globalThis.fetch,
  logger = console,
  timeoutMs = 30000
}) {
  const apiKey = env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const error = new Error('Gemini is not configured. Set GEMINI_API_KEY in the server environment.');
    error.code = 'AI_PENDING_CONFIGURATION';
    throw error;
  }
  if (typeof fetchImpl !== 'function') throw new Error('This Node.js runtime does not provide fetch.');

  const contents = makeGeminiContents(message, history);
  const systemInstruction = [
    'You are Raastah AI Tour Guide (راستہ ٹور گائیڈ), a friendly, expert Pakistani local tour lead.',
    'HUMAN CONVERSATIONAL PERSONA (CRITICAL): Speak naturally and warmly like an expert local friend chatting over WhatsApp. Strictly do NOT use robotic markdown formatting: no asterisks for bolding (do not use **), no hashtag headings (no #### or ###), and no bullet asterisks. Write in clean plain text with natural line breaks and occasional friendly emojis.',
    '1. 200% TOUR GUIDE: If asked about destinations, mountain passes (Babusar, Lowari, Khunjerab), 4x4 vehicles (Prado, Hilux), seasons, food, or safety in Pakistan, provide detailed, insider local tips with warmth and clarity.',
    '2. 50/50 DIVERSION RULE: If asked general knowledge, coding, math, or jokes, answer their question first (50%), then smoothly connect it to Pakistan expeditions and mountain adventures (50%).',
    '3. ACTION TRIGGERING: When suggesting a tool or page, append a machine action at the very end on a new line: <!--ACTION:{"action":"NAVIGATE|GENERATE_ITINERARY","path":"/route","label":"Button Text"}-->. Examples:',
    '   - For vibe quiz: <!--ACTION:{"action":"NAVIGATE","path":"/mood-matcher","label":"Launch AI Vibe Matcher"}-->',
    '   - For planning a trip: <!--ACTION:{"action":"GENERATE_ITINERARY","destination":"Hunza","days":5,"label":"Plan 5-Day Hunza Trip"}-->',
    '   - For weather: <!--ACTION:{"action":"NAVIGATE","path":"/tools?tab=weather","label":"View Live Weather Radar"}-->',
    '   - For drivers: <!--ACTION:{"action":"NAVIGATE","path":"/guides","label":"Browse Verified 4x4 Drivers"}-->',
    '   - For packages: <!--ACTION:{"action":"NAVIGATE","path":"/packages","label":"Explore Tour Packages"}-->',
    '4. VERIFIED PACKAGES: 7-Day Hunza & Khunjerab (PKR 85,000), 8-Day Skardu & Deosai 4x4 (PKR 110,000), 5-Day Fairy Meadows & Nanga Parbat (PKR 62,000), 4-Day Swat & Kumrat (PKR 48,000), 3-Day Neelum Valley (PKR 38,000).',
    '5. KEY PASSES & ROAD ADVICE: Babusar Pass (4,173m) is open mid-June to late-October (use KKH via Bisham in winter). Lowari Tunnel is open 24/7 all year round. Khunjerab Pass is open April to November. Deosai requires 4x4 Land Cruiser/Prado.',
    '6. WEBSITE USER MANUAL: Destinations (/destinations), Packages (/packages), Planner (/planner), Vibe Matcher (/mood-matcher), Travel Tools (/tools), Pocket Guide (/pocket-guide), Drivers (/guides), Operators Map (/operators).',
    '7. TONE: Welcoming ("Salam / Khushamdeed!"), hospitable, and genuinely knowledgeable.',
    `Current app context: ${JSON.stringify(context ?? {})}`
  ].join(' ');
  const errors = [];
  const models = getModels(env);

  for (const model of models) {
    try {
      const text = await generateWithModel({
        model,
        apiKey,
        contents,
        systemInstruction,
        fetchImpl,
        timeoutMs
      });
      return { text, model };
    } catch (error) {
      errors.push({ model, message: error instanceof Error ? error.message : String(error) });
      logger.warn(`Gemini model ${model} failed; ${errors.length < models.length ? 'trying the next model' : 'no models remain'}.`);
    }
  }

  const error = new Error('All configured Gemini models failed. Check the API key, model access, quota, and server connectivity.');
  error.code = 'GEMINI_UPSTREAM_FAILED';
  error.failures = errors;
  throw error;
}

function getFallbackItinerary(destination = 'Hunza Valley', days = 5) {
  const dest = destination || 'Hunza Valley';
  const numDays = Math.min(Math.max(Number(days) || 5, 1), 14);

  const dayTemplates = [
    {
      title: 'Departure & Mountain Ascent',
      activities: [
        { time: '06:00 AM', activity: 'Departure via Hazara Motorway (M-15)', location: 'Islamabad / Abbottabad', costPKR: 8500 },
        { time: '01:00 PM', activity: 'Traditional Trout Lunch & Riverside Rest', location: 'Naran Valley Riverbank', costPKR: 2500 },
        { time: '04:30 PM', activity: 'Babusar Top Pass Crossing (4,173m)', location: 'Babusar Pass', costPKR: 500 },
        { time: '07:30 PM', activity: 'Arrival & Check-in at Riverside Lodge', location: 'Chilas / Gilgit Confluence', costPKR: 12000 }
      ]
    },
    {
      title: 'Arrival in Karimabad & Ancient Forts',
      activities: [
        { time: '08:30 AM', activity: 'Scenic Drive along Karakoram Highway (KKH)', location: 'Indus & Hunza Gorge', costPKR: 4000 },
        { time: '11:30 AM', activity: 'Rakaposhi View Point Tea Stop (7,788m)', location: 'Ghizer / Nagar Point', costPKR: 800 },
        { time: '02:00 PM', activity: 'Guided Tour of 800-year-old Baltit Fort', location: 'Karimabad Hunza', costPKR: 1500 },
        { time: '06:00 PM', activity: 'Golden Hour Sunset at Eagle\'s Nest Duikar', location: 'Duikar Viewpoint (2,850m)', costPKR: 1200 }
      ]
    },
    {
      title: 'Glacial Lakes & Cathedral Cones',
      activities: [
        { time: '09:00 AM', activity: 'Motorboat Safari on Turquoise Glacial Waters', location: 'Attabad Lake', costPKR: 3500 },
        { time: '12:30 PM', activity: 'Hussaini Suspension Bridge Crossing Walk', location: 'Upper Hunza River', costPKR: 800 },
        { time: '03:00 PM', activity: 'Passu Cathedral Cones Photography Walk', location: 'Passu Glacier Moraine', costPKR: 1500 },
        { time: '07:00 PM', activity: 'Traditional Wakhi Chapshuro Dinner & Bonfire', location: 'Passu Village', costPKR: 2800 }
      ]
    },
    {
      title: 'Khunjerab Pass — The Roof of the World',
      activities: [
        { time: '07:30 AM', activity: 'High-Altitude 4x4 Ascent to Chinese Border', location: 'Sost Dry Port & KKH', costPKR: 7000 },
        { time: '11:00 AM', activity: 'Arrival at Khunjerab Border Post (4,693m)', location: 'World\'s Highest ATM & Gateway', costPKR: 2000 },
        { time: '02:00 PM', activity: 'Ibex & Marmot Wildlife Spotting in National Park', location: 'Khunjerab National Park', costPKR: 1000 },
        { time: '06:30 PM', activity: 'Return to Central Hunza & Artisan Shopping', location: 'Karimabad Gemstone Bazaar', costPKR: 3500 }
      ]
    },
    {
      title: 'Hoper Glacier & Return Journey',
      activities: [
        { time: '08:30 AM', activity: 'Off-Road 4x4 Excursion to Hoper Glacier', location: 'Nagar Valley', costPKR: 4500 },
        { time: '12:00 PM', activity: 'Organic Apricot Cake & Local Herbal Tea', location: 'Minapin Village', costPKR: 1200 },
        { time: '03:00 PM', activity: 'Descent toward Gilgit Gateway City', location: 'Gilgit River Drive', costPKR: 3500 },
        { time: '07:00 PM', activity: 'Farewell Dinner & Tour Debrief', location: 'Serena Gilgit / Local Haveli', costPKR: 4000 }
      ]
    }
  ];

  const dailyPlan = [];
  for (let i = 0; i < numDays; i++) {
    const template = dayTemplates[i % dayTemplates.length];
    dailyPlan.push({
      day: i + 1,
      title: `Day ${i + 1}: ${dest} — ${template.title}`,
      activities: template.activities
    });
  }

  const totalCost = dailyPlan.reduce((acc, d) => 
    acc + d.activities.reduce((sum, a) => sum + (a.costPKR || 0), 0), 0);

  return {
    destination: dest,
    totalDays: numDays,
    bestSeason: 'May to October (Alpine Spring & Autumn Foliage)',
    dailyPlan,
    totalEstimatedCostPKR: totalCost,
    packingEssentials: [
      'Layered windproof fleece jacket',
      'High-SPF mineral sunscreen & polarized UV sunglasses',
      'Waterproof trekking boots with ankle support',
      'Altitude hydration electrolytes & Diamox (AMS precaution)',
      'Portable power bank (minimum 20,000 mAh)',
      'Offline downloaded maps and CNIC / Passport copies'
    ],
    transportAdvice: 'Toyota Prado TZ or Hilux Revo 4x4 strongly recommended for rocky approach roads and stream crossings. Paved KKH tarmac allows sedan access up to Karimabad.'
  };
}

async function generateItineraryPlan({
  destination,
  days = 5,
  env = process.env,
  fetchImpl = globalThis.fetch,
  logger = console,
  timeoutMs = 30000
}) {
  const apiKey = env.GEMINI_API_KEY?.trim();
  const numDays = Math.min(Math.max(Number(days) || 5, 1), 14);
  const destName = typeof destination === 'string' && destination.trim() ? destination.trim() : 'Hunza Valley';

  if (!apiKey) {
    return { itinerary: getFallbackItinerary(destName, numDays), modelUsed: 'raastah-offline-intelligence' };
  }

  const systemInstruction = `You are the master expedition planner for Raastah (راستہ), Pakistan. Generate a structured, realistic ${numDays}-day travel itinerary for ${destName}, Pakistan.
You MUST output ONLY a valid raw JSON object. Do NOT wrap in markdown \`\`\`json blocks.
The JSON must strictly match this schema:
{
  "destination": "${destName}",
  "totalDays": ${numDays},
  "bestSeason": "string",
  "dailyPlan": [
    {
      "day": number,
      "title": "string",
      "activities": [
        {
          "time": "string (e.g. 08:30 AM)",
          "activity": "string",
          "location": "string",
          "costPKR": number
        }
      ]
    }
  ],
  "totalEstimatedCostPKR": number,
  "packingEssentials": ["string"],
  "transportAdvice": "string"
}`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: `Create a comprehensive ${numDays}-day day-by-day expedition itinerary for ${destName}, Pakistan with real PKR prices and actual landmarks.` }]
    }
  ];

  const models = getModels(env);
  for (const model of models) {
    try {
      const text = await generateWithModel({
        model,
        apiKey,
        contents,
        systemInstruction,
        fetchImpl,
        timeoutMs,
        jsonMode: true
      });
      const cleanJson = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed && Array.isArray(parsed.dailyPlan) && parsed.dailyPlan.length > 0) {
        return { itinerary: parsed, modelUsed: model };
      }
    } catch (err) {
      logger.warn(`Gemini itinerary generation with ${model} failed, trying next:`, err.message);
    }
  }

  return { itinerary: getFallbackItinerary(destName, numDays), modelUsed: 'raastah-offline-intelligence' };
}

async function translateWithGemini({
  text,
  sourceLanguage,
  targetLanguage,
  env = process.env,
  fetchImpl = globalThis.fetch,
  logger = console,
  timeoutMs = 15000
}) {
  const apiKey = env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  const systemInstruction = `You are an expert native polyglot and translator specializing in Pakistani regional languages. Translate the following travel phrase from ${sourceLanguage} to ${targetLanguage}.
CRITICAL LANGUAGE RULES:
1. For Punjabi or "Punjabi (Shahmukhi)", ALWAYS write in authentic Pakistani Shahmukhi script (شاہ مکھی - Perso-Arabic alphabet). Strictly NEVER use Indian Gurmukhi or Devanagari/Hindi scripts.
2. For Pakistani regional tongues (Urdu, Pashto, Sindhi, Balochi, Saraiki, Hindko, Kashmiri, Brahui, Shina, Balti, Khowar, Arabic), provide the native Perso-Arabic script.
3. For Chinese, provide clean simplified Chinese (简体中文).
4. Provide ONLY the direct natural translation in the target language. Do not output explanations, notes, phonetic approximations, quotes, or markdown. Output clean plain text.`;
  const contents = [{ role: 'user', parts: [{ text: text.trim() }] }];
  const models = getModels(env);

  for (const model of models) {
    try {
      const translated = await generateWithModel({
        model,
        apiKey,
        contents,
        systemInstruction,
        fetchImpl,
        timeoutMs
      });
      if (translated && translated.trim()) {
        return { translation: translated.trim(), modelUsed: model };
      }
    } catch (err) {
      logger.warn(`Gemini translation with ${model} failed, trying next:`, err.message);
    }
  }
  throw new Error('All configured Gemini models failed to translate.');
}

module.exports = { 
  generateChatReply, 
  generateItineraryPlan, 
  getFallbackItinerary, 
  getModels, 
  makeGeminiContents,
  translateWithGemini
};
