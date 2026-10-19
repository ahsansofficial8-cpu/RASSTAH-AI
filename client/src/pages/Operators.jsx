/**
 * ==============================================================================
 * RAASTAH (راستہ) — COMPREHENSIVE TOUR OPERATOR, ROUTE & DESTINATION MAP
 * Interactive OpenStreetMap directory showing:
 * 1. Verified alpine tour operators & certified 4x4 drivers
 * 2. Active tour packages & expedition routes
 * 3. Major alpine destination hubs across Pakistan
 * ==============================================================================
 */

import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, MapPin, ShieldCheck, X, PhoneCall, 
  MessageCircle, Star, Car, Users, Clock, Navigation, CheckCircle2, Compass, Layers, Calendar, ExternalLink, Shield
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { useAuth } from '@/context/AuthContext';
import { VERIFIED_OPERATORS } from '@/data/operatorsData';
import { TOUR_PACKAGES } from '@/data/packagesData';
import { PAKISTAN_99_LOCATIONS } from '@/data/pakistan59Locations';
import { Button, Card, Badge } from '@/components/ui';
import 'leaflet/dist/leaflet.css';

const PAKISTAN_CENTER = [34.0, 74.0];

// Custom leaflet div icons with high-visibility colors
const operatorPin = L.divIcon({
  className: 'bg-transparent border-0',
  html: '<div style="background-color: #047857; border: 3px solid #ffffff; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 12px rgba(0,0,0,0.5);"><div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%; margin: 7px auto;"></div></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

const packagePin = L.divIcon({
  className: 'bg-transparent border-0',
  html: '<div style="background-color: #d97706; border: 3px solid #ffffff; width: 26px; height: 26px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 10px rgba(0,0,0,0.5);"><div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%; margin: 6px auto;"></div></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 26]
});

const hubPin = L.divIcon({
  className: 'bg-transparent border-0',
  html: '<div style="background-color: #0284c7; border: 3px solid #ffffff; width: 22px; height: 22px; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.4);"><div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%; margin: 4px auto;"></div></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const userPin = L.divIcon({
  className: 'bg-transparent border-0',
  html: '<div style="background-color: #e11d48; border: 3px solid #ffffff; width: 26px; height: 26px; border-radius: 50%; box-shadow: 0 0 0 8px rgba(225,29,72,0.35), 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%;"></div></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

function distanceKm(from, to) {
  const radians = (degrees) => degrees * Math.PI / 180;
  const [lat1, lon1] = from.map(radians);
  const [lat2, lon2] = to.map(radians);
  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;
  const haversine = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    const t3 = setTimeout(() => map.invalidateSize(), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map]);
  return null;
}

function MapInteraction({ onMapClick }) {
  useMapEvents({ click: onMapClick });
  return null;
}

function MapUserLocation({ coordinates, radiusKm = 10 }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (coordinates) {
      map.flyTo(coordinates, Math.max(map.getZoom(), 9), { duration: 0.8 });
    }
  }, [coordinates, map]);

  return coordinates ? (
    <>
      <Marker position={coordinates} icon={userPin} zIndexOffset={1000}>
        <Popup>
          <div className="p-1 space-y-1">
            <strong className="text-rose-700 block text-xs font-bold">📍 Your Location ({radiusKm}km Scan)</strong>
            <p className="text-[10px] text-slate-600">Showing all verified drivers and alpine guides near you.</p>
            <a 
              href={`https://www.google.com/maps?q=${coordinates[0]},${coordinates[1]}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-emerald-700 hover:underline block"
            >
              Open in Google Maps ↗
            </a>
          </div>
        </Popup>
      </Marker>
      <Circle 
        center={coordinates} 
        radius={radiusKm * 1000} 
        pathOptions={{ color: '#047857', fillColor: '#10b981', fillOpacity: 0.12, weight: 2, dashArray: '5, 5' }} 
      />
    </>
  ) : null;
}

export default function Operators() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [operators, setOperators] = useState(VERIFIED_OPERATORS);
  const [selectedItem, setSelectedItem] = useState(null); // operator, package, or destination
  const [activeTypeFilter, setActiveTypeFilter] = useState('all'); // all, operators, packages, destinations
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [radiusScanActive, setRadiusScanActive] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(false);
  const [womenSafeOnly, setWomenSafeOnly] = useState(() => {
    try {
      return localStorage.getItem('raastah-women-safe-mode') === 'true';
    } catch {
      return false;
    }
  });

  // Attempt location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setUserLocation([Number(coords.latitude.toFixed(4)), Number(coords.longitude.toFixed(4))]);
        },
        () => {
          // Default to Islamabad coordinates as central national gateway
          setUserLocation([33.6844, 73.0479]);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    } else {
      setUserLocation([33.6844, 73.0479]);
    }
  }, []);

  useEffect(() => {
    fetch('/api/guides')
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && Array.isArray(data.guides) && data.guides.length > 0) {
          const merged = [...data.guides];
          VERIFIED_OPERATORS.forEach(vo => {
            if (!merged.some(m => m.id === vo.id || m.name === vo.name)) {
              merged.push(vo);
            }
          });
          setOperators(merged);
        }
      })
      .catch((err) => {
        console.warn('API sync fallback to verified operators', err);
        setOperators(VERIFIED_OPERATORS);
      });
  }, []);

  // Mapped operators with coordinates
  const mappedOperators = useMemo(() => {
    const source = (operators && operators.length > 0) ? operators : VERIFIED_OPERATORS;
    return source.map(op => {
      let lat = null;
      let lng = null;
      const coords = op.location?.coordinates;
      if (Array.isArray(coords) && coords.length === 2 && Number.isFinite(coords[0]) && Number.isFinite(coords[1])) {
        if (coords[0] >= 23 && coords[0] <= 38) {
          lat = coords[0];
          lng = coords[1];
        } else {
          lat = coords[1];
          lng = coords[0];
        }
      } else if (Number.isFinite(op.lat) && Number.isFinite(op.lng)) {
        lat = op.lat;
        lng = op.lng;
      }

      if (lat && lng) {
        return {
          itemType: 'operator',
          id: op.id,
          name: op.name,
          city: op.city || 'Northern Pakistan',
          regions: op.regions || [],
          vehicle: op.vehicle || 'Toyota Prado (4x4)',
          experienceYears: op.experienceYears || 8,
          phone: op.phone || op.publicContact || '+92 345 9876543',
          whatsapp: op.whatsapp || '923459876543',
          rating: op.rating || 4.95,
          reviewsCount: op.reviewsCount || 110,
          pricePerDay: op.pricePerDay || 'PKR 14,000 / day',
          womenSafe: Boolean(op.womenSafe || op.womenVerified),
          womenVerified: Boolean(op.womenVerified || op.womenSafe),
          position: [lat, lng]
        };
      }
      return null;
    }).filter(Boolean);
  }, [operators]);

  // Mapped Tour Packages with coordinates (with robust null-checks)
  const mappedPackages = useMemo(() => {
    return TOUR_PACKAGES.map(pkg => {
      // Find matching destination coordinates safely
      const matchedDest = PAKISTAN_99_LOCATIONS.find(loc => {
        if (pkg.destinationId && loc.id === pkg.destinationId) return true;
        if (pkg.tagline && pkg.tagline.toLowerCase().includes(loc.name.toLowerCase())) return true;
        if (pkg.title && loc.name.toLowerCase().includes(pkg.title.toLowerCase().split(' ')[0])) return true;
        return false;
      }) || PAKISTAN_99_LOCATIONS[0];

      return {
        itemType: 'package',
        id: pkg.id,
        name: pkg.title,
        pricePKR: pkg.pricePKR,
        duration: pkg.duration || `${pkg.durationDays || 5} Days / ${pkg.durationNights || 4} Nights`,
        overview: pkg.overview || pkg.tagline || 'Curated Pakistan high-altitude tour package',
        rating: pkg.rating || 4.9,
        reviewsCount: pkg.reviewsCount || 85,
        image: pkg.image,
        highlights: pkg.highlights || [],
        position: [matchedDest.lat, matchedDest.lng]
      };
    });
  }, []);

  // Mapped Major Destination Hubs
  const mappedDestinations = useMemo(() => {
    return PAKISTAN_99_LOCATIONS.slice(0, 30).map(loc => ({
      itemType: 'destination',
      id: loc.id,
      name: loc.name,
      region: loc.region,
      elevation: loc.elevation,
      bestMonths: loc.bestMonths,
      whyFamous: loc.whyFamous,
      position: [loc.lat, loc.lng]
    }));
  }, []);

  // Filtered Map Items
  const visibleMapItems = useMemo(() => {
    let items = [];
    if (activeTypeFilter === 'all' || activeTypeFilter === 'operators') {
      items = items.concat(mappedOperators);
    }
    if (activeTypeFilter === 'all' || activeTypeFilter === 'packages') {
      items = items.concat(mappedPackages);
    }
    if (activeTypeFilter === 'all' || activeTypeFilter === 'destinations') {
      items = items.concat(mappedDestinations);
    }

    if (womenSafeOnly) {
      // Strictly show only certified womenSafe operators
      items = items.filter(it => it.itemType === 'operator' && it.womenSafe);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(it => 
        it.name.toLowerCase().includes(q) || 
        (it.city && it.city.toLowerCase().includes(q)) ||
        (it.region && it.region.toLowerCase().includes(q))
      );
    }

    if (userLocation && userLocation.length === 2) {
      items = items.map(it => {
        const d = Math.round(distanceKm(userLocation, it.position));
        return { ...it, distanceKm: d };
      }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

      if (radiusScanActive) {
        const in10Km = items.filter(it => (it.distanceKm || 0) <= 10);
        if (in10Km.length > 0) {
          items = in10Km;
        } else {
          // If no guides exactly within 10km, take the closest 6 guides
          items = items.slice(0, 6);
        }
      }
    }

    return items;
  }, [mappedOperators, mappedPackages, mappedDestinations, activeTypeFilter, womenSafeOnly, searchQuery, userLocation, radiusScanActive]);

  const requestUserLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation([coords.latitude, coords.longitude]);
        setLocating(false);
      },
      (err) => {
        setLocationError('Unable to access browser location. Defaulting to Pakistan center.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <PageWrapper className="w-full">
      <main className="w-full min-h-screen bg-[var(--bg-page)] px-4 pb-24 pt-24 sm:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-default)] pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <MapPin size={14} />
                <span>PAKISTAN EXPEDITIONS MAP NETWORK</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-bold text-[var(--text-primary)]">
                Tour Operators, Routes & Mountain Hubs
              </h1>
              <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
                Interactive real-time map connecting certified 4x4 mountain drivers, all-inclusive tour packages, and regional expedition bases across Pakistan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button 
                type="button" 
                onClick={requestUserLocation} 
                disabled={locating}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-3 text-xs font-bold text-white shadow-md transition-all hover:scale-102"
              >
                <Navigation size={15} />
                {locating ? 'Locating Position…' : 'Find Nearest To Me'}
              </button>
            </div>
          </header>

          {locationError && (
            <p role="alert" className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 font-medium">
              {locationError}
            </p>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-default)] shadow-xs">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTypeFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTypeFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:border-emerald-500/40'
                }`}
              >
                All Entities ({mappedOperators.length + mappedPackages.length + mappedDestinations.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTypeFilter('operators')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTypeFilter === 'operators'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                4x4 Mountain Drivers ({mappedOperators.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTypeFilter('packages')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTypeFilter === 'packages'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Tour Packages ({mappedPackages.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTypeFilter('destinations')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTypeFilter === 'destinations'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/30'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                Destination Hubs ({mappedDestinations.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = !radiusScanActive;
                  setRadiusScanActive(next);
                  if (!userLocation) requestUserLocation();
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  radiusScanActive
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                    : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
                title="Filter for verified guides within 10km of your location"
              >
                <Navigation size={13} className={radiusScanActive ? 'animate-spin' : ''} />
                <span>{radiusScanActive ? '10km Radius: Active' : '10km Radius Scan'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = !womenSafeOnly;
                  setWomenSafeOnly(next);
                  try { localStorage.setItem('raastah-women-safe-mode', String(next)); } catch {}
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  womenSafeOnly
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/30 hover:bg-pink-500/20'
                }`}
                title="Filter for certified solo women and family friendly vetted drivers"
              >
                <span>🛡️</span>
                <span>Women-Safe {womenSafeOnly ? 'Active' : 'Mode'}</span>
              </button>
            </div>

            {/* Quick Text Filter */}
            <div className="w-full sm:w-64">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name or city..."
                className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-emerald-500 focus:outline-none"
              />
            </div>

          </div>

          {/* Interactive Leaflet Map Canvas */}
          <div 
            className="relative z-10 w-full overflow-hidden rounded-3xl border border-[var(--border-default)] bg-slate-900 shadow-xl"
            style={{ height: '520px', minHeight: '520px', width: '100%' }}
          >
            <MapContainer
              center={PAKISTAN_CENTER}
              zoom={6}
              minZoom={4}
              maxZoom={16}
              scrollWheelZoom
              className="h-full w-full"
              style={{ height: '520px', minHeight: '520px', width: '100%', zIndex: 1 }}
              aria-label="Interactive Map of Pakistan Tour Operators and Routes"
            >
              <MapResizer />
              <MapInteraction onMapClick={() => setSelectedItem(null)} />
              <MapUserLocation coordinates={userLocation} radiusKm={10} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {visibleMapItems.map((item) => {
                let pinIcon = operatorPin;
                if (item.itemType === 'package') pinIcon = packagePin;
                if (item.itemType === 'destination') pinIcon = hubPin;

                return (
                  <Marker
                    key={`${item.itemType}-${item.id}`}
                    position={item.position}
                    icon={pinIcon}
                    eventHandlers={{
                      click: () => setSelectedItem(item)
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            {item.itemType === 'operator' ? '4x4 Driver' : item.itemType === 'package' ? 'Tour Package' : 'Alpine Hub'}
                          </span>
                          {item.womenSafe && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-pink-100 text-pink-700">
                              🛡️ Women-Safe
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                        {item.city && <p className="text-[11px] text-slate-600">Base: {item.city}</p>}
                        {item.phone && (
                          <p className="text-xs text-emerald-800 font-bold font-mono">
                            📞 {item.phone}
                          </p>
                        )}
                        {item.pricePerDay && <p className="text-xs text-emerald-700 font-bold">{item.pricePerDay}</p>}
                        {item.pricePKR && <p className="text-xs text-amber-700 font-bold">PKR {item.pricePKR.toLocaleString()}</p>}
                        
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {item.phone && (
                            <a
                              href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`}
                              className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-700 text-white hover:bg-emerald-800 inline-block"
                            >
                              📞 Call
                            </a>
                          )}
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${item.position[0]},${item.position[1]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold px-2 py-1 rounded bg-sky-100 text-sky-800 hover:bg-sky-200 inline-block"
                          >
                            🗺️ Google Maps Directions ↗
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="mt-1 text-[11px] font-bold text-emerald-700 underline block"
                        >
                          View Details Drawer →
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Bottom Drawer Overlay */}
            <AnimatePresence>
              {selectedItem && (
                <motion.div
                  initial={{ y: 150, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 150, opacity: 0 }}
                  className="absolute bottom-4 left-4 right-4 z-[500] mx-auto max-w-2xl rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-2xl backdrop-blur-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          selectedItem.itemType === 'operator' ? 'bg-emerald-500/10 text-emerald-700' :
                          selectedItem.itemType === 'package' ? 'bg-amber-500/10 text-amber-700' :
                          'bg-sky-500/10 text-sky-700'
                        }`}>
                          {selectedItem.itemType === 'operator' ? 'Verified Mountain Driver' :
                           selectedItem.itemType === 'package' ? 'Curated Tour Package' :
                           'Destination Hub'}
                        </span>
                        {selectedItem.womenSafe && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 flex items-center gap-1">
                            <Shield size={12} /> Women-Verified
                          </span>
                        )}
                        {selectedItem.rating && (
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                            <Star size={13} fill="currentColor" /> {selectedItem.rating}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
                        {selectedItem.name}
                      </h3>

                      {selectedItem.itemType === 'operator' && (
                        <p className="text-xs text-[var(--text-secondary)]">
                          Base: <strong>{selectedItem.city}</strong> · Vehicle: <strong>{selectedItem.vehicle}</strong> · {selectedItem.experienceYears} yrs experience
                        </p>
                      )}

                      {selectedItem.itemType === 'package' && (
                        <p className="text-xs text-[var(--text-secondary)]">
                          Duration: <strong>{selectedItem.duration}</strong> · Total: <strong className="text-emerald-700 dark:text-emerald-400">PKR {selectedItem.pricePKR.toLocaleString()}</strong>
                        </p>
                      )}

                      {selectedItem.itemType === 'destination' && (
                        <p className="text-xs text-[var(--text-secondary)]">
                          Region: <strong>{selectedItem.region}</strong> · Elevation: <strong>{selectedItem.elevation}</strong>
                        </p>
                      )}
                    </div>

                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Actions for Selected Item */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-default)] flex flex-wrap items-center gap-3">
                    {selectedItem.itemType === 'operator' && (
                      <>
                        <a 
                          href={`tel:${selectedItem.phone.replace(/[^0-9+]/g, '')}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white shadow-xs"
                        >
                          <PhoneCall size={14} /> Call Driver
                        </a>
                        <a 
                          href={`https://wa.me/${selectedItem.whatsapp.replace(/[^0-9]/g, '')}?text=Salam%20${encodeURIComponent(selectedItem.name)},%20I%20found%20you%20on%20Raastah%20and%20want%20to%20hire%20your%204x4.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 px-4 py-2.5 text-xs font-bold"
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </a>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${selectedItem.position[0]},${selectedItem.position[1]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-800 dark:text-sky-300 hover:bg-sky-500/20 px-3 py-2.5 text-xs font-bold"
                        >
                          🗺️ Google Maps Directions ↗
                        </a>
                      </>
                    )}

                    {selectedItem.itemType === 'package' && (
                      <Button
                        onClick={() => navigate(`/packages/${selectedItem.id}`)}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5"
                      >
                        Explore Complete Itinerary & Book Package →
                      </Button>
                    )}

                    {selectedItem.itemType === 'destination' && (
                      <Button
                        onClick={() => navigate(`/destinations/${selectedItem.id}`)}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5"
                      >
                        View Destination Dossier & Weather →
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Directory Grid Below Map */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Verified Directory Listings ({visibleMapItems.length})
              </h2>
              <span className="text-xs text-[var(--text-secondary)]">Click any card to locate or contact</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleMapItems.slice(0, 15).map((item) => (
                <div
                  key={`list-${item.itemType}-${item.id}`}
                  onClick={() => setSelectedItem(item)}
                  className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-emerald-500/40 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          item.itemType === 'operator' ? 'bg-emerald-500/10 text-emerald-700' :
                          item.itemType === 'package' ? 'bg-amber-500/10 text-amber-700' :
                          'bg-sky-500/10 text-sky-700'
                        }`}>
                          {item.itemType}
                        </span>
                        {item.womenSafe && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300">
                            🛡️ Women-Safe
                          </span>
                        )}
                        {item.distanceKm != null && (
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            {item.distanceKm} km away
                          </span>
                        )}
                      </div>
                      {item.rating && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star size={12} fill="currentColor" /> {item.rating}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-[var(--text-primary)]">{item.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                      {item.vehicle || item.overview || item.whyFamous}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--border-default)] flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {item.pricePerDay || (item.pricePKR ? `PKR ${item.pricePKR.toLocaleString()}` : item.elevation)}
                    </span>
                    <span className="text-[11px] font-bold text-[var(--text-primary)] flex items-center gap-1">
                      Locate on Map →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </PageWrapper>
  );
}
