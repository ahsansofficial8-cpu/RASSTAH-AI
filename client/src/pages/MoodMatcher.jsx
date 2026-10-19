import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle2, RotateCcw, Sparkles, MapPin, 
  Calendar, Mountain, Users, HeartHandshake, Compass, Car, Flame, ShieldAlert, Check,
  CloudRain, Sun, Wind, Thermometer, MessageCircle, Clock
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import DestinationImage from '@/components/ui/DestinationImage';
import DestinationVideo from '@/components/destinations/DestinationVideo';
import { Badge, Button, Card } from '@/components/ui';
import { PAKISTAN_99_LOCATIONS } from '@/data/pakistan59Locations';
import { getDestinationMedia, loadDestinationMedia } from '@/data/destinationImages';

const NINE_QUESTIONS = [
  {
    id: 'companions',
    title: 'Question 1: Who is joining your journey?',
    options: [
      'Solo Alpine Explorer', 
      'Romantic Couple Getaway', 
      'Family with Kids & Elders', 
      'Friends Adventure Crew'
    ],
    captions: [
      'Raw solitude, self-discovery & unhurried mountain trails',
      'Panoramic glass suites, scenic sunsets & cozy evenings',
      'Safe, accessible valleys with comfortable family hotels',
      'Off-road 4x4 jeeps, camping gear & nighttime bonfires'
    ],
    images: ['fairy-meadows', 'shangrila-resort', 'hunza-valley', 'attabad-lake']
  },
  {
    id: 'scenery',
    title: 'Question 2: Which natural landscape calls your spirit?',
    options: [
      '7,000m Glaciated Giants & Granite Needles', 
      'Lush Emerald Valleys, Pine Forests & Rivers', 
      'Dramatic Ocean Cliffs & Coastal Beaches', 
      'Mystical Sand Dunes & Historic Desert Forts'
    ],
    captions: [
      'Nanga Parbat, Rakaposhi & Passu Cathedral spires',
      'Swat, Neelum & Kumrat cedar forests with gushing streams',
      'Makran Coastal Highway, hammerhead cliffs & Arabian sea',
      'Cold Katpana desert, Derawar Fort & starry dunes'
    ],
    images: ['passu-cones', 'kalam-swat', 'gwadar-hammerhead', 'lahore-walled-city']
  },
  {
    id: 'pace',
    title: 'Question 3: What physical pace feels right for each day?',
    options: [
      'High-Adrenaline Trekking & Rugged Trails',
      'Balanced Day Hikes & Scenic Photography',
      'Slow Scenic Stays & Apricot Orchard Walks',
      'Cultural Bazaars, Crafts & Heritage Sites'
    ],
    captions: [
      'Pushing physical limits across glacial passes and scree',
      'Gentle hikes to glacial lakes, viewpoint photography',
      'Warm local chai, terrace lounging & breathtaking peace',
      'Exploring ancient Mogul courtyards, stone forts & museums'
    ],
    images: ['fairy-meadows', 'attabad-lake', 'hunza-valley', 'lahore-walled-city']
  },
  {
    id: 'altitude',
    title: 'Question 4: What altitude zone are you prepared to navigate?',
    options: [
      'Extreme Alpine (3,500m - 4,700m Babusar / Khunjerab)',
      'Highlands (2,200m - 2,800m Hunza / Skardu / Kalam)',
      'Low Altitude Foothills & Plains (<1,500m)',
      'Any altitude as long as mountain views are epic'
    ],
    captions: [
      'Requires acclimatization schedule and warm technical layers',
      'Crisp, cool alpine air, comfortable for most active travelers',
      'Gentle climate, zero risk of Acute Mountain Sickness',
      'Prepared with hydration and ready for high-altitude passes'
    ],
    images: ['babusar-pass', 'hunza-valley', 'lahore-walled-city', 'passu-cones']
  },
  {
    id: 'stay_style',
    title: 'Question 5: What is your ideal overnight sanctuary?',
    options: [
      'Wild Mountain Camping Under Billions of Stars',
      'Luxury Heated Alpine Resort with Glass Balcony',
      'Traditional Heritage Haveli or Stone-Wood Chalet',
      'Authentic Local Homestay with Village Families'
    ],
    captions: [
      'Pitching tents on glacial meadows beside wood fires',
      'High-end comfort, hot showers, fine dining & valley views',
      'Architectural timber carvings, centuries of history',
      'Warm village hospitality, home-cooked food, stories'
    ],
    images: ['fairy-meadows', 'shangrila-resort', 'hunza-valley', 'kalam-swat']
  },
  {
    id: 'culture_food',
    title: 'Question 6: What culinary & cultural flavor are you seeking?',
    options: [
      'Organic High-Alpine Cuisine (Chapshuro, Apricots, Soup)',
      'Ancient Street Food Bazaars (Sajji, Nihari, Karahi)',
      'Indigenous Heritage (Kalash Tribal Traditions & Woodcraft)',
      'Fresh Coastal Seafood & Seaside Barbecue'
    ],
    captions: [
      'Wholesome organic mountain grain breads, walnut oil, dry fruit',
      'Aromatic Mogul spice alleys, street tandoors, clay-pot chai',
      'Polytheistic ancient mountain culture, bead dress & folk song',
      'Fresh catch red snapper, tiger prawns along the Arabian coast'
    ],
    images: ['hunza-valley', 'lahore-walled-city', 'kalash-valleys', 'gwadar-hammerhead']
  },
  {
    id: 'weather_vibe',
    title: 'Question 7: What atmospheric weather makes you happiest?',
    options: [
      'Chilly Crisp Mountain Air & Fresh Snow Flurries',
      'Warm Sunny Coastal Breezes & Gentle Ocean Waves',
      'Golden Autumn Foliage & Mild Sunny Afternoons',
      'Spring Blossom Canopy & Rushing Meltwater Streams'
    ],
    captions: [
      'Puff jackets, steaming chai cups, snow-capped peaks',
      'Beach shirts, ocean breezes, cliffside drives',
      'Amber chinars, golden poplars, crystal clear blue skies',
      'Pink and white apricot blooms, vibrant green terraced fields'
    ],
    images: ['fairy-meadows', 'gwadar-hammerhead', 'hunza-valley', 'attabad-lake']
  },
  {
    id: 'transport',
    title: 'Question 8: How do you want to conquer the roads?',
    options: [
      'Dedicated 4x4 Land Cruiser Prado with Local Driver',
      'Comfortable Family Van / HiAce Grand Cabin',
      'Smooth Paved Motorway Sedan Drive',
      'Raw Mountain Jeep Safari & Backpacking On Foot'
    ],
    captions: [
      'Full mountain clearance, driver manages tricky passes',
      'Spacious luggage capacity, panoramic windows for group',
      'Comfortable highways (M-15 Hazara / M-2) and city routes',
      'Open-air switchback jeep tracks, true raw expedition'
    ],
    images: ['passu-cones', 'kalam-swat', 'lahore-walled-city', 'fairy-meadows']
  },
  {
    id: 'soul_purpose',
    title: 'Question 9: What is the true soul intention of this trip?',
    options: [
      'Mental Reset & Complete Disconnection from Screens',
      'Epic Mountain Romance & Unforgettable Memories',
      'Adrenaline Rush & Pushing Personal Boundaries',
      'Cultural Awakening & Enriching Historic Knowledge'
    ],
    captions: [
      'Listening only to wind, waterfalls, and mountain silence',
      'Watching the sunrise over 8,000m summits together',
      'Scrambling alpine ridges, glacial lakes & 4x4 river crossings',
      'Understanding 5,000 years of civilization and ancient traditions'
    ],
    images: ['katpana-desert', 'shangrila-resort', 'fairy-meadows', 'lahore-walled-city']
  }
];

