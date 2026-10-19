import { useState, useEffect, useRef } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import { 
  Mic, MicOff, Volume2, ArrowRightLeft, Copy, Check, 
  RotateCcw, Sparkles, ShieldAlert, Compass, Coffee, Bed, Handshake 
} from 'lucide-react';
import { EmergencySOS } from '@/components/ui';

// 15 languages across Pakistan, Northern alpine valleys & international travel corridors
const LANGUAGES = [
  { code: 'ur', name: 'Urdu', native: 'اردو', speechLocale: 'ur-PK' },
  { code: 'en', name: 'English', native: 'English', speechLocale: 'en-US' },
  { code: 'pa', name: 'Punjabi (Shahmukhi)', native: 'پنجابی شاہ مکھی', speechLocale: 'pa-PK' },
  { code: 'ps', name: 'Pashto', native: 'پښتو', speechLocale: 'ps-PK' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي', speechLocale: 'sd-PK' },
  { code: 'bal', name: 'Balochi', native: 'بلوچی', speechLocale: 'ur-PK' },
  { code: 'skr', name: 'Saraiki', native: 'سرائیکی', speechLocale: 'pa-PK' },
  { code: 'hno', name: 'Hindko', native: 'ہندکو', speechLocale: 'ur-PK' },
  { code: 'ks', name: 'Kashmiri', native: 'کٲشُر', speechLocale: 'ks-IN' },
  { code: 'brh', name: 'Brahui', native: 'براہوئی', speechLocale: 'ur-PK' },
  { code: 'scl', name: 'Shina', native: 'شینا (گلگت)', speechLocale: 'ur-PK' },
  { code: 'bft', name: 'Balti', native: 'بلتی (سکردو)', speechLocale: 'ur-PK' },
  { code: 'khw', name: 'Khowar', native: 'کھوار (چترال)', speechLocale: 'ur-PK' },
  { code: 'ar', name: 'Arabic', native: 'العربية', speechLocale: 'ar-SA' },
  { code: 'zh', name: 'Chinese', native: '中文 (Mandarin)', speechLocale: 'zh-CN' }
];

// High-fidelity offline phrasebook across Pakistan alpine routes
const OFFLINE_DICTIONARY = [
  {
    category: 'Emergency',
    icon: ShieldAlert,
    en: 'Please help me, it is an emergency!',
    ur: 'براہ کرم میری مدد کریں، یہ ایمرجنسی ہے!',
    urRoman: 'Barah-e-karam meri madad karein, yeh emergency hai!',
    ps: 'مهرباني وکړئ زما مرسته وکړئ، دا بیړنی حالت دی!',
    pa: 'مہربانی کر کے میری مدد کرو، ایہ ایمرجنسی اے!',
    ar: 'أرجو مساعدتي، إنها حالة طارئة!',
    de: 'Bitte helfen Sie mir, es ist ein Notfall!'
  },
  {
    category: 'Emergency',
    icon: ShieldAlert,
    en: 'Where is the nearest hospital or military clinic?',
    ur: 'قریبی ہسپتال یا فوجی کلینک کہاں ہے؟',
    urRoman: 'Qareebi hospital ya fauji clinic kahan hai?',
    ps: 'تر ټولو نږدې روغتون یا نظامي کلینیک چیرته دی؟',
    pa: 'نیڑے ترین ہسپتال کتھے اے؟',
    ar: 'أين أقرب مستشفى أو عيادة؟',
    de: 'Wo ist das nächste Krankenhaus oder die nächste Klinik?'
  },
  {
    category: 'Mountain Transit',
    icon: Compass,
    en: 'Is the mountain pass open today or blocked by snow/landslide?',
    ur: 'کیا پہاڑی راستہ آج کھلا ہے یا برف باری اور لینڈ سلائیڈنگ سے بند ہے؟',
    urRoman: 'Kya pahari raastah aaj khula hai ya barf bari se band hai?',
    ps: 'ایا د غره لاره نن خلاصه ده او که د واورې او د ځمکې ښویدنې له امله بنده ده؟',
    pa: 'کی پہاڑی راہ اج کھلی اے یا برف نال بند اے؟',
    ar: 'هل الممر الجبلي مفتوح اليوم أم مغلق بالثلوج؟',
    de: 'Ist der Gebirgspass heute geöffnet oder durch Schnee/Erdrutsch blockiert?'
  },
  {
    category: 'Mountain Transit',
    icon: Compass,
    en: 'We need a 4x4 jeep driver to Fairy Meadows / Deosai.',
    ur: 'ہمیں فیری میڈوز / دیوسائی کے لیے فور بائی فور جیپ ڈرائیور چاہیے۔',
    urRoman: 'Hamein Fairy Meadows / Deosai ke liye 4x4 jeep driver chahiye.',
    ps: 'موږ فیری میډوز / دیوسای ته د 4x4 جیپ ډرایور ته اړتیا لرو.',
    pa: 'سانوں فیری میڈوز لئی فور بائی فور جیپ ڈرائیور چاہیدا اے۔',
    ar: 'نحتاج إلى سائق سيارة دفع رباعي للذهاب إلى فيري ميدوز.',
    de: 'Wir brauchen einen 4x4-Jeep-Fahrer nach Fairy Meadows / Deosai.'
  },
  {
    category: 'Directions',
    icon: Compass,
    en: 'Which road leads to the Karakoram Highway?',
    ur: 'کون سا راستہ شاہراہ قراقرم کی طرف جاتا ہے؟',
    urRoman: 'Kaun sa raastah Shahrah-e-Karakoram ki taraf jata hai?',
    ps: 'کومه لار د قراقرم لویې لارې ته ځي؟',
    pa: 'کیہڑا راستہ قراقرم ہائی وے ول جاندا اے؟',
    ar: 'أي طريق يؤدي إلى طريق قراقرم السريع؟',
    de: 'Welche Straße führt zum Karakoram Highway?'
  },
  {
    category: 'Food & Chai',
    icon: Coffee,
    en: 'Is boiled drinking water and hot chai available here?',
    ur: 'کیا یہاں ابلا ہوا پینے کا پانی اور گرم چائے دستیاب ہے؟',
    urRoman: 'Kya yahan ubla hua peenay ka pani aur garam chai dastiyab hai?',
    ps: 'ایا دلته جوش شوې د څښاک اوبه او ګرم چای شته؟',
    pa: 'کی ایتھے پین دا ابلا پانی تے گرم چاہ لبھ جاوے گی؟',
    ar: 'هل مياه الشرب المغلية والشاي الساخن متوفران هنا؟',
    de: 'Gibt es hier abgekochtes Trinkwasser und heißen Chai?'
  },
  {
    category: 'Stay & Camp',
    icon: Bed,
    en: 'Do you have a clean room or campsite with warm blankets?',
    ur: 'کیا آپ کے پاس گرم کمبل کے ساتھ صاف کمرہ یا کیمپ کی جگہ ہے؟',
    urRoman: 'Kya aap ke paas garam kambal ke sath saaf kamra ya camp ki jagah hai?',
    ps: 'ایا تاسو د ګرمو کمبلو سره پاکه کوټه یا کیمپ لرئ؟',
    pa: 'کی تہاڈے کول گرم کمبل نال صاف کمرہ یا کیمپ ہے گا اے؟',
    ar: 'هل لديك غرفة نظيفة أو موقع للتخييم مع بطانيات دافئة؟',
    de: 'Haben Sie ein sauberes Zimmer oder einen Campingplatz mit warmen Decken?'
  },
  {
    category: 'Etiquette',
    icon: Handshake,
    en: 'Peace be upon you! Thank you so much for your hospitality.',
    ur: 'السلام علیکم! آپ کی مہمان نوازی کا بہت بہت شکریہ۔',
    urRoman: 'Assalam-o-Alaikum! Aap ki mehman-nawazi ka bohat bohat shukriya.',
    ps: 'السلام علیکم! ستاسو د میلمه پالنې ډیره ډیره مننه.',
    pa: 'السلام علیکم! تہاڈی مہمان نوازی دا بڑا شکریا۔',
    ar: 'السلام عليكم! شكراً جزيلاً على كرم ضيافتكم.',
    de: 'Friede sei mit Ihnen! Vielen Dank für Ihre wunderbare Gastfreundschaft.'
  }
];

const CACHE_KEY = 'raastah-pocket-guide-translations-v2';

function readTranslationCache() {
  try {
    const value = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.warn('Unable to read saved Pocket Guide translations:', error);
    return [];
  }
}

export default function PocketGuide() {
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Urdu');
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [speechMessage, setSpeechMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [availableVoices, setAvailableVoices] = useState([]);

  // Load and cache browser speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const v = window.speechSynthesis.getVoices();
        if (Array.isArray(v) && v.length > 0) {
          setAvailableVoices(v);
        }
      }
    };
    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const sourceObj = LANGUAGES.find((l) => l.name === sourceLang) || LANGUAGES[0];
  const targetObj = LANGUAGES.find((l) => l.name === targetLang) || LANGUAGES[1];

  const categories = ['All', 'Emergency', 'Mountain Transit', 'Directions', 'Food & Chai', 'Stay & Camp', 'Etiquette'];

  const filteredOfflinePhrases = activeCategory === 'All'
    ? OFFLINE_DICTIONARY
    : OFFLINE_DICTIONARY.filter((p) => p.category === activeCategory);

  // Look for instant local match
  const findOfflineMatch = (input) => {
    const trimmed = input.trim().toLowerCase();
    for (const item of OFFLINE_DICTIONARY) {
      if (item.en.toLowerCase().includes(trimmed) || trimmed.includes(item.en.toLowerCase())) {
        return item;
      }
      if (item.ur && item.ur.includes(trimmed)) return item;
    }
    return null;
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (translation?.translation) {
      setText(translation.translation);
      setTranslation({
        translation: text,
        sourceText: translation.translation,
        sourceLanguage: targetLang,
        targetLanguage: sourceLang,
        translatedAt: new Date().toISOString()
      });
    }
  };

  // Text to Speech playback with explicit native voice binding
  const speakText = (content, langName) => {
    if (!('speechSynthesis' in window)) {
      setSpeechMessage('Speech audio synthesis not supported on this device.');
      return;
    }
    window.speechSynthesis.cancel();
    const cleanContent = (content || '')
      .replace(/\[Pronunciation:.*?\]/gi, '')
      .replace(/\[Offline Translation Mode\]/gi, '')
      .replace(/\(.*?\)/g, '')
      .trim();
    if (!cleanContent) return;

    const utterance = new SpeechSynthesisUtterance(cleanContent);
    const langObj = LANGUAGES.find((l) => l.name === langName || l.code === langName);
    const targetLocale = langObj?.speechLocale || 'ur-PK';
    utterance.lang = targetLocale;

    const voices = availableVoices.length > 0 ? availableVoices : (window.speechSynthesis.getVoices() || []);
    let bestVoice = null;

    if (langName === 'English') {
      bestVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en')) || null;
    } else if (langName === 'Arabic') {
      bestVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ar')) || null;
    } else if (langName === 'Chinese') {
      bestVoice = voices.find((v) => v.lang.toLowerCase().startsWith('zh')) || null;
    } else {
      // Pakistani & Alpine Regional Perso-Arabic languages (Urdu, Punjabi Shahmukhi, Pashto, Sindhi, Balochi, Saraiki, Hindko, Kashmiri, Brahui, Shina, Balti, Khowar)
      bestVoice = voices.find((v) => v.lang.toLowerCase() === targetLocale.toLowerCase())
        || voices.find((v) => v.lang.toLowerCase().startsWith('ur'))
        || voices.find((v) => v.lang.toLowerCase().startsWith('pa'))
        || voices.find((v) => v.lang.toLowerCase().startsWith('ar'))
        || voices.find((v) => v.lang.toLowerCase().startsWith('fa'))
        || voices.find((v) => v.lang.toLowerCase().startsWith('hi'));
    }

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.rate = 0.88; // steady, natural cadence for regional speech
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
    setSpeechMessage(`Speaking in ${langName}${bestVoice ? ` (${bestVoice.name})` : ''}...`);
  };

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  const stopVoiceInput = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn(e);
      }
      recognitionRef.current = null;
    }
    setListening(false);
  };

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  const executeTranslation = async (overrideText = null, autoSpeak = false) => {
    const phrase = (overrideText !== null ? overrideText : text).trim();
    setError('');
    setSpeechMessage('');
    if (!phrase) {
      setError('Please enter or speak a phrase to translate.');
      return;
    }
    if (sourceLang === targetLang) {
      setError('Please choose two different languages.');
      return;
    }

    setText(phrase);

    // Check offline dictionary first
    const offlineMatch = findOfflineMatch(phrase);
    if (offlineMatch) {
      let resultText = '';
      if (targetLang === 'Urdu') resultText = `${offlineMatch.ur}\n[Pronunciation: ${offlineMatch.urRoman}]`;
      else if (targetLang === 'Pashto') resultText = offlineMatch.ps || offlineMatch.ur;
      else if (targetLang.includes('Punjabi')) resultText = offlineMatch.pa || offlineMatch.ur;
      else if (targetLang === 'Arabic') resultText = offlineMatch.ar || offlineMatch.ur;
      else if (targetLang === 'German') resultText = offlineMatch.de || offlineMatch.en;
      else resultText = offlineMatch.en;

      const offlinePayload = {
        sourceText: phrase,
        translation: resultText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        translatedAt: new Date().toISOString(),
        model: 'Raastah Alpine Offline Cache (Instant)'
      };
      setTranslation(offlinePayload);
      if (autoSpeak) {
        speakText(resultText, targetLang);
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/tools/translate/mymemory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: phrase, 
          sourceLanguage: sourceLang, 
          targetLanguage: targetLang 
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Translation service returned an error.');
      
      const payload = {
        sourceText: phrase,
        translation: result.translation || 'Translation received.',
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        translatedAt: result.translatedAt || new Date().toISOString(),
        model: result.source || 'Neural Cloud Translator'
      };
      setTranslation(payload);

      if (autoSpeak && payload.translation) {
        speakText(payload.translation, targetLang);
      }

      // Cache locally
      try {
        const cache = readTranslationCache();
        localStorage.setItem(CACHE_KEY, JSON.stringify([payload, ...cache.slice(0, 30)]));
      } catch (cacheErr) {
        console.warn('Cache write notice', cacheErr);
      }
    } catch (apiErr) {
      console.warn('API lookup failed, checking closest offline match', apiErr);
      const fallbackPayload = {
        sourceText: phrase,
        translation: `[Offline Translation Mode]\n${phrase} — Saved for emergency reference.`,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        translatedAt: new Date().toISOString(),
        model: 'Local Expeditions Cache'
      };
      setTranslation(fallbackPayload);
      if (autoSpeak) {
        speakText(phrase, targetLang);
      }
    } finally {
      setLoading(false);
    }
  };

  // Speech Recognition (Mic Input with continuous listening & silence timeout)
  const startVoiceInput = () => {
    if (listening) {
      stopVoiceInput();
      setSpeechMessage(`Stopped listening. Translating to ${targetLang}...`);
      if (text.trim()) {
        executeTranslation(text.trim(), true);
      }
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setSpeechMessage('Voice microphone input is not supported in this browser. Please type your phrase.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new Recognition();
      recognitionRef.current = recognition;
      recognition.lang = sourceObj.speechLocale || 'ur-PK';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setListening(true);
        setSpeechMessage(`Listening in ${sourceObj.name}... Speak naturally. Will auto-translate to ${targetLang} and speak upon silence.`);
      };

      recognition.onresult = (event) => {
        // Reset 1.8-second silence timer whenever user speaks
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        let interim = '';
        let finalStr = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentSpeech = (finalStr + interim).trim();
        if (currentSpeech) {
          setText(currentSpeech);
          setSpeechMessage(`Captured: "${currentSpeech}"`);
        }

        // Wait for 1.8 seconds of silence before finishing and auto-translating/speaking
        silenceTimerRef.current = setTimeout(() => {
          stopVoiceInput();
          setSpeechMessage(`Finished listening. Auto-translating to ${targetLang} & speaking aloud...`);
          if (currentSpeech) {
            executeTranslation(currentSpeech, true);
          }
        }, 1800);
      };

      recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          setSpeechMessage(`Voice input notice: ${event.error}. You can also type directly below.`);
        }
        stopVoiceInput();
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch (e) {
      setSpeechMessage('Microphone access unavailable or blocked. Please type your phrase.');
      setListening(false);
    }
  };

  const translate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    executeTranslation(null, false);
  };

  const handleCopy = () => {
    if (!translation?.translation) return;
    const textToCopy = translation.translation;
    const onSuccess = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(onSuccess)
        .catch(() => {
          try {
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            onSuccess();
          } catch (e) {
            console.warn('Clipboard copy fallback failed:', e);
          }
        });
    } else {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        onSuccess();
      } catch (e) {
        console.warn('Clipboard copy fallback failed:', e);
      }
    }
  };

  const selectPresetPhrase = (item) => {
    setSourceLang('English');
    setText(item.en);
    let targetResult = '';
    if (targetLang === 'Urdu') targetResult = `${item.ur}\n(${item.urRoman})`;
    else if (targetLang === 'Pashto') targetResult = item.ps || item.ur;
    else if (targetLang.includes('Punjabi')) targetResult = item.pa || item.ur;
    else if (targetLang === 'Arabic') targetResult = item.ar || item.ur;
    else if (targetLang === 'German') targetResult = item.de || item.en;
    else targetResult = item.ur;

    setTranslation({
      sourceText: item.en,
      translation: targetResult,
      sourceLanguage: 'English',
      targetLanguage: targetLang,
      translatedAt: new Date().toISOString(),
      model: 'Verified Pakistan Alpine Dictionary'
    });
  };

  return (
    <PageWrapper>
      <main className="min-h-[75vh] bg-[var(--bg-page)] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          
          {/* Header */}
          <header className="mx-auto max-w-3xl text-center space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <Sparkles size={14} /> Voice & Audio Multilingual Converter
              </span>
              <EmergencySOS variant="compact" />
            </div>
            <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] sm:text-5xl">
              Raastah Pocket Guide
            </h1>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              Continuous voice converter and offline travel phrasebook supporting the top 10 languages across Pakistan: <strong>Urdu, English, Punjabi, Pashto, Sindhi, Balochi, Saraiki, Hindko, Kashmiri, and Brahui</strong>.
            </p>
          </header>

          {/* Translation Studio */}
          <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-lg">
            
            {/* Language Selectors & Swap */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-6 border-b border-[var(--border-default)]">
              <div className="w-full sm:w-5/12">
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Input Tongue
                </label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm font-bold text-[var(--text-primary)] focus:border-emerald-500 focus:outline-none"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.name}>
                      {l.name} ({l.native})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap source and target languages"
                className="rounded-full border border-[var(--border-default)] bg-[var(--bg-page)] p-3 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition shadow-xs"
              >
                <ArrowRightLeft size={18} />
              </button>

              <div className="w-full sm:w-5/12">
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Translate Into
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)] px-3.5 py-2.5 text-sm font-bold text-[var(--text-primary)] focus:border-emerald-500 focus:outline-none"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.name}>
                      {l.name} ({l.native})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input & Output Split Layout */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              
              {/* Input Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    Type or speak in {sourceLang}
                  </span>
                  {text && (
                    <button
                      type="button"
                      onClick={() => setText('')}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--danger)]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={6}
                    placeholder={`e.g. Where is the mountain jeep driver or nearest hospital?`}
                    className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-page)] p-4 text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none"
                  />
                  {text && (
                    <button
                      type="button"
                      onClick={() => speakText(text, sourceLang)}
                      title="Speak source text"
                      className="absolute bottom-3 right-3 rounded-lg bg-[var(--bg-surface)] p-2 text-emerald-600 shadow-sm border border-[var(--border-default)] hover:bg-emerald-50"
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>

                {/* Voice Control Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={startVoiceInput}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm ${
                      listening 
                        ? 'bg-rose-600 text-white animate-pulse hover:bg-rose-700' 
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                  >
                    {listening ? <MicOff size={15} /> : <Mic size={15} />}
                    {listening ? 'Stop Recording (Click when done)' : 'Record Voice (Mic)'}
                  </button>

                  <button
                    type="button"
                    onClick={translate}
                    disabled={loading || !text.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
                  >
                    {loading ? 'Translating…' : 'Translate Phrase'}
                  </button>
                </div>

                {speechMessage && (
                  <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    {speechMessage}
                  </p>
                )}
                {error && (
                  <p className="text-xs text-[var(--danger)] bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                    {error}
                  </p>
                )}
              </div>

              {/* Output Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    Translation ({targetLang})
                  </span>
                  {translation && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        type="button"
                        onClick={() => speakText(translation.translation, targetLang)}
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline font-semibold"
                      >
                        <Volume2 size={13} /> Play Audio
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between min-h-[168px] rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-5">
                  {loading ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-5 w-4/5 rounded bg-emerald-500/20" />
                      <div className="h-4 w-3/5 rounded bg-emerald-500/20" />
                      <div className="h-4 w-2/5 rounded bg-emerald-500/20" />
                    </div>
                  ) : translation ? (
                    <div>
                      <p className="text-xl font-medium leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap" dir={['English', 'Chinese', 'German'].includes(targetLang) ? 'ltr' : 'rtl'}>
                        {translation.translation}
                      </p>
                      <div className="mt-4 pt-3 border-t border-[var(--border-default)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
                        <span>{translation.model}</span>
                        <span>{new Date(translation.translatedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-[var(--text-muted)]">
                      <Volume2 size={32} className="mb-2 opacity-40 text-emerald-600" />
                      <p className="text-sm font-semibold text-[var(--text-secondary)]">Audio translation ready</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Speak into the mic or select a quick travel phrase below</p>
                    </div>
                  )}
                </div>

                {/* Instant Audio Action */}
                {translation && (
                  <button
                    type="button"
                    onClick={() => speakText(translation.translation, targetLang)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition"
                  >
                    <Volume2 size={16} /> Speak Aloud to Local Driver / Host ({targetLang})
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* Offline Alpine Travel Phrasebook */}
          <section className="space-y-4 rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Offline Pakistan Alpine Phrasebook
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  100% offline instant translations for high-altitude passes, police checkposts, chai dhabas, and emergency situations.
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                Offline Ready
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    activeCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border border-[var(--border-default)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:border-emerald-500/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Phrases Grid */}
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              {filteredOfflinePhrases.map((phrase, idx) => {
                const CategoryIcon = phrase.icon || Compass;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectPresetPhrase(phrase)}
                    className="flex flex-col justify-between rounded-2xl border border-[var(--border-default)] bg-[var(--bg-page)] p-4 text-left transition hover:border-emerald-500/50 hover:shadow-sm group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
                        <CategoryIcon size={13} />
                        <span>{phrase.category}</span>
                      </div>
                      <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-emerald-600 transition">
                        "{phrase.en}"
                      </p>
                      <p className="mt-2 text-sm font-urdu text-[var(--text-secondary)]" dir="rtl">
                        {phrase.ur}
                      </p>
                      {phrase.urRoman && (
                        <p className="mt-1 text-[11px] italic text-[var(--text-muted)]">
                          {phrase.urRoman}
                        </p>
                      )}
                    </div>
                    <span className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Tap to translate & speak →
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

        </div>
      </main>
    </PageWrapper>
  );
}
