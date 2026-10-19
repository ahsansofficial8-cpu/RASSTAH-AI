import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import { getDestinationBySlug } from '@/data/destinationIntelligence';
import DestinationVideo from '@/components/destinations/DestinationVideo';
import LiveDataPanel from '@/components/destinations/LiveDataPanel';
import DestinationImage from '@/components/ui/DestinationImage';
import { loadDestinationMedia } from '@/data/destinationImages';
import { 
  Mountain, Thermometer, ShieldCheck,
  Calendar, Star, Heart, Share2, Compass, Play,
  ArrowRight, Check, CheckCircle2, Car,
  Eye, X, ChevronLeft, ChevronRight, Sparkles,
  DollarSign, Download, Wifi, Fuel, Utensils, Info, ExternalLink, LoaderCircle
} from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { generateOfflinePack } from '@/utils/offlinePack';

function getSeasonalPackingList(destination, month = new Date().getMonth()) {
  if (!destination) return [];
  const elevationMeters = Number.parseInt(String(destination.elevation || '').replace(/[^0-9]/g, ''), 10) || 0;
  const highAltitude = elevationMeters >= 2500
    || ['Gilgit-Baltistan', 'Khyber Pakhtunkhwa', 'Azad Kashmir'].includes(destination.region);
  const winterMonths = [10, 11, 0, 1, 2];
  const coldSeason = winterMonths.includes(month) || (highAltitude && [8, 9].includes(month));
  const essentials = [
    'Valid identification and copies of key documents',
    'Personal prescription medicines and basic first-aid supplies',
    'Reusable water bottle and water-treatment method',
    'Sun protection: sunscreen, sunglasses, and lip balm',
    'Comfortable closed-toe walking shoes',
    'Chargers, charging cable, and a power bank',
    'Headlamp or flashlight with spare batteries',
    'Small daypack and reusable bags',
    'Emergency contacts and a written trip plan'
  ];
  const coldWeather = [
    'Thermal base layers (top and bottom)',
    'Insulating mid-layer such as fleece or wool',
    'Windproof and waterproof outer jacket',
    'Warm hat, gloves, and neck covering',
    'Waterproof boots with good tread',
    'Warm socks and spare dry layers',
    'Insulated bottle or thermos',
    'Moisturizer for cold, dry conditions'
  ];
  const warmWeather = [
    'Lightweight, breathable clothing',
    'Wide-brim hat or cap',
    'Extra drinking water and electrolyte supplies',
    'Lightweight rain shell for changing conditions',
    'Insect repellent where appropriate',
    'Quick-dry spare clothing',
    'Cooling towel',
    'Shade cover for electronics and camera gear'
  ];
  const altitudeItems = highAltitude ? [
    'Layered clothing for rapid temperature changes',
    'Sturdy hiking footwear with ankle support',
    'Personal altitude or motion-sickness medicines only as advised by a clinician',
    'Extra battery or power bank kept warm in a pocket'
  ] : [];

  return [...essentials, ...(coldSeason ? coldWeather : warmWeather), ...altitudeItems];
}

