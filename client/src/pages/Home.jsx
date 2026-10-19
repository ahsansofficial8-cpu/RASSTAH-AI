/**
 * ==============================================================================
 * RAASTAH (راستہ) — THE INTELLIGENT WAY
 * Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich
 * ==============================================================================
 * FILE: Home.jsx
 * PATH: client/src/pages/Home.jsx
 * PURPOSE: Flagship landing page featuring full-bleed fixed video background,
 *          smooth layered parallax scroll, interactive fuzzy search,
 *          curated Pakistani expeditions, live OSRM route visualizer, and verified guides.
 * ==============================================================================
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, ArrowRight, Navigation, CloudRain, Compass,
  Car, ChevronRight, Activity, DollarSign, Star, ShieldCheck, MapPin, Sparkles, CheckCircle2
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { PAKISTAN_99_LOCATIONS } from '@/data/pakistan59Locations';
import { Card, Button, Badge, EmergencySOS, TripPlannerAI } from '@/components/ui';
import DestinationImage from '@/components/ui/DestinationImage';
import { loadDestinationMedia } from '@/data/destinationImages';
import { fuzzySearchLocations } from '@/utils/fuzzySearch';
import RouteSelector from '@/components/tools/RouteSelector';
import { TOUR_PACKAGES } from '@/data/packagesData';

const HERO_VIDEOS = Object.values(import.meta.glob('../components/*.{mp4,webm,ogg}', {
  eager: true,
  query: '?url',
  import: 'default'
})).sort();

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [heroVideoIndex, setHeroVideoIndex] = useState(0);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const [heroVideoFailed, setHeroVideoFailed] = useState(false);
  const [heroFallbackUrl, setHeroFallbackUrl] = useState('');

  const searchSuggestions = searchQuery.trim().length >= 2
    ? fuzzySearchLocations(PAKISTAN_99_LOCATIONS, searchQuery).slice(0, 5)
    : [];

  const handleHeroVideoFailure = (error) => {
    console.warn('Homepage background video could not play; falling back to high-res landscape image.', error);
    setHeroVideoReady(false);
    if (heroVideoIndex < HERO_VIDEOS.length - 1) {
      setHeroVideoIndex((index) => index + 1);
    } else {
      setHeroVideoFailed(true);
    }
  };

  useEffect(() => {
    let active = true;
    loadDestinationMedia('hunza-valley')
      .then((media) => {
        if (active) setHeroFallbackUrl(media.fallbackUrl);
      })
      .catch((error) => console.error('Unable to load the Hunza hero fallback image', error));
    return () => { active = false; };
  }, []);

  // Curated 4 popular destinations for full 4-column showcase
  const popularSpots = [
    { id: 'hunza-valley', rating: 4.95, reviews: 310, startingPrice: 'PKR 45,000' },
    { id: 'shangrila-resort', rating: 4.98, reviews: 240, startingPrice: 'PKR 65,000' },
    { id: 'fairy-meadows', rating: 4.92, reviews: 180, startingPrice: 'PKR 40,000' },
    { id: 'kalam-swat', rating: 4.88, reviews: 290, startingPrice: 'PKR 35,000' }
  ].map((item) => {
    const loc = PAKISTAN_99_LOCATIONS.find((location) => location.id === item.id);
    return loc ? { ...loc, ...item } : null;
  }).filter(Boolean);

  return (
    <PageWrapper className="w-full">
      <div className="relative w-full min-h-screen text-[var(--text-primary)]">
        
        {/* ══════════════════════════════════════════════════════════════════════
            FIXED CINEMATIC VIDEO BACKGROUND (Layer 0: Pinned Behind Top Hero)
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="fixed inset-0 z-0 w-full h-full overflow-hidden pointer-events-none">
          {/* Static high-res mountain fallback image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{ 
              backgroundImage: `url(${heroFallbackUrl || '/images/destinations/hunza-valley.jpg'})`,
              opacity: heroVideoReady ? 0.3 : 1
            }} 
          />
          
          {/* Active loop video */}
          {!heroVideoFailed && HERO_VIDEOS.length > 0 && (
            <video
              key={HERO_VIDEOS[heroVideoIndex]}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
              style={{ opacity: heroVideoReady ? 0.85 : 0 }}
              src={HERO_VIDEOS[heroVideoIndex]}
              title="Pakistan Mountain Background Video"
              autoPlay
              muted
              playsInline
              loop
              preload="auto"
              tabIndex={-1}
              aria-hidden="true"
              onLoadedData={(event) => {
                event.currentTarget.play().catch(handleHeroVideoFailure);
              }}
              onPlaying={() => {
                setHeroVideoFailed(false);
                setHeroVideoReady(true);
              }}
              onError={handleHeroVideoFailure}
            />
          )}

          {/* Cinematic Dark Gradient Scrim to guarantee text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 1: HERO SECTION (Translucent / See-Through over Video)
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 w-full min-h-[92vh] flex flex-col justify-center px-4 sm:px-8 pt-28 pb-16">
          <div className="max-w-6xl mx-auto w-full">
            
            {/* Top Tagline Pill & Emergency SOS */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap items-center justify-between gap-4 mb-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold text-white shadow-lg">
                  <Sparkles size={14} className="text-amber-400 animate-pulse" />
                  <span>EXPEDITION INTELLIGENCE & MOUNTAIN NAVIGATION</span>
                </div>
                <EmergencySOS variant="prominent" />
              </div>
              <div className="font-urdu text-white/95 text-base drop-shadow-md hidden sm:block" dir="rtl">
                سفر کی باخبر شروعات، راستے کی مکمل حفاظت
              </div>
            </motion.div>

            {/* Main Headline with Staggered Entrance from Left */}
            <div className="max-w-4xl space-y-6">
              <motion.h1 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-lg"
              >
                Discover Pakistan's <br />
                <span className="italic font-normal text-amber-300">Most Breathtaking Alpine Frontiers</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-base sm:text-xl text-white/95 font-sans max-w-2xl leading-relaxed drop-shadow-md"
              >
                Real-time weather forecasts, high-altitude acclimatization advisories, verified 4x4 mountain drivers, and intelligent road navigation across all of Pakistan.
              </motion.p>

              {/* Floating Glassmorphic Search Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="pt-4 max-w-3xl"
              >
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    navigate(searchQuery ? `/destinations?search=${encodeURIComponent(searchQuery)}` : '/destinations');
                  }}
                  className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white/95 backdrop-blur-xl rounded-2xl p-2.5 shadow-2xl border border-white/50 gap-2.5"
                >
                  <div className="flex items-center flex-grow pl-3 text-slate-600">
                    <Search size={22} className="text-emerald-700 shrink-0" />
                    <input 
                      type="text"
                      role="combobox"
                      aria-autocomplete="list"
                      aria-expanded={searchSuggestions.length > 0}
                      aria-controls="home-destination-suggestions"
                      placeholder="Where do you want to explore? (Hunza, Skardu, Babusar, Swat, Passu...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none px-3 font-medium"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3.5 font-bold text-sm tracking-wide rounded-xl shrink-0 shadow-md transition-all hover:scale-[1.02]"
                  >
                    Search 99 Destinations
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate('/mood-matcher')}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-5 py-3.5 font-extrabold text-sm tracking-wide rounded-xl shrink-0 shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={16} /> Launch Vibe Matcher
                  </Button>

                  {/* Autocomplete suggestions */}
                  {searchSuggestions.length > 0 && (
                    <ul id="home-destination-suggestions" role="listbox" className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl p-2 shadow-2xl">
                      {searchSuggestions.map((destination) => (
                        <li key={destination.id} role="option" aria-selected="false">
                          <button
                            type="button"
                            onClick={() => navigate(`/destinations/${destination.id}`)}
                            className="w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                          >
                            <span className="font-semibold">{destination.name}</span>
                            <span className="text-xs text-slate-500 font-medium px-2 py-0.5 rounded-full bg-slate-100">{destination.region}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </form>

                {/* Quick search tags */}
                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-white/90 font-medium">
                  <span className="text-white/70">Popular Searches:</span>
                  {['Hunza Valley', 'Skardu & Deosai', 'Fairy Meadows', 'Kalam Swat', 'Khunjerab Pass'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => navigate(`/destinations?search=${encodeURIComponent(tag)}`)}
                      className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-105"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 2: TRAVEL PLANNING SHORTCUTS (FULL-BLEED SCREEN WIDTH)
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 w-full bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-xl border-y border-slate-200 dark:border-white/10 px-4 sm:px-8 py-8 shadow-md">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              
              <Link to="/mood-matcher" className="p-4 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/20 hover:bg-amber-500/20 transition-all flex items-center gap-3.5 group shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles size={22} />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">AI Vibe Matcher</span>
                  <span className="text-[11px] text-amber-700/80 dark:text-amber-300/80 font-medium">9-question quiz</span>
                </div>
              </Link>
              
              <Link to="/tools" className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 transition-all flex items-center gap-3.5 group shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <CloudRain size={22} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-800">Live Weather Radar</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Open-Meteo 7-day forecast</span>
                </div>
              </Link>

              <Link to="/tools" className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-300 transition-all flex items-center gap-3.5 group shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Navigation size={22} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-amber-800">Pass & Road Alerts</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Babusar, Lowari & KKH</span>
                </div>
              </Link>

              <Link to="/tools" className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 transition-all flex items-center gap-3.5 group shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <DollarSign size={22} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-800">Trip Cost Estimator</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Fuel, stays & 4x4 rates</span>
                </div>
              </Link>

              <Link to="/tools?tab=altitude" className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 transition-all flex items-center gap-3.5 group shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Activity size={22} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-blue-800">Altitude Guidance</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Acclimatization safety</span>
                </div>
              </Link>

              <Link to="/guides" className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 transition-all flex items-center gap-3.5 group shadow-sm col-span-1 sm:col-span-2 lg:col-span-1">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Car size={22} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-800">Vetted 4x4 Drivers</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Certified mountain guides</span>
                </div>
              </Link>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 3: POPULAR DESTINATIONS (FULL-BLEED SCREEN WIDTH, 4 COLUMNS FULL)
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 w-full bg-white dark:bg-slate-950 px-4 sm:px-8 py-20 border-b border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                  <Compass size={14} />
                  <span>CURATED PAKISTANI EXPEDITIONS</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-display font-bold text-slate-900 dark:text-white">
                  Popular Alpine Destinations
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
                  Hand-picked expeditions with elevation profiles, seasonal advice, and real traveler ratings.
                </p>
              </motion.div>

              <Link 
                to="/destinations" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-all hover:scale-105 shadow-md"
              >
                <span>View All 99 Destinations</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Destination Cards - All 4 Columns Cleanly Filled */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularSpots.map((spot, index) => (
                <motion.div
                  key={spot.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    hover 
                    onClick={() => navigate(`/destinations/${spot.id}`)}
                    className="h-full flex flex-col justify-between overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <DestinationImage 
                          destinationId={spot.id} 
                          alt={spot.name} 
                          locationName={spot.name} 
                          fill 
                          priority={index < 2} 
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-400 text-xs font-bold shadow-md">
                          <Star size={12} fill="currentColor" />
                          <span>{spot.rating}</span>
                          <span className="text-white/60 font-normal">({spot.reviews})</span>
                        </div>
                        {spot.elevation && (
                          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-mono font-semibold">
                            {spot.elevation}
                          </div>
                        )}
                      </div>

                      <div className="p-5 space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold block">
                          {spot.region}
                        </span>
                        <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {spot.name}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {spot.whyFamous || spot.whatsUnique}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-slate-200/60 dark:border-white/5 mt-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Estimated Budget</span>
                        <span className="font-bold text-slate-900 dark:text-white">{spot.startingPrice}</span>
                      </div>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        Dossier →
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 4: FEATURED TOUR PACKAGES (FULL-BLEED SCREEN WIDTH)
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 w-full bg-slate-50 dark:bg-slate-900/90 px-4 sm:px-8 py-20 border-b border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
                  ALL-INCLUSIVE ADVENTURES
                </span>
                <h2 className="text-3xl sm:text-5xl font-display font-bold text-slate-900 dark:text-white">
                  Curated Tour Packages
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
                  Complete itineraries with dedicated 4x4 drivers, hand-picked hotels, meals, and safety gear.
                </p>
              </div>

              <Link 
                to="/packages" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-all hover:scale-105 shadow-md"
              >
                <span>Browse All Packages</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TOUR_PACKAGES.slice(0, 3).map((pkg) => (
                <div key={pkg.id} className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 overflow-hidden shadow-lg flex flex-col justify-between hover:shadow-2xl transition-all">
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md">
                        {pkg.duration}
                      </div>
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-amber-300 text-xs font-bold">
                        ★ {pkg.rating} ({pkg.reviewsCount} reviews)
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">{pkg.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{pkg.overview}</p>
                      
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {pkg.highlights.slice(0, 3).map((h, i) => (
                          <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-100 dark:border-white/10 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">From</span>
                      <span className="font-display font-bold text-xl text-emerald-700 dark:text-emerald-400">
                        PKR {pkg.pricePKR.toLocaleString()}
                      </span>
                    </div>
                    <Button 
                      onClick={() => navigate(`/packages/${pkg.id}`)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
                    >
                      Book Tour
                    </Button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 5: WHY RAASTAH (FULL-BLEED SCREEN WIDTH)
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 w-full bg-white dark:bg-slate-950 px-4 sm:px-8 py-20 border-b border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mb-12"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
                ENGINEERED FOR THE MOUNTAINS
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-bold text-slate-900 dark:text-white leading-tight">
                Travel planning engineered <br />
                <span className="italic font-normal text-emerald-700 dark:text-emerald-400">for real Pakistani terrain.</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                Mountain expeditions in the Karakorams, Himalayas, and Hindu Kush demand precise, altitude-aware intelligence. Raastah synthesizes live feeds with local mountain expertise.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              
              <Link to="/tools?tab=altitude" className="p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 space-y-4 hover:border-emerald-500 hover:shadow-xl transition-all group block shadow-xs">
                <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Activity size={26} />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white group-hover:text-emerald-700 transition-colors">
                  Altitude Acclimatization Guidance
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Automatic elevation profiling for routes crossing 2,500m+. Recommended staging nights at Naran, Hunza, and Skardu to prevent Acute Mountain Sickness (AMS).
                </p>
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 pt-2">
                  <span>Explore Altitude Engine</span>
                  <ChevronRight size={15} />
                </div>
              </Link>

              <Link to="/tools" className="p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 space-y-4 hover:border-amber-500 hover:shadow-xl transition-all group block shadow-xs">
                <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Navigation size={26} />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white group-hover:text-amber-700 transition-colors">
                  Community Road & Pass Reports
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Real-time crowdsourced reports from fellow expeditioners on Babusar Pass, Lowari Tunnel, Shangla Pass, and the Karakoram Highway with instant verification.
                </p>
                <div className="text-xs font-bold text-amber-600 flex items-center gap-1 pt-2">
                  <span>View Live Road Reports</span>
                  <ChevronRight size={15} />
                </div>
              </Link>

              <Link to="/destinations" className="p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 space-y-4 hover:border-emerald-500 hover:shadow-xl transition-all group block shadow-xs">
                <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Car size={26} />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white group-hover:text-emerald-700 transition-colors">
                  4x4 Vehicle Advisory
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Clear specifications on which trails require high-clearance 4WD (Deosai, Fairy Meadows, Kumrat) versus paved sedan accessibility, preventing mechanical breakdowns.
                </p>
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 pt-2">
                  <span>Check Destination Vehicles</span>
                  <ChevronRight size={15} />
                </div>
              </Link>

            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 6: ROUTE & MOUNTAIN INTELLIGENCE (FULL-BLEED SCREEN WIDTH)
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 w-full bg-slate-50 dark:bg-slate-900/90 px-4 sm:px-8 py-20 border-b border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
              
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-5 space-y-4"
              >
                <Badge variant="primary" className="text-xs font-bold">Live OSRM Routing Engine</Badge>
                <h3 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white">
                  Plan Your Mountain Drive <br />
                  <span className="italic font-normal text-emerald-700 dark:text-emerald-400">Precision Road Estimates</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Search any Pakistani city, town, or mountain pass. Get instant OSRM driving distance, calculated travel durations, and alternate pass routes across the national highway network.
                </p>

                <div className="pt-2 space-y-2.5 text-xs text-slate-800 dark:text-slate-200">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-xs">
                    <span className="font-semibold flex items-center gap-2">
                      <MapPin size={15} className="text-emerald-600" />
                      Highway & Pass Distance
                    </span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">OSRM Live</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-xs">
                    <span className="font-semibold flex items-center gap-2">
                      <Navigation size={15} className="text-amber-600" />
                      Alternate Route Options
                    </span>
                    <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">Calculated</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-xs">
                    <span className="font-semibold flex items-center gap-2">
                      <ShieldCheck size={15} className="text-emerald-600" />
                      OpenStreetMap Data
                    </span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">100% Free API</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={() => navigate('/tools')} className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white">
                    Open Full Multi-Modal Suite
                  </Button>
                </div>
              </motion.div>

              <div className="lg:col-span-7">
                <div className="relative rounded-3xl overflow-hidden aspect-[16/10] border border-slate-200 dark:border-white/10 bg-slate-100 shadow-xl">
                  <DestinationImage destinationId="passu-cones" alt="Passu Cones mountain highway" locationName="Passu Pakistan" fill priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-6">
                    <div className="text-white space-y-1">
                      <div className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
                        Karakoram Highway (KKH)
                      </div>
                      <div className="font-display font-bold text-xl">
                        Passu Cathedral Cones — The Iconic Road to Khunjerab
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* FULL WIDTH ROUTE SELECTOR COMPONENT */}
            <div className="w-full mt-8 pt-8 border-t border-slate-200 dark:border-white/10">
              <RouteSelector />
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 7: VERIFIED LOCAL 4x4 DRIVERS & GUIDES (FULL-BLEED SCREEN WIDTH)
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 w-full bg-white dark:bg-slate-950 px-4 sm:px-8 py-20 border-b border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
                  VETTED LOCAL DIRECTORY
                </span>
                <h2 className="text-3xl sm:text-5xl font-display font-bold text-slate-900 dark:text-white">
                  Certified 4x4 Drivers & Mountain Guides
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Licensed mountain specialists with verified commercial driving licenses, mechanical experience, and local heritage knowledge.
                </p>
              </div>

              <Link to="/guides" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                <span>Browse All Guides</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Sher Khan Hunzai', region: 'Hunza & Khunjerab', vehicle: 'Toyota Land Cruiser 4WD', rating: 4.95, trips: 140, status: 'Verified' },
                { name: 'Ali Raza Balti', region: 'Skardu & Deosai Safari', vehicle: 'Toyota Prado V6 4x4', rating: 5.0, trips: 210, status: 'Verified' },
                { name: 'Kashif Mehmood', region: 'Swat, Kalam & Kumrat', vehicle: 'Hiace Grand Cabin 4WD', rating: 4.88, trips: 95, status: 'Verified' }
              ].map((driver, dIdx) => (
                <div key={dIdx} className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 shadow-sm flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-base">{driver.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        {driver.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{driver.region} · {driver.vehicle}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold pt-1">
                      <Star size={13} className="fill-amber-500 text-amber-500" />
                      <span>{driver.rating}</span>
                      <span className="text-slate-400 font-normal">({driver.trips} completed expeditions)</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/guides')}
                    className="text-xs font-bold shrink-0"
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 7.5: 1-CLICK AI TRIP PLANNER (GEMINI STRUCTURED ITINERARY)
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 w-full bg-slate-50 dark:bg-slate-900/90 px-4 sm:px-8 py-20 border-b border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto">
            <TripPlannerAI />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 8: FINAL CALL TO ACTION (FULL-BLEED SCREEN WIDTH)
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 w-full bg-slate-900 px-4 sm:px-8 py-20 text-white border-b border-white/10">
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-950 p-10 sm:p-16 text-center shadow-2xl relative overflow-hidden border border-white/20">
            <div className="relative z-10 space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                EXPEDITION INTELLIGENCE & BOOKING
              </span>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-tight">
                From the first search <br />
                <span className="italic font-normal text-amber-300">to the final mountain summit.</span>
              </h2>
              <p className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto leading-relaxed">
                Empowering travelers with real-time route weather, certified 4x4 drivers, and comprehensive mountain dossiers across Pakistan.
              </p>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <Button 
                  onClick={() => navigate('/destinations')}
                  className="bg-white text-emerald-900 hover:bg-slate-100 font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-lg hover:scale-105 transition-all"
                >
                  Explore Pakistan Atlas
                </Button>
                <Button 
                  onClick={() => navigate('/packages')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-lg hover:scale-105 transition-all"
                >
                  Book Tour Packages
                </Button>
              </div>

              {/* Contact Bar */}
              <div className="pt-6 border-t border-white/15 mt-6">
                <p className="text-xs uppercase tracking-widest text-white/50 font-bold mb-4">Get in Touch — Reach Us Directly</p>
                <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
                  {/* Email */}
                  <a 
                    href="mailto:ahsansofficial8@gmail.com"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all hover:scale-105 backdrop-blur-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 shrink-0"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    <span>ahsansofficial8@gmail.com</span>
                  </a>

                  {/* WhatsApp */}
                  <a 
                    href="https://wa.me/923436030463?text=Salam%20Ahsan,%20I%20visited%20Raastah%20and%20want%20to%20connect!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-white text-xs font-semibold transition-all hover:scale-105 backdrop-blur-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-400 shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    <span>+92 343 6030463</span>
                  </a>

                  {/* LinkedIn */}
                  <a 
                    href="https://www.linkedin.com/in/ahsan-warraich-1ab016405/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-white text-xs font-semibold transition-all hover:scale-105 backdrop-blur-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-sky-400 shrink-0"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    <span>Ahsan Warraich</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageWrapper>
  );
}