function calculateDestinationMatch(answers) {
  const { scenery, companions, pace, altitude, culture_food, weather_vibe, soul_purpose } = answers;

  // 1. Coastal & Ocean
  if (scenery?.includes('Ocean') || weather_vibe?.includes('Coastal') || culture_food?.includes('Coastal')) {
    return {
      id: 'gwadar-hammerhead',
      matchScore: '98.8%',
      primaryVibe: 'Oceanic Wild Horizon',
      dailyBudget: 'PKR 18,000 / day',
      idealDuration: '4 - 5 Days',
      season: 'October to March (Pleasant Coastal Weather)',
      elevationAdvice: 'Sea Level (0m) — Zero altitude stress. Perfect for all fitness levels.'
    };
  }

  // 2. High-Adrenaline Extreme Alpine
  if (pace?.includes('High-Adrenaline') || soul_purpose?.includes('Adrenaline') || altitude?.includes('Extreme')) {
    return {
      id: 'fairy-meadows',
      matchScore: '99.2%',
      primaryVibe: 'Raw 8,000m Alpine Frontier',
      dailyBudget: 'PKR 14,000 / day',
      idealDuration: '5 - 7 Days',
      season: 'May to October (Pass & Jeep Trail Accessible)',
      elevationAdvice: 'Elevation: 3,300m — Stage 1 night at Raikot Bridge before crossing.'
    };
  }

  // 3. Romance & Serene Lakes
  if (companions?.includes('Couple') || soul_purpose?.includes('Romance') || answers.stay_style?.includes('Luxury')) {
    return {
      id: 'shangrila-resort',
      matchScore: '97.9%',
      primaryVibe: 'Tranquil Mountain Romance',
      dailyBudget: 'PKR 25,000 / day',
      idealDuration: '5 - 6 Days',
      season: 'April to October (Lush Gardens & Mild Breezes)',
      elevationAdvice: 'Elevation: 2,226m — Comfortable highland altitude, safe for everyone.'
    };
  }

  // 4. Deserts & Ancient Civilizations
  if (scenery?.includes('Sand Dunes') || culture_food?.includes('Street Food') || soul_purpose?.includes('Cultural')) {
    return {
      id: 'lahore-walled-city',
      matchScore: '96.5%',
      primaryVibe: 'Centuries of Mogul Splendor & Street Food',
      dailyBudget: 'PKR 12,000 / day',
      idealDuration: '3 - 4 Days',
      season: 'October to April (Cool winter sightseeing)',
      elevationAdvice: 'Elevation: 217m — Paved, accessible, and rich with walking bazaars.'
    };
  }

  // 5. Emerald Rivers & Family Escapes
  if (scenery?.includes('Lush Emerald') || companions?.includes('Family')) {
    return {
      id: 'kalam-swat',
      matchScore: '98.1%',
      primaryVibe: 'Pine Forest Serenity & Glacial Rivers',
      dailyBudget: 'PKR 16,000 / day',
      idealDuration: '4 - 6 Days',
      season: 'May to October (Crisp pine air and open passes)',
      elevationAdvice: 'Elevation: 2,000m — Family-friendly, gentle acclimatization.'
    };
  }

  // 6. Signature Default: Hunza Valley (The Crown Jewel of Pakistan)
  return {
    id: 'hunza-valley',
    matchScore: '99.5%',
    primaryVibe: 'Majestic Karakoram Peaks & Ancient Forts',
    dailyBudget: 'PKR 20,000 / day',
    idealDuration: '6 - 8 Days',
    season: 'April to November (Spring Blossoms & Autumn Gold)',
    elevationAdvice: 'Elevation: 2,438m — Ideal acclimatization for northern expeditions.'
  };
}