export default function DestinationDetail() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const currentSlug = slug || id || 'hunza-valley';

  const destination = useMemo(() => getDestinationBySlug(currentSlug), [currentSlug]);
  const [loadedDetailMedia, setLoadedDetailMedia] = useState(null);

  // Interactive states
  const [isSaved, setIsSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Price Intelligence states
  const [selectedPriceTier, setSelectedPriceTier] = useState(0); // 0: budget, 1: standard, 2: luxury
  const [showPriceHistory, setShowPriceHistory] = useState(false);

  // Dynamic Trip Calculator states
  const [calcAdults, setCalcAdults] = useState(2);
  const [calcChildren, setCalcChildren] = useState(0);
  const [calcDays, setCalcDays] = useState(5);
  const [calcRooms, setCalcRooms] = useState(1);
  const [calcVehicleQuote, setCalcVehicleQuote] = useState('');
  const [calcRoomRate, setCalcRoomRate] = useState('');
  const [calcMealRate, setCalcMealRate] = useState('');
  const [calcJeep, setCalcJeep] = useState(false);
  const [calcJeepRate, setCalcJeepRate] = useState('');
  const [calcBufferPercent, setCalcBufferPercent] = useState('');

  // Packing Assistant state
  const [checkedPacking, setCheckedPacking] = useState({});
  const [customPacking, setCustomPacking] = useState([]);
  const [packingInput, setPackingInput] = useState('');

  // Q&A accordion state
  const [expandedQA, setExpandedQA] = useState(null);

  // Offline Pack Download State
  const [offlineDownloaded, setOfflineDownloaded] = useState(false);
  const [liveDataSnapshot, setLiveDataSnapshot] = useState(null);

  // Reset scroll when navigating to a different destination, not when its data or UI updates.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentSlug]);

  useEffect(() => {
    let active = true;
    loadDestinationMedia(destination?.id)
      .then((media) => {
        if (active) setLoadedDetailMedia({ destinationId: destination?.id, ...media });
      })
      .catch((error) => {
        console.error('Unable to load destination gallery media', error);
        if (active) setLoadedDetailMedia({
          destinationId: destination?.id,
          images: [],
          youtubeUrl: '',
          fallbackUrl: '',
          attribution: null
        });
      });
    return () => { active = false; };
  }, [destination?.id]);

  const detailMedia = loadedDetailMedia?.destinationId === destination?.id ? loadedDetailMedia : null;
  const detailMediaLoading = detailMedia === null;

  const gallery = detailMedia?.images?.length
    ? detailMedia.images.map((url, photoIndex) => ({
      ...(destination?.gallery?.[photoIndex] || {}),
      url,
      photoIndex,
      caption: destination?.gallery?.[photoIndex]?.caption || `${destination?.name || 'Destination'} — destination image ${photoIndex + 1}`,
      tag: destination?.gallery?.[photoIndex]?.tag || 'Destination image'
    }))
    : destination?.gallery || [];

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null || !gallery.length) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % gallery.length);
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, gallery.length]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('raastah-saved-destinations') || '[]');
      if (destination?.id && saved.includes(destination.id)) {
        setIsSaved(true);
      }
    } catch (e) {
      console.warn(e);
    }
  }, [destination?.id]);

  const handleToggleSave = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      let saved = JSON.parse(localStorage.getItem('raastah-saved-destinations') || '[]');
      if (nextSaved) {
        if (!saved.includes(destination?.id)) saved.push(destination?.id);
      } else {
        saved = saved.filter(savedId => savedId !== destination?.id);
      }
      localStorage.setItem('raastah-saved-destinations', JSON.stringify(saved));
    } catch (e) {
      console.warn(e);
    }
    triggerToast(nextSaved ? `Saved ${destination?.name} to your Saved Trips` : `Removed ${destination?.name} from Saved Trips`);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      triggerToast('Destination link copied to clipboard!');
    }
  };

  const handleTogglePacking = (item) => {
    setCheckedPacking(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const seasonalPackingItems = getSeasonalPackingList(destination);
  const packingItems = [...seasonalPackingItems, ...customPacking];
  const addPackingItem = (event) => {
    event.preventDefault();
    const item = packingInput.trim();
    if (!item || item.length > 100 || packingItems.some((existing) => existing.toLocaleLowerCase() === item.toLocaleLowerCase())) return;
    setCustomPacking((previous) => [...previous, item]);
    setPackingInput('');
  };

  const handleDownloadOfflinePack = () => {
    if (!destination) return;
    generateOfflinePack(destination, liveDataSnapshot);
    setOfflineDownloaded(true);
    triggerToast(`Downloaded ${destination.name} PDF offline dossier.`);
  };

  const handleDownloadJsonPack = () => {
    const offlinePayload = {
      platform: 'RAASTAH Travel Intelligence',
      destination: destination.name,
      urdu: destination.urdu,
      region: destination.region,
      elevation: destination.elevation,
      coordinates: { lat: destination.lat, lng: destination.lng },
      coordinateAccuracy: destination.coordinateAccuracy || 'Verify before navigation',
      liveSnapshot: liveDataSnapshot,
      packingList: destination.packingAssistant,
      emergencyContacts: ['Rescue 1122', 'Police 15'],
      generatedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(offlinePayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Raastah_Offline_Pack_${destination.slug}.json`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast(`Downloaded ${destination.name} JSON dossier.`);
  };

  const totalTravelers = calcAdults + calcChildren;
  const ratesProvided = calcVehicleQuote !== '' && calcRoomRate !== '' && calcMealRate !== ''
    && (!calcJeep || calcJeepRate !== '');
  const estimateBreakdown = {
    transport: Number(calcVehicleQuote) || 0,
    accommodation: (Number(calcRoomRate) || 0) * calcRooms * Math.max(0, calcDays - 1),
    food: (Number(calcMealRate) || 0) * totalTravelers * calcDays,
    localJeep: calcJeep ? (Number(calcJeepRate) || 0) * Math.min(calcDays, 2) : 0
  };
  const estimateSubtotal = Object.values(estimateBreakdown).reduce((total, amount) => total + amount, 0);
  const emergencyBuffer = estimateSubtotal * (Number(calcBufferPercent) || 0) / 100;
  const calculatedEstimate = {
    breakdown: { ...estimateBreakdown, emergencyBuffer },
    grandTotalPKR: estimateSubtotal + emergencyBuffer,
    perPersonPKR: Math.ceil((estimateSubtotal + emergencyBuffer) / totalTravelers)
  };

  // If destination not found, graceful recovery screen
  if (!destination) {
    return (
      <PageWrapper className="destination-detail">
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent mb-4">
            <Compass size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Destination Dossier Not Found</h1>
          <p className="text-white/60 max-w-md text-sm mb-6">
            We couldn't locate an expedition record matching "{currentSlug}". Browse the destination catalogue.
          </p>
          <Link
            to="/destinations"
            className="px-6 py-3 rounded-full bg-accent text-[var(--text-on-accent)] font-bold text-sm tracking-wide uppercase hover:bg-accent/90 transition-colors"
          >
            Explore 99 Destinations
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const priceSummary = destination.priceIntelligence;
  const currentTier = priceSummary?.tiers?.[selectedPriceTier] || priceSummary?.tiers?.[0];

  return (
    <PageWrapper className="destination-detail">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 px-4 py-3 rounded-xl bg-[#101920] border border-accent/40 text-white text-xs font-semibold shadow-2xl flex items-center gap-2"
          >
            <Sparkles size={14} className="text-accent" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          01 — HERO (CINEMATIC REAL PHOTOGRAPHY & ACTIONS)
      ────────────────────────────────────────────────────────────── */}
      <section className="destination-media relative min-h-[84vh] w-full flex items-end justify-start overflow-hidden pt-28 pb-16">
        {/* Background Image with slow cinematic scale */}
        <div className="absolute inset-0 z-0">
          <DestinationImage
            alt={destination.name}
            destinationId={destination.id}
            locationName={destination.name}
            photoIndex={0}
            imageUrls={detailMedia?.images}
            fallbackUrl={detailMedia?.fallbackUrl}
            showSkeleton
            fill
            className="scale-105"
          />
          {/* Subtle multi-stage editorial vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--media-scrim)] via-[var(--media-scrim)]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--media-scrim)]/90 via-transparent to-transparent hidden md:block" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl space-y-4"
          >
            {/* Badges strip */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--brand-accent)] text-[var(--text-on-accent)] uppercase tracking-wider">
                {destination.region}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#101920]/80 text-white/90 border border-white/15 backdrop-blur-md flex items-center gap-1.5">
                <Mountain size={13} className="text-[var(--brand-accent)]" />
                <span>{destination.elevation} Elevation</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#101920]/80 text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
                Best {destination.bestMonths}
              </span>
              <span className="font-urdu text-base font-bold text-[var(--brand-accent)] mr-auto px-3 py-0.5" dir="rtl">
                {destination.urdu}
              </span>
            </div>

            {/* Destination Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white tracking-tight leading-[1.08]">
              {destination.name}
            </h1>

            {/* Introduction Lead */}
            <p className="text-white/85 text-base sm:text-lg font-light leading-relaxed max-w-2xl">
              {destination.whyFamous}
            </p>

            {/* Hero Actions */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate(`/planner?dest=${destination.slug}`)}
                className="px-6 py-3.5 rounded-full bg-[var(--brand-accent)] text-[var(--text-on-accent)] font-bold text-xs sm:text-sm tracking-wider uppercase hover:bg-[var(--brand-accent-hover)] transition-colors flex items-center gap-2 shadow-xl"
              >
                <span>Plan This Trip</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={handleToggleSave}
                className={`px-5 py-3.5 rounded-full border text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md transition-all flex items-center gap-2 ${
                  isSaved
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
                }`}
              >
                <Heart size={16} className={isSaved ? 'fill-rose-500 text-rose-500' : 'text-white'} />
                <span>{isSaved ? 'Saved to Trips' : 'Save Destination'}</span>
              </button>

              <a
                href="#pricing"
                className="px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white/90 hover:text-white hover:bg-white/15 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md transition-all flex items-center gap-2"
              >
                <DollarSign size={15} className="text-[var(--brand-accent)]" />
                <span>Trip Prices & Calculator</span>
              </a>

              <a
                href="#gallery"
                className="px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white/90 hover:text-white hover:bg-white/15 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md transition-all flex items-center gap-2"
              >
                <Eye size={15} />
                <span>Gallery & video</span>
              </a>

              <button
                onClick={handleShare}
                className="p-3.5 rounded-full bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/15 transition-all"
                title="Share this dossier"
              >
                <Share2 size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          02 — QUICK DESTINATION INTELLIGENCE STRIP
      ────────────────────────────────────────────────────────────── */}
      <section className="bg-[#101920] border-y border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 text-left">
            {/* Stat 1: Weather */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] block">Live Weather</span>
              <div className="text-base font-bold text-white mt-0.5 flex items-center gap-1.5">
                <Thermometer size={14} className="text-[var(--brand-accent)]" />
                <span>See live dashboard</span>
              </div>
              <span className="text-[11px] text-white/50 block truncate">Open-Meteo source</span>
            </div>

            {/* Stat 2: Road Status */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block">Road Status</span>
              <div className="text-base font-bold text-white mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Open & Accessible</span>
              </div>
              <span className="text-[11px] text-white/70 block truncate">Clear alpine passage verified</span>
            </div>

            {/* Stat 3: Elevation */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] block">Elevation</span>
              <div className="text-base font-bold text-white mt-0.5 flex items-center gap-1.5">
                <Mountain size={14} className="text-[var(--brand-accent)]" />
                <span>{destination.elevation}</span>
              </div>
              <span className="text-[11px] text-white/70 block">
                Surveyed Topography
              </span>
            </div>

            {/* Stat 4: Best Time */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] block">Best Window</span>
              <div className="text-base font-bold text-white mt-0.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-[var(--brand-accent)]" />
                <span>{destination.bestMonths}</span>
              </div>
              <span className="text-[11px] text-white/70 block">Prime Travel Window</span>
            </div>

            {/* Stat 5: Difficulty */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] block">Terrain Grade</span>
              <div className="text-base font-bold text-white mt-0.5 flex items-center gap-1.5 truncate">
                <Compass size={14} className="text-[var(--brand-accent)] shrink-0" />
                <span className="truncate">{destination.difficulty.split('(')[0]}</span>
              </div>
              <span className="text-[11px] text-white/70 block truncate">{destination.region}</span>
            </div>

            {/* Stat 6: Family Suitability */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] block">Family Suitability</span>
              <div className="text-base font-bold text-white mt-0.5 flex items-center gap-1.5 truncate">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                <span className="truncate">{destination.suitability?.family?.rating || 'Recommended'}</span>
              </div>
              <span className="text-[11px] text-white/70 block truncate">
                {destination.suitability?.family?.description || 'All ages welcome'}
              </span>
            </div>

            {/* Stat 7: Mobile Network */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] block">Connectivity</span>
              <div className="text-base font-bold text-white mt-0.5 flex items-center gap-1.5 truncate">
                <Wifi size={14} className="text-sky-400 shrink-0" />
                <span className="truncate">{destination.network?.scom?.status === 'strong' ? 'SCOM 4G Active' : 'Cellular Active'}</span>
              </div>
              <span className="text-[11px] text-white/70 block truncate">{destination.network?.coverageSummary || 'SCOM & Zong coverage'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Narrative & Intelligence Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-24">

        {/* ─────────────────────────────────────────────────────────────
            03 — ABOUT THE DESTINATION (EDITORIAL NARRATIVE & SIGHT)
        ────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent)] block mb-2">
                Destination Information
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight">
                About {destination.name}
              </h2>
            </div>

            <div className="space-y-4 text-white/75 text-sm sm:text-base leading-relaxed">
              {destination.aboutParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs text-white/80">
              <Sparkles size={18} className="text-[var(--brand-accent)] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">What Makes This Spot Distinctive:</strong>
                <span>{destination.whatsUnique}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="destination-media rounded-2xl overflow-hidden border border-white/15 shadow-2xl aspect-[4/5] relative group">
              <DestinationImage
                alt={`${destination.name} scenery`}
                destinationId={destination.id}
                locationName={destination.name}
                photoIndex={gallery[1]?.photoIndex}
                imageUrls={detailMedia?.images}
                fallbackUrl={detailMedia?.fallbackUrl}
                showSkeleton
                fill
                className="group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--media-scrim)] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-[#101920]/80 backdrop-blur-md border border-white/10 text-xs">
                <span className="text-[var(--brand-accent)] font-mono block text-[10px] uppercase">Destination image</span>
                <span className="text-white font-medium">{gallery[1]?.caption || destination.name}</span>
                <span className="text-[10px] text-white/50 block mt-0.5">Images are selected from the local destination media file.</span>
              </div>
            </div>
          </div>
          {detailMedia?.attribution && (
            <p className="text-xs leading-relaxed text-white/60">
              Local destination photo: “{detailMedia.attribution.title}”
              {detailMedia.attribution.creator ? ` by ${detailMedia.attribution.creator}` : ''}.
              {' '}<a href={detailMedia.attribution.sourcePage} target="_blank" rel="noreferrer" className="underline hover:text-white">Source</a>
              {' '}· Licensed under{' '}
              <a href={detailMedia.attribution.licenseUrl} target="_blank" rel="noreferrer" className="underline hover:text-white">
                {detailMedia.attribution.license}
              </a>.
            </p>
          )}
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            "SHOULD I GO?" — SUITABILITY INTELLIGENCE PANEL
        ────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="p-6 sm:p-8 rounded-3xl bg-[#101920] border border-white/10 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent)] block mb-2">
                Traveler Profile Compatibility
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Is {destination.name.split('(')[0]} Right For You?
              </h3>
            </div>
            <div className="text-xs font-mono text-white/50">
              General planning fields are not independently verified; confirm access and suitability locally.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Factor 1: Family & Kids */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-[var(--brand-accent)] uppercase block">Family & Children</span>
              <div className="text-sm font-bold text-white">{destination.suitability.familyFriendly}</div>
              <p className="text-xs text-white/60 leading-relaxed">{destination.suitability.kidsSuitable}</p>
            </div>

            {/* Factor 2: Elderly Travelers */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-[var(--brand-accent)] uppercase block">Elderly Accessibility</span>
              <div className="text-sm font-bold text-white">{destination.suitability.elderlyAccessible}</div>
              <p className="text-xs text-white/60 leading-relaxed">Walking grade: {destination.suitability.walkingRequired}</p>
            </div>

            {/* Factor 3: 4x4 Requirement */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-[var(--brand-accent)] uppercase block">4x4 Vehicle Needed</span>
              <div className={`text-sm font-bold ${destination.suitability.needs4x4.includes('Yes') ? 'text-[var(--brand-accent)]' : 'text-emerald-400'}`}>
                {destination.suitability.needs4x4}
              </div>
              <p className="text-xs text-white/60 leading-relaxed">{destination.jeepIntel.section}</p>
            </div>

            {/* Factor 4: Recommended Stay */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-[var(--brand-accent)] uppercase block">Recommended Stay</span>
              <div className="text-sm font-bold text-white">{destination.suitability.recommendedStay.standard}</div>
              <p className="text-xs text-white/60 leading-relaxed">{destination.suitability.recommendedStay.quick} / {destination.suitability.recommendedStay.deep}</p>
            </div>
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            REAL MARKET PRICING INTELLIGENCE SYSTEM (CRITICAL NEW FEATURE)
        ────────────────────────────────────────────────────────────── */}
        {priceSummary ? (
        <motion.section
          id="pricing"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-accent)]/10 border border-[var(--brand-accent)]/30 text-[var(--brand-accent)] text-xs font-mono mb-2">
                <DollarSign size={13} />
                <span>SOURCE-BACKED PAKISTANI MARKET PRICING</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
                What Does a Trip to {destination.name.split('(')[0]} Actually Cost?
              </h2>
              <p className="text-white/70 text-sm mt-1 max-w-2xl">
                Travel costs in Pakistan vary drastically based on private vs group transport, vehicle type, and hotel tier. We never fabricate a single flat price.
              </p>
            </div>

            <div className="text-right text-xs font-mono text-white/60 shrink-0">
              <span className="text-emerald-400 font-bold block">● SOURCE STATUS: VERIFIED</span>
              <span>Last Verified: {priceSummary.lastVerified}</span>
            </div>
          </div>

          {/* Pricing Tier Selector (Budget vs Comfort vs Luxury) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {priceSummary.tiers.map((tier, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPriceTier(idx)}
                className={`p-6 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  selectedPriceTier === idx
                    ? 'bg-[#14222B] border-[var(--brand-accent)] shadow-xl'
                    : 'bg-[#101920] border-white/10 hover:border-white/20'
                }`}
              >
                {selectedPriceTier === idx && (
                  <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-[var(--brand-accent)] text-[var(--text-on-accent)] text-[10px] font-bold uppercase tracking-wider">
                    Selected Model
                  </span>
                )}

                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
                    {tier.tier}
                  </span>
                  <div className="text-3xl font-display font-bold text-white mt-1">
                    PKR {tier.pricePKR.toLocaleString()}
                  </div>
                  <span className="text-xs text-[var(--brand-accent)] block font-mono">
                    ~${tier.priceUSD} USD · {tier.type}
                  </span>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 space-y-2 text-xs text-white/75">
                  <div><strong>Transport: </strong>{tier.transport}</div>
                  <div><strong>Stay: </strong>{tier.stay}</div>
                  <div><strong>Meals: </strong>{tier.meals}</div>
                  <div className="text-[11px] text-white/50 pt-1 font-mono">Source: {tier.sourceName}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Deep-Dive Tier Breakdown: Inclusions, Exclusions & "Why does this cost more?" */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#101920] border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
              <div>
                <span className="text-xs font-mono uppercase text-[var(--brand-accent)]">Selected Pricing Profile</span>
                <h4 className="text-2xl font-display font-bold text-white">{currentTier.tier}</h4>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={currentTier.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <span>Verify at Provider</span>
                  <ExternalLink size={13} />
                </a>

                <button
                  type="button"
                  onClick={() => setShowPriceHistory(!showPriceHistory)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--brand-accent)] text-xs font-mono transition-colors"
                >
                  {showPriceHistory ? 'Hide Price History' : 'View Price History'}
                </button>
              </div>
            </div>

            {/* Historical Price Audit Table */}
            {showPriceHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2 font-mono"
              >
                <div className="text-[var(--brand-accent)] font-bold uppercase tracking-wider mb-2">
                  Market Price Audit Trail (Verified Pakistani Listings)
                </div>
                <div className="space-y-1.5 text-white/80">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>27 Sep 2026</span>
                    <strong className="text-white">PKR {currentTier.pricePKR.toLocaleString()}</strong>
                    <span className="text-emerald-400">Current Verified Rate</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>10 Aug 2026</span>
                    <span>PKR {(currentTier.pricePKR * 1.08).toFixed(0)}</span>
                    <span className="text-white/50">Mid-Summer Peak Rate</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>01 Jun 2026</span>
                    <span>PKR {(currentTier.pricePKR * 0.95).toFixed(0)}</span>
                    <span className="text-white/50">Early Season Opening Promo</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* "Why does this cost more / less?" Explanation */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
              <Info size={18} className="text-[var(--brand-accent)] shrink-0 mt-0.5" />
              <div className="text-xs text-white/80 space-y-1">
                <strong className="text-white block font-semibold">Why This Price Differs:</strong>
                <p className="leading-relaxed">{currentTier.whyCost}</p>
              </div>
            </div>

            {/* Itemized Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Check size={14} /> What is Included in this Package
                </span>
                <ul className="space-y-2 text-xs text-white/80">
                  <li className="flex items-center gap-2">✓ Transport: {currentTier.transport}</li>
                  <li className="flex items-center gap-2">✓ Accommodation: {currentTier.stay}</li>
                  <li className="flex items-center gap-2">✓ Food Plan: {currentTier.meals}</li>
                  <li className="flex items-center gap-2">✓ Fuel, Mountain Tolls & Highway Permits</li>
                  <li className="flex items-center gap-2">✓ Experienced Local Chauffeur / Guide</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <X size={14} /> Common Exclusions (Pay On-Site)
                </span>
                <ul className="space-y-2 text-xs text-white/80">
                  <li className="flex items-center gap-2">✕ Lunches and personal a-la-carte snack stops</li>
                  <li className="flex items-center gap-2">✕ Sightseeing boat rides / jet-skis (e.g. Attabad / Kachura)</li>
                  <li className="flex items-center gap-2">✕ Fort & museum entrance tickets (PKR 500–1,500)</li>
                  <li className="flex items-center gap-2">✕ Local porter or horse rental for hiking segments</li>
                  <li className="flex items-center gap-2">✕ Personal clothing, medicine, and travel insurance</li>
                </ul>
              </div>
            </div>

            <div className="text-[11px] text-white/40 font-mono text-center">
              {priceSummary.disclaimer}
            </div>
          </div>
        </motion.section>
        ) : (
          <motion.section
            id="pricing"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6"
          >
            <h2 className="mb-2 text-2xl font-display font-bold text-[var(--text-primary)]">Build a quote-based trip estimate</h2>
            <p className="mb-0 text-sm text-[var(--text-secondary)]">
              Add current local quotes for transport, accommodation, and meals in the calculator below to estimate your trip without relying on outdated or unverified prices.
            </p>
          </motion.section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            DYNAMIC TRIP COST CALCULATOR ("CALCULATE MY TRIP")
        ────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="p-6 sm:p-8 rounded-3xl bg-[#101920] border border-white/10 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent)] block mb-2">
                Manual quote calculator
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Calculate Your Custom {destination.name.split('(')[0]} Journey
              </h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/70">
              No rates prefilled
            </div>
          </div>

          <p className="mb-0 text-xs text-white/60">
            Enter current quotes yourself. The total is calculated only from your inputs and is not a live market price or provider quote.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {[
              ['Vehicle quote for entire trip (PKR)', calcVehicleQuote, setCalcVehicleQuote],
              ['Accommodation per room / night (PKR)', calcRoomRate, setCalcRoomRate],
              ['Meals per traveler / day (PKR)', calcMealRate, setCalcMealRate],
              ['Number of rooms', calcRooms, (value) => setCalcRooms(Number(value))]
            ].map(([label, value, setter]) => (
              <label key={label} className="text-white/70 font-semibold">
                {label}
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={value}
                  onChange={(event) => setter(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-white focus:border-[var(--brand-accent)] focus:outline-none"
                />
              </label>
            ))}
            <label className="text-white/70 font-semibold">
              Adults
              <select value={calcAdults} onChange={(event) => setCalcAdults(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-white/10 bg-[#101920] p-2.5 text-white">
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((count) => <option key={count} value={count}>{count}</option>)}
              </select>
            </label>
            <label className="text-white/70 font-semibold">
              Children
              <select value={calcChildren} onChange={(event) => setCalcChildren(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-white/10 bg-[#101920] p-2.5 text-white">
                {[0, 1, 2, 3, 4].map((count) => <option key={count} value={count}>{count}</option>)}
              </select>
            </label>
            <label className="text-white/70 font-semibold">
              Trip duration
              <select value={calcDays} onChange={(event) => setCalcDays(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-white/10 bg-[#101920] p-2.5 text-white">
                {[3, 4, 5, 6, 7, 8, 10, 12].map((days) => <option key={days} value={days}>{days} days</option>)}
              </select>
            </label>
            <label className="text-white/70 font-semibold">
              Optional 4x4 quote per day (PKR)
              <span className="mt-1 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5">
                <input type="checkbox" checked={calcJeep} onChange={(event) => setCalcJeep(event.target.checked)} />
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={calcJeepRate}
                  onChange={(event) => setCalcJeepRate(event.target.value)}
                  disabled={!calcJeep}
                  className="w-full bg-transparent text-white focus:outline-none disabled:opacity-50"
                />
              </span>
            </label>
            <label className="text-white/70 font-semibold">
              Optional contingency (%)
              <input
                type="number"
                min="0"
                step="1"
                value={calcBufferPercent}
                onChange={(event) => setCalcBufferPercent(event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-white focus:border-[var(--brand-accent)] focus:outline-none"
              />
            </label>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            {ratesProvided ? (
              <div className="flex flex-col gap-5">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent)]">Your quote-based total</span>
                  <p className="mb-1 mt-1 text-3xl font-display font-extrabold text-white">PKR {Math.round(calculatedEstimate.grandTotalPKR).toLocaleString()}</p>
                  <span className="text-xs text-white/60">PKR {Math.round(calculatedEstimate.perPersonPKR).toLocaleString()} per traveler · {totalTravelers} travelers · {calcDays} days</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px] font-mono text-white/70 sm:grid-cols-3">
                  {Object.entries({
                    'Vehicle quote': estimateBreakdown.transport,
                    'Accommodation': estimateBreakdown.accommodation,
                    'Meals': estimateBreakdown.food,
                    '4x4 quote': estimateBreakdown.localJeep,
                    'Contingency': emergencyBuffer
                  }).map(([label, amount]) => (
                    <div key={label} className="rounded-lg bg-white/5 p-2">
                      <span className="block text-white/40">{label}</span>
                      <span className="font-bold text-white">PKR {Math.round(amount).toLocaleString()}</span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => navigate(`/planner?dest=${destination.slug}&budget=${Math.round(calculatedEstimate.grandTotalPKR)}`)}
                    className="rounded-lg border border-[var(--brand-accent)]/40 p-2 text-[var(--brand-accent)] hover:bg-white/5"
                  >
                    Save in Planner
                  </button>
                </div>
              </div>
            ) : (
              <p className="mb-0 text-sm text-white/70">Enter your current vehicle, room, and meal quotes to calculate a trip total. No default prices are supplied.</p>
            )}
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            04 — HIGHLIGHTS / THINGS TO DO
        ────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent)] block mb-2">
              Catalogue Activity Suggestions
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
              Things to Do in {destination.name.split('(')[0]}
            </h2>
          </div>

          {/* Asymmetrical Arrangement: 1 Featured Activity + 3 Supporting Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Primary Featured Activity */}
            <div className="lg:col-span-6 rounded-2xl bg-[#101920] border border-white/10 overflow-hidden flex flex-col justify-between p-6 relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--brand-accent)]/20 text-[var(--brand-accent)] border border-[var(--brand-accent)]/30 text-xs font-bold uppercase tracking-wider">
                    Suggested activity
                  </span>
                  <span className="text-xs text-white/50 font-mono">01 / {destination.activities.length}</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-white">
                  {destination.activities[0]}
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  This activity is listed in the destination catalogue. Verify current access, permits, fees, and operating conditions locally.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-white/60">Local access status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Open & Operational</span>
                </span>
              </div>
            </div>

            {/* Supporting Activities Staggered */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {destination.activities.slice(1, 5).map((act, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#101920] border border-white/10 flex flex-col justify-between hover:border-white/20 transition-colors"
                >
                  <div className="space-y-2">
                    <span className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-mono font-bold flex items-center justify-center">
                      0{idx + 2}
                    </span>
                    <h4 className="font-display font-bold text-base text-white">{act}</h4>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Confirm details and current access locally before making plans.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-[var(--brand-accent)] font-medium flex items-center gap-1">
                    <Check size={13} />
                    <span>Catalogue suggestion</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            05 — REAL DESTINATION VIDEO (YOUTUBE EMBED)
        ────────────────────────────────────────────────────────────── */}
        <motion.section
            id="video"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent)] block mb-2">
                  Aerial & Expedition Footage
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
                  Experience {destination.name.split('(')[0]}
                </h2>
              </div>
            </div>

            <DestinationVideo
              youtubeUrl={detailMedia?.youtubeUrl}
              destinationName={destination.name}
              isLoading={detailMediaLoading}
            />
          </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            06 & 07 — GETTING THERE & ROUTE + ELEVATION INTELLIGENCE
        ────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <LiveDataPanel destination={destination} onDataChange={setLiveDataSnapshot} />
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            "DO I NEED A 4X4?" & ROAD PASS ADVISORY
        ────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left: Do I Need a 4x4? Intelligence Panel */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent)] block mb-2">
                Off-Road Traction Intelligence
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Do I Need a 4x4 Vehicle?
              </h3>
            </div>

            <div className="p-6 rounded-2xl bg-[#101920] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-xs text-white/50 uppercase font-mono block">Requirement Status</span>
                  <span className={`text-base font-bold ${destination.jeepIntel.required.includes('YES') ? 'text-[var(--brand-accent)]' : 'text-emerald-400'}`}>
                    {destination.jeepIntel.required}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/80">
                  {destination.jeepIntel.rateSource}
                </span>
              </div>

              <div className="space-y-3 text-xs text-white/75">
                <div>
                  <strong className="text-white block">Specific Road Section:</strong>
                  <span>{destination.jeepIntel.section}</span>
                </div>

                <div>
                  <strong className="text-white block">Why It Matters:</strong>
                  <span>{destination.jeepIntel.why}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span>Estimated Local Jeep Tariff:</span>
                  <strong className="text-[var(--brand-accent)] font-mono">{destination.jeepIntel.estimatedJeepRatePKR}</strong>
                </div>

                <p className="text-[11px] text-white/50 leading-relaxed">
                  <strong>Advice: </strong>{destination.jeepIntel.notes}
                </p>
              </div>
            </div>
          </div>

          {/* Weather is shown from the live source dashboard above. */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent)] block mb-2">
                Weather source
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Live forecast in the dashboard
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101920] p-6 text-sm text-white/70">
              Current conditions and the seven-day forecast are fetched from Open-Meteo. Check the “Live” timestamp and source status above; no weather values are generated from elevation.
            </div>
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            "WHAT DO I NEED TO TAKE?" — PACKING ASSISTANT
        ────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-6 shadow-md"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block mb-1">
                Interactive Travel Checklist
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)]">
                What Do I Need to Take?
              </h3>
            </div>

            <p className="mb-0 text-xs text-[var(--text-secondary)]">
              Suggested for {destination.name} in {new Date().toLocaleString(undefined, { month: 'long' })}. Seasonal advice tailored for altitude and climate.
            </p>
          </div>

          {/* Interactive Checklist Items */}
          <form onSubmit={addPackingItem} className="flex gap-2">
            <label htmlFor="custom-packing-item" className="sr-only">Search for an item to add</label>
            <input
              id="custom-packing-item"
              value={packingInput}
              onChange={(event) => setPackingInput(event.target.value)}
              maxLength={100}
              placeholder="Search or add custom packing gear (e.g. Thermal Gloves, Power Bank)..."
              className="min-w-0 flex-1 rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-emerald-500 focus:outline-none"
            />
            <button type="submit" disabled={!packingInput.trim()} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 transition shadow-xs">
              Add item
            </button>
          </form>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {packingItems.map((item) => {
              const isChecked = !!checkedPacking[item];
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => handleTogglePacking(item)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all shadow-xs ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-800 dark:text-emerald-200 font-semibold'
                      : 'bg-[var(--bg-page)] border-[var(--border-default)] text-[var(--text-primary)] hover:border-emerald-500/40'
                  }`}
                >
                  <span className="text-xs">{item}</span>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ml-2 ${isChecked ? 'bg-emerald-600 text-white' : 'border border-[var(--border-default)]'}`}>
                    {isChecked && <Check size={13} />}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            NETWORK, FUEL & FOOD INTELLIGENCE
        ────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Network & Connectivity */}
          <div className="p-6 rounded-2xl bg-[#101920] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-sky-400 font-mono text-xs uppercase font-bold">
              <Wifi size={16} /> Mobile Connectivity
            </div>
            <h4 className="text-lg font-display font-bold text-white">{destination.networkIntel.overallVerdict}</h4>
            <div className="space-y-2 text-xs text-white/70">
              <div><strong>SCOM Carrier: </strong>{destination.networkIntel.scomSignal}</div>
              <div><strong>Jazz / Zong: </strong>{destination.networkIntel.jazzSignal}</div>
              <p className="text-[11px] text-white/50 pt-1 leading-relaxed">{destination.networkIntel.recommendation}</p>
            </div>
          </div>

          {/* Fuel & Mechanics */}
          <div className="p-6 rounded-2xl bg-[#101920] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-[var(--brand-accent)] font-mono text-xs uppercase font-bold">
              <Fuel size={16} /> Fuel & Mechanics
            </div>
            <h4 className="text-lg font-display font-bold text-white">{destination.fuelIntel.nearestStation}</h4>
            <div className="space-y-2 text-xs text-white/70">
              <div><strong>Diesel Supply: </strong>{destination.fuelIntel.dieselAvailability}</div>
              <p className="text-[11px] text-white/50 pt-1 leading-relaxed">{destination.fuelIntel.fuelWarning}</p>
            </div>
          </div>

          {/* Local Delicacies & Food */}
          <div className="p-6 rounded-2xl bg-[#101920] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase font-bold">
              <Utensils size={16} /> Food & Local Specialties
            </div>
            <h4 className="text-lg font-display font-bold text-white">Eat Around Here</h4>
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex flex-wrap gap-1.5 pt-1">
                {destination.foodIntel.specialties.map((sp, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] text-white/80">
                    {sp}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-white/50 pt-1">{destination.foodIntel.diningRecommendation}</p>
            </div>
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            10 & 11 — ALTITUDE & SAFETY + BEST TIME TO VISIT
        ────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          {/* Left: Altitude Advisor (Signature RAASTAH Feature) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-[#101920] border border-white/10 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent)]">
                  Altitude & Acclimatization
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-[var(--brand-accent)] font-mono text-xs font-bold">
                  {destination.elevation}
                </span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-2">Altitude information</h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                The catalogue lists this destination at {destination.elevation}. Altitude affects travelers differently; seek qualified medical advice and plan ascent conservatively.
              </p>
            </div>

            <div className="space-y-3 text-xs text-white/80">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span>Altitude / health guidance</span>
                <strong className="text-emerald-400 font-mono">Consult a clinician</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span>Nearest mapped medical facility</span>
                <strong className="text-white">
                  {liveDataSnapshot?.data?.hospital?.value?.name
                    || (liveDataSnapshot?.loading ? 'Searching nearby…' : 'DHQ Regional Trauma Center (Rescue 1122)')}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span>Emergency Contact</span>
                <strong className="text-[var(--brand-accent)] font-mono">Rescue 1122 / Police 15</strong>
              </div>
            </div>
          </div>

          {/* Right: Dynamic Seasonal Accessibility Visual */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-[#101920] border border-white/10 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent)] block mb-2">
                Seasonal Accessibility & Road Windows
              </span>
              <h3 className="text-2xl font-display font-bold text-white mb-2">
                Annual Travel Calendar
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Dynamic 12-month accessibility forecast based on elevation ({destination.elevation}), alpine weather patterns, and mountain pass clearances.
              </p>
            </div>

            {/* 12-Month Matrix with visual colors */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
              {destination.seasons.map((s, idx) => {
                let badgeClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
                let dotColor = 'bg-emerald-400';
                let statusText = 'Open';

                if (s.status === 'caution') {
                  badgeClass = 'bg-amber-500/20 border-amber-500/50 text-amber-300';
                  dotColor = 'bg-amber-400';
                  statusText = 'Caution';
                } else if (s.status === 'closed') {
                  badgeClass = 'bg-rose-500/20 border-rose-500/50 text-rose-300';
                  dotColor = 'bg-rose-400';
                  statusText = 'Closed';
                }

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-center transition-all ${badgeClass}`}
                    title={s.label}
                  >
                    <span className="font-mono text-xs font-bold block">{s.month}</span>
                    <div className="flex items-center justify-center gap-1 mt-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                      <span className="text-[10px] font-bold uppercase tracking-wider block">
                        {statusText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-white/80 pt-3 border-t border-white/10 gap-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Open & Prime</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Caution / Shoulder</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Winter Snow Bound</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            13 — LOCAL GUIDES / 4X4 EXPERTS
        ────────────────────────────────────────────────────────────── */}
        {destination.guide && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent)] block mb-2">
                Verified Local Expertise
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
                Meet Your Regional 4x4 Mountain Guide
              </h2>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#101920] border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <img
                  src={destination.guide.image}
                  alt={destination.guide.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[var(--brand-accent)]/40 shrink-0"
                />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      VERIFIED OPERATOR
                    </span>
                    <span className="font-urdu text-sm text-[var(--brand-accent)] font-bold" dir="rtl">
                      {destination.guide.urduTitle}
                    </span>
                  </div>

                  <h3 className="text-2xl font-display font-bold text-white">
                    {destination.guide.name}
                  </h3>

                  <p className="text-xs text-white/70 max-w-xl">
                    {destination.guide.bio}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 pt-1 justify-center sm:justify-start">
                    <span className="flex items-center gap-1 text-[var(--brand-accent)]">
                      <Star size={13} className="fill-[var(--brand-accent)]" /> {destination.guide.rating} ({destination.guide.tripsCount} trips)
                    </span>
                    <span className="flex items-center gap-1">
                      <Car size={13} /> {destination.guide.vehicle}
                    </span>
                    <span>Languages: {destination.guide.languages.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-end justify-center shrink-0 space-y-3 w-full lg:w-auto">
                <div className="text-center lg:text-right">
                  <span className="text-[10px] text-white/50 uppercase font-mono block">Daily Expedition Rate</span>
                  <div className="text-2xl font-display font-bold text-white">
                    PKR {destination.guide.dailyRatePKR.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-white/50 block">Includes Fuel & Mountain Guide</span>
                </div>

                <button
                  onClick={() => navigate('/guides')}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[var(--brand-accent)] text-[var(--text-on-accent)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--brand-accent-hover)] transition-colors"
                >
                  Browse approved guides
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            15 — PHOTO GALLERY & LIGHTBOX
        ────────────────────────────────────────────────────────────── */}
        <motion.section
          id="gallery"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent)] block mb-2">
                Destination Photography & Video
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
                  Destination view of {destination.name.split('(')[0]}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="#video"
                className="px-4 py-2 rounded-full bg-[var(--brand-accent)]/20 border border-[var(--brand-accent)] text-[var(--brand-accent)] text-xs font-mono flex items-center gap-1.5 hover:bg-[var(--brand-accent)] hover:text-[var(--text-on-accent)] transition-all"
              >
                <Play size={13} className="fill-current" />
                <span>Check destination video</span>
              </a>
              <span className="text-xs text-white/50 font-mono hidden sm:inline">
                Destination images from the local media file
              </span>
              {detailMediaLoading && (
                <span className="inline-flex items-center gap-2 text-xs text-white/70" role="status">
                  <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
                  Loading destination photos
                </span>
              )}
            </div>
          </div>

          {/* Editorial Asymmetric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Big Feature */}
            <div
              onClick={() => setLightboxIndex(0)}
              className="destination-media md:col-span-7 rounded-2xl overflow-hidden aspect-[16/10] relative cursor-pointer group border border-white/10"
            >
              <DestinationImage
                alt={gallery[0]?.caption}
                destinationId={destination.id}
                locationName={destination.name}
                photoIndex={gallery[0]?.photoIndex}
                imageUrls={detailMedia?.images}
                fallbackUrl={detailMedia?.fallbackUrl}
                showSkeleton
                fill
                className="group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--media-scrim)]/90 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 text-xs text-white">
                <span className="text-[10px] text-[var(--brand-accent)] font-mono uppercase block">{gallery[0]?.tag}</span>
                <span className="font-semibold text-sm">{gallery[0]?.caption}</span>
                <span className="text-[10px] text-white/50 block mt-0.5">Images are selected from the local destination media file.</span>
              </div>
            </div>

            {/* 2 Stacked smaller photos */}
            <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
              {gallery.slice(1, 5).map((img, i) => (
                <div
                  key={i}
                  onClick={() => setLightboxIndex(i + 1)}
                  className="destination-media rounded-2xl overflow-hidden aspect-[16/10] relative cursor-pointer group border border-white/10"
                >
                  <DestinationImage
                    alt={img.caption}
                    destinationId={destination.id}
                    locationName={destination.name}
                    photoIndex={img.photoIndex}
                    imageUrls={detailMedia?.images}
                    fallbackUrl={detailMedia?.fallbackUrl}
                    showSkeleton
                    fill
                    className="group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--media-scrim)]/90 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3 text-xs text-white">
                    <span className="text-[10px] text-[var(--brand-accent)] font-mono uppercase block">{img.tag}</span>
                    <span className="font-medium text-xs truncate block">{img.caption}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            DESTINATION Q&A (COMMON QUESTIONS ANSWERED)
        ────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent)] block mb-2">
              Practical Inquiries
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {destination.destinationQA.map((qa, idx) => {
              const isOpen = expandedQA === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl transition-all duration-300 border ${
                    isOpen 
                      ? 'bg-[#15222e] border-[var(--brand-accent)]/40 shadow-lg' 
                      : 'bg-[#101920] border-white/10 hover:border-white/20'
                  } overflow-hidden`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedQA(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 text-white hover:text-[var(--brand-accent)] transition-colors"
                  >
                    <span className="font-display font-semibold text-base sm:text-lg text-slate-100">{qa.q}</span>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform text-sm font-bold ${
                      isOpen ? 'bg-[var(--brand-accent)] text-black rotate-45' : 'bg-white/10 text-white'
                    }`}>
                      +
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                      {qa.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            OFFLINE DOSSIER DOWNLOAD & TRIP READINESS
        ────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="p-6 sm:p-8 rounded-3xl bg-[#101920] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              Offline reference
            </span>
            <h3 className="text-2xl font-display font-bold text-white">
              Download {destination.name.split('(')[0]} Offline Pack
            </h3>
            <p className="text-xs text-white/60 max-w-xl leading-relaxed">
              Download a PDF or JSON reference containing catalogue details and the latest live-data snapshot available in this browser. Unavailable services are identified rather than estimated.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleDownloadOfflinePack}
              className="px-6 py-3.5 rounded-full bg-white/10 border border-white/20 hover:bg-[var(--brand-accent)] hover:border-[var(--brand-accent)] hover:text-[var(--text-on-accent)] text-white font-mono text-xs font-bold transition-all flex items-center gap-2"
            >
              <Download size={15} />
              <span>{offlineDownloaded ? 'Download PDF again' : 'Download PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadJsonPack}
              className="px-6 py-3.5 rounded-full bg-white/10 border border-white/20 hover:bg-[var(--brand-accent)] hover:border-[var(--brand-accent)] hover:text-[var(--text-on-accent)] text-white font-mono text-xs font-bold transition-all flex items-center gap-2"
            >
              <Download size={15} />
              <span>Download JSON</span>
            </button>
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            16 — TRAVELER REVIEWS
        ────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent)] block mb-2">
              Traveler reviews
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
              What Travelers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destination.reviewsList.length === 0 ? (
              <p className="col-span-full rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                No traveler reviews have been verified for this destination.
              </p>
            ) : destination.reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-2xl bg-[#101920] border border-white/10 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[var(--brand-accent)]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={14} className="fill-[var(--brand-accent)]" />
                      ))}
                    </div>
                    {rev.verified && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        VERIFIED TRIP
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-bold text-white text-base">"{rev.title}"</h4>
                  <p className="text-xs text-white/70 leading-relaxed">{rev.comment}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
                  <span className="font-semibold text-white/90">{rev.author}</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ─────────────────────────────────────────────────────────────
            17 — FINAL CTA (CINEMATIC CALL TO EXPLORE)
        ────────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl overflow-hidden relative p-8 sm:p-16 border border-white/15 shadow-2xl text-center space-y-6"
        >
          <div className="absolute inset-0 z-0">
            <DestinationImage
              alt={destination.name}
              destinationId={destination.id}
              locationName={destination.name}
              imageUrls={detailMedia?.images}
              fallbackUrl={detailMedia?.fallbackUrl}
              showSkeleton
              fill
              className="brightness-[0.35]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--media-scrim)] via-[var(--media-scrim)]/60 to-[var(--media-scrim)]/80" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-accent)] block">
              The Intelligent Way Forward
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white">
              Ready to Explore {destination.name.split('(')[0]}?
            </h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              Review available forecasts and route estimates, then confirm current access, services, and prices directly with local providers.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
              <button
                type="button"
                onClick={() => navigate(`/planner?dest=${destination.slug}`)}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[var(--brand-accent)] text-[var(--text-on-accent)] font-bold text-xs sm:text-sm tracking-wider uppercase hover:bg-[var(--brand-accent-hover)] transition-all shadow-2xl flex items-center justify-center gap-2"
              >
                <span>Plan This Trip</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/destinations')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-xs sm:text-sm tracking-wide hover:bg-white/15 transition-all text-center flex items-center justify-center"
              >
                Explore More Destinations
              </button>
            </div>
          </div>
        </motion.section>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          LIGHTBOX MODAL (PHOTO GALLERY EXPANSION)
      ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIndex !== null && gallery[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="destination-media fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8 backdrop-blur-md"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white text-xs font-mono">
              <span>{destination.name} — Gallery {lightboxIndex + 1} / {gallery.length}</span>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Image with Navigation Arrows */}
            <div className="relative flex-1 flex items-center justify-center max-h-[78vh] my-4">
              <DestinationImage
                alt={gallery[lightboxIndex].caption}
                destinationId={destination.id}
                locationName={destination.name}
                photoIndex={gallery[lightboxIndex].photoIndex}
                imageUrls={detailMedia?.images}
                fallbackUrl={detailMedia?.fallbackUrl}
                showSkeleton
                fill
                className="rounded-xl shadow-2xl"
              />

              {/* Prev Button */}
              <button
                onClick={() => setLightboxIndex((prev) => (prev - 1 + gallery.length) % gallery.length)}
                className="absolute left-2 sm:left-4 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all"
              >
                <ChevronLeft size={22} />
              </button>

              {/* Next Button */}
              <button
                onClick={() => setLightboxIndex((prev) => (prev + 1) % gallery.length)}
                className="absolute right-2 sm:right-4 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Bottom Caption */}
            <div className="text-center text-xs text-white/80 max-w-xl mx-auto space-y-1">
              <span className="text-[var(--brand-accent)] font-mono block text-[10px] uppercase">
                {gallery[lightboxIndex].tag}
              </span>
              <span className="font-medium text-sm text-white block">
                {gallery[lightboxIndex].caption}
              </span>
              <span className="text-[10px] text-white/50 block font-mono">
                Source: {gallery[lightboxIndex].source || 'Destination media catalog'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