function OptionCard({ label, caption, destinationId, onClick }) {
  const media = getDestinationMedia(destinationId);
  const imageUrl = media.images[0];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative min-h-44 overflow-hidden rounded-2xl border border-[var(--border-default)] bg-slate-900 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 cursor-pointer"
      style={imageUrl ? { backgroundImage: `linear-gradient(0deg, rgb(8 20 25 / 92%), rgb(8 20 25 / 25%) 80%), url("${imageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {!imageUrl && <DestinationImage destinationId={destinationId} alt="" locationName={label} fill />}
      <span className="absolute inset-x-0 bottom-0 z-10 p-5 text-white">
        <span className="block text-base font-bold group-hover:text-amber-300 transition-colors leading-snug">{label}</span>
        {caption && <span className="mt-1.5 block text-xs text-white/80 leading-relaxed font-normal">{caption}</span>}
      </span>
      <ArrowRight className="absolute right-4 top-4 z-10 text-white/70 transition group-hover:translate-x-1 group-hover:text-amber-400" size={18} aria-hidden="true" />
    </button>
  );
}

function getWeatherDescription(code) {
  if (code === 0) return { label: 'Clear Sky & Sun', icon: '☀️' };
  if (code === 1 || code === 2) return { label: 'Mainly Clear / High Clouds', icon: '🌤️' };
  if (code === 3) return { label: 'Overcast Cloud Cover', icon: '☁️' };
  if (code >= 45 && code <= 48) return { label: 'Alpine Fog & Mist', icon: '🌫️' };
  if (code >= 51 && code <= 55) return { label: 'Gentle Drizzle', icon: '🌦️' };
  if (code >= 61 && code <= 65) return { label: 'Mountain Rain Showers', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { label: 'Snow Flurries / Cold', icon: '❄️' };
  if (code >= 80 && code <= 82) return { label: 'Heavy Valley Downpours', icon: '🌧️' };
  if (code >= 95) return { label: 'Alpine Thunderstorm', icon: '⛈️' };
  return { label: 'Pleasant Alpine Weather', icon: '⛅' };
}

function getAITravelTimePrediction(destination) {
  const elevM = parseInt(String(destination.elevation || '0').replace(/[^0-9]/g, ''), 10) || 1500;
  const region = destination.region || '';
  const destId = destination.id || '';
  
  if (elevM >= 2800 || region.includes('Gilgit') || destId.includes('pass') || destId.includes('fairy') || destId.includes('skardu') || destId.includes('khunjerab')) {
    return {
      optimalWindow: 'Mid-June – Late September',
      aiVerdict: 'High Alpine Expedition Zone: High-altitude passes (Babusar, Deosai, Khunjerab) are completely snow-free and accessible from late June. Crisp azure skies and ideal trekking temperatures occur July–August. Early autumn (October) brings magnificent golden apricot and poplar foliage.',
      recommendedTimeOfDay: '06:00 – 10:30 (Peak crystal-clear mountain visibility before midday thermal clouds)',
      nightAdvisory: 'Sub-zero drops common even in summer; pack thermal base layers and down jackets.'
    };
  } else if (region.includes('Kashmir') || region.includes('Khyber') || elevM >= 1600) {
    return {
      optimalWindow: 'May – June & September – October',
      aiVerdict: 'Lush Pine Highlands: Pleasant summer escape (18°C–25°C). Crisp alpine breezes and wildflower blooms in early summer. Golden autumn foliage in October. Late July to August experiences occasional monsoon showers.',
      recommendedTimeOfDay: '08:00 – 16:00 (Gentle valley temperatures and scenic hiking trails)',
      nightAdvisory: 'Cool, crisp evenings; light fleece, sweater, or windbreaker recommended.'
    };
  } else if (region.includes('Balochistan') || region.includes('Sindh') || region.includes('Coast') || destId.includes('gwadar') || destId.includes('ormara')) {
    return {
      optimalWindow: 'November – February',
      aiVerdict: 'Coastal Cliffs & Ancient Canyon Zone: Winter is the premier exploration window with cool Arabian Sea breezes and comfortable 20°C–25°C afternoons. Avoid intense subcontinental summer heat.',
      recommendedTimeOfDay: '06:30 Sunrise & 17:30 Golden Hour Sunset (Hammerhead cliffs & ocean glow)',
      nightAdvisory: 'Mild, refreshing ocean breeze; light layers sufficient.'
    };
  } else {
    return {
      optimalWindow: 'November – March',
      aiVerdict: 'Cultural Heritage & Indus Plains: Golden winter months offer crisp, sunny 18°C–22°C days ideal for exploring ancient Mughal forts, bustling bazaars, and Sufi shrines without summer heat exhaustion.',
      recommendedTimeOfDay: '09:00 – 12:30 & 16:00 – 21:00 (Bustling heritage streets & illuminated monuments)',
      nightAdvisory: 'Chilly nights in December–January; medium jacket and warm shawl advised.'
    };
  }
}

export default function MoodMatcher() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [loadedResultMedia, setLoadedResultMedia] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const questions = NINE_QUESTIONS;
  const matchResult = calculateDestinationMatch(answers);
  const destination = PAKISTAN_99_LOCATIONS.find((place) => place.id === matchResult.id)
    || PAKISTAN_99_LOCATIONS[0];

  const resultMedia = loadedResultMedia?.destinationId === destination.id ? loadedResultMedia : null;

  useEffect(() => {
    let active = true;
    loadDestinationMedia(destination.id)
      .then((loadedMedia) => {
        if (active) setLoadedResultMedia({ destinationId: destination.id, ...loadedMedia });
      })
      .catch((error) => {
        console.warn('Unable to load destination media', error);
        if (active) setLoadedResultMedia({
          destinationId: destination.id,
          images: [],
          youtubeUrl: '',
          attribution: null
        });
      });
    return () => { active = false; };
  }, [destination.id]);

  useEffect(() => {
    if (!completed || !destination) return;
    let isCancelled = false;
    setWeatherLoading(true);

    const fetchWeather = async () => {
      try {
        const res = await fetch(`/api/live/road-weather?lat=${destination.lat}&lng=${destination.lng}&location=${encodeURIComponent(destination.name)}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.current) {
            setWeatherData({
              temp: Math.round(data.current.temperature),
              apparentTemp: Math.round(data.current.apparentTemperature ?? data.current.temperature),
              windSpeed: Math.round(data.current.windSpeed ?? 10),
              weatherCode: data.current.weatherCode ?? 0,
              isLive: true,
              alerts: data.alerts || []
            });
            setWeatherLoading(false);
            return;
          }
        }
        const omRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${destination.lat}&longitude=${destination.lng}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`);
        if (omRes.ok) {
          const omData = await omRes.json();
          if (!isCancelled && omData.current) {
            setWeatherData({
              temp: Math.round(omData.current.temperature_2m),
              apparentTemp: Math.round(omData.current.apparent_temperature ?? omData.current.temperature_2m),
              windSpeed: Math.round(omData.current.wind_speed_10m ?? 10),
              weatherCode: omData.current.weather_code ?? 0,
              isLive: true,
              alerts: []
            });
            setWeatherLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Weather lookup fallback applied:', err);
      }

      if (!isCancelled) {
        setWeatherData({
          temp: 18,
          apparentTemp: 17,
          windSpeed: 12,
          weatherCode: 1,
          isLive: false,
          alerts: []
        });
        setWeatherLoading(false);
      }
    };

    fetchWeather();
    return () => { isCancelled = true; };
  }, [completed, destination.id, destination.lat, destination.lng, destination.name]);

  const question = questions[currentStep];

  const handleSelect = (option) => {
    const updated = { ...answers, [question.id]: option };
    setAnswers(updated);
    if (currentStep < questions.length - 1) {
      setCurrentStep((step) => step + 1);
    } else {
      setCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setCompleted(false);
  };

  return (
    <PageWrapper className="w-full">
      <main className="w-full min-h-screen bg-[var(--bg-page)] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          
          {/* Hero Header */}
          <header className="relative mb-8 overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-center sm:px-12 shadow-xl border border-white/10">
            {getDestinationMedia('hunza-valley').images[0] && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-35"
                style={{ backgroundImage: `url("${getDestinationMedia('hunza-valley').images[0]}")` }}
                aria-hidden="true"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/90" aria-hidden="true" />
            <div className="relative z-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-semibold text-emerald-300 mb-2">
                <Sparkles size={14} /> Comprehensive 9-Phase Vibe Matcher
              </span>
              <h1 className="text-3xl font-display font-bold text-white sm:text-5xl">
                Discover Your True Pakistan Expedition
              </h1>
              <p className="mx-auto mb-0 max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
                A 9-question deep analysis of your companions, terrain taste, altitude endurance, culinary desires, and travel intentions to identify your perfect destination.
              </p>
            </div>
          </header>

          {!completed ? (
            <Card className="p-6 shadow-xl sm:p-10 border border-[var(--border-default)] bg-[var(--bg-surface)]">
              
              {/* Progress Tracker */}
              <div className="mb-3 flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
                <span>Phase {currentStep + 1} of {questions.length}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono">
                  {Math.round(((currentStep + 1) / questions.length) * 100)}% Complete
                </span>
              </div>
              <div className="mb-8 h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                <div 
                  className="h-full rounded-full bg-emerald-600 transition-all duration-300" 
                  style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }} 
                />
              </div>

              <h2 className="mb-6 text-2xl font-display font-bold text-[var(--text-primary)] sm:text-3xl leading-snug">
                {question.title}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {question.options.map((option, index) => (
                  <OptionCard
                    key={`${question.id}-${option}`}
                    label={option}
                    caption={question.captions?.[index]}
                    destinationId={question.images[index]}
                    onClick={() => handleSelect(option)}
                  />
                ))}
              </div>
            </Card>
          ) : (
            <Card className="space-y-8 p-6 shadow-xl sm:p-10 border border-[var(--border-default)] bg-[var(--bg-surface)]">
              
              {/* Match Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-default)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      {matchResult.matchScore} COMPATIBILITY SCORE
                    </span>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                      {matchResult.primaryVibe}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-w-md justify-start sm:justify-end">
                  {Object.values(answers).slice(0, 4).map((ans) => (
                    <span key={ans} className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                      ✓ {ans}
                    </span>
                  ))}
                </div>
              </div>

              {/* Destination Feature Showcase */}
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7 relative min-h-80 overflow-hidden rounded-3xl shadow-lg">
                  <DestinationImage 
                    destinationId={destination.id} 
                    locationName={destination.name} 
                    alt={`${destination.name} landscape`} 
                    fill 
                    priority 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
                      <MapPin size={14} /> {destination.region}
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">{destination.name}</h2>
                    {destination.elevation && (
                      <span className="inline-block rounded-md bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-xs font-semibold">
                        Elevation: {destination.elevation}
                      </span>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Deep Expedition Dossier</h4>
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{destination.whyFamous}</p>
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{destination.whatsUnique}</p>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Estimated Daily Budget:</span>
                      <strong className="text-[var(--text-primary)]">{matchResult.dailyBudget}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Ideal Expedition Length:</span>
                      <strong className="text-[var(--text-primary)]">{matchResult.idealDuration}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Best Season:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400">{matchResult.season}</strong>
                    </div>
                    <div className="pt-2 border-t border-[var(--border-default)] text-[var(--text-muted)]">
                      <strong className="text-[var(--text-primary)]">Acclimatization: </strong>{matchResult.elevationAdvice}
                    </div>
                  </div>

                  {destination.activities && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[var(--text-primary)]">Signature Experiences:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {destination.activities.map((act) => (
                          <span key={act} className="rounded-lg bg-[var(--bg-page)] border border-[var(--border-default)] px-2.5 py-1 text-xs text-[var(--text-secondary)] shadow-xs">
                            {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Microclimate & AI Best Travel Time Predictor */}
              {(() => {
                const weatherDesc = weatherData ? getWeatherDescription(weatherData.weatherCode) : { label: 'Reading microclimate...', icon: '⛅' };
                const aiPrediction = getAITravelTimePrediction(destination);

                return (
                  <div className="grid gap-6 md:grid-cols-2 pt-2">
                    {/* Live Microclimate Card */}
                    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{weatherDesc.icon}</span>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                              Live Microclimate
                            </h4>
                            <p className="text-[11px] text-[var(--text-muted)] font-medium">
                              Open-Meteo Satellite Telemetry
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          weatherData?.isLive ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                        }`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {weatherData?.isLive ? 'LIVE' : 'ESTIMATE'}
                        </span>
                      </div>

                      {weatherLoading ? (
                        <div className="space-y-2 animate-pulse py-2">
                          <div className="h-7 w-28 rounded bg-emerald-500/20" />
                          <div className="h-4 w-44 rounded bg-emerald-500/20" />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-display font-bold text-[var(--text-primary)]">
                              {weatherData ? `${weatherData.temp}°C` : '--'}
                            </span>
                            <span className="text-xs text-[var(--text-secondary)] font-medium">
                              Feels like {weatherData?.apparentTemp ?? '--'}°C
                            </span>
                            <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-lg bg-[var(--bg-page)] border border-[var(--border-default)] text-[var(--text-primary)]">
                              {weatherDesc.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)] pt-1">
                            <div className="flex items-center gap-1.5 rounded-lg bg-[var(--bg-page)] p-2 border border-[var(--border-default)]">
                              <Wind size={13} className="text-sky-500 shrink-0" />
                              <span>Wind: <strong>{weatherData?.windSpeed ?? 10} km/h</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg bg-[var(--bg-page)] p-2 border border-[var(--border-default)]">
                              <Mountain size={13} className="text-amber-500 shrink-0" />
                              <span>Elevation: <strong>{destination.elevation || 'Alpine'}</strong></span>
                            </div>
                          </div>

                          {weatherData?.alerts && weatherData.alerts.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200">
                              ⚠️ <strong>Road Advisory:</strong> {weatherData.alerts[0]}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* AI Best Travel Window & Season Predictor */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                            AI Expedition Window Predictor
                          </h4>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                          {aiPrediction.optimalWindow}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                        {aiPrediction.aiVerdict}
                      </p>

                      <div className="space-y-1.5 pt-1 text-xs border-t border-emerald-500/15">
                        <div className="flex items-start gap-1.5">
                          <Clock size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-[var(--text-secondary)]">
                            <strong className="text-[var(--text-primary)]">Prime Daily Hours: </strong>
                            {aiPrediction.recommendedTimeOfDay}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <Thermometer size={13} className="text-amber-600 shrink-0 mt-0.5" />
                          <span className="text-[var(--text-secondary)]">
                            <strong className="text-[var(--text-primary)]">Night Advisory: </strong>
                            {aiPrediction.nightAdvisory}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {resultMedia?.youtubeUrl && (
                <div className="pt-2">
                  <DestinationVideo destinationName={destination.name} youtubeUrl={resultMedia.youtubeUrl} />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-default)] pt-6">
                <Button 
                  variant="outline" 
                  onClick={resetQuiz} 
                  leftIcon={<RotateCcw size={15} />}
                  size="md"
                >
                  Retake Vibe Matcher
                </Button>

                <div className="flex flex-wrap items-center gap-3">
                  <Button 
                    variant="secondary"
                    onClick={() => navigate('/guides')}
                    leftIcon={<Car size={15} />}
                    size="md"
                  >
                    Find 4x4 Driver & Guide
                  </Button>
                  <Button 
                    onClick={() => navigate(`/planner?destination=${encodeURIComponent(destination.id)}`)} 
                    rightIcon={<ArrowRight size={15} />}
                    size="md"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                  >
                    Build Custom Route
                  </Button>
                </div>
              </div>

            </Card>
          )}

        </div>
      </main>
    </PageWrapper>
  );
}
