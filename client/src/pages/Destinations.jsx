/**
 * ==============================================================================
 * RAASTAH (راستہ) — THE INTELLIGENT WAY
 * Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich
 * ==============================================================================
 * FILE: Destinations.jsx
 * PATH: client/src/pages/Destinations.jsx
 * PURPOSE: Directory of 99 catalogue locations with regional/elevation filters and destination details.
 * LAST UPDATED: October 2026
 * ==============================================================================
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import DestinationImage from '@/components/ui/DestinationImage';
import { PAKISTAN_99_LOCATIONS, REGIONS } from '@/data/pakistan59Locations';
import { fuzzySearchLocations } from '@/utils/fuzzySearch';
import { 
  Search, MapPin, Mountain, Sparkles, ArrowRight
} from 'lucide-react';

const EXPERIENCE_CATEGORIES = [
  'All experiences',
  'Adventure',
  'Water & coast',
  'Nature & wildlife',
  'Culture & heritage',
  'Local experiences'
];

function getExperienceCategory(activity) {
  const name = activity.toLocaleLowerCase();
  if (/trek|hike|climb|ski|snowboard|paraglid|jeep|safari|horse|camp|zip.line|cliff.jump|rope.bridge|dune|trail|rafting/.test(name)) {
    return 'Adventure';
  }
  if (/lake|boat|river|water|sea|beach|snorkel|div|coast|fish|swim|waterfall|cruise/.test(name)) {
    return 'Water & coast';
  }
  if (/wildlife|bear|bird|forest|nature|wildflower|glacier|viewpoint|photograph|stargaz|star/.test(name)) {
    return 'Nature & wildlife';
  }
  if (/fort|museum|heritage|histor|temple|shrine|mosque|bazaar|food|craft|palace|monument|archaeolog|market|culture|village|tomb|manuscript|architecture|workshop|cafe|coffee/.test(name)) {
    return 'Culture & heritage';
  }
  return 'Local experiences';
}

export default function Destinations() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [selectedRegion, setSelectedRegion] = useState('All Pakistan (99 Spots)');
  const [selectedCategory, setSelectedCategory] = useState('All experiences');
  const activeView = location.pathname === '/experiences' ? 'experiences' : 'destinations';

  const searchableSpots = activeView === 'experiences'
    ? PAKISTAN_99_LOCATIONS.map((spot) => ({
      ...spot,
      whyFamous: [spot.whyFamous, ...(spot.activities || [])].filter(Boolean).join(' ')
    }))
    : PAKISTAN_99_LOCATIONS;
  const searchedSpots = fuzzySearchLocations(searchableSpots, searchTerm);
  const filteredSpots = searchedSpots.filter(spot => {
    const matchesRegion = selectedRegion === 'All Pakistan (99 Spots)' || spot.region.includes(selectedRegion);
    return matchesRegion;
  });
  const filteredExperiences = filteredSpots.flatMap((spot) => (spot.activities || [])
    .map((activity) => ({ activity, category: getExperienceCategory(activity), spot }))
    .filter(({ category }) => selectedCategory === 'All experiences' || category === selectedCategory));

  return (
    <PageWrapper>
      <div className="destination-page mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-10">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-primary)]">
              <Sparkles size={14} aria-hidden="true" />
              <span>DESTINATIONS & EXPERIENCES ACROSS PAKISTAN</span>
            </div>
            <h1 className="text-4xl font-display font-extrabold text-[var(--text-primary)] sm:text-6xl">
              {activeView === 'destinations' ? '99 Pakistani Destinations' : 'Explore Pakistan Experiences'}
            </h1>
            <p className="mt-2 max-w-2xl font-body text-sm text-[var(--text-secondary)] sm:text-base">
              Browse destinations or activity ideas from Raastah’s catalogue. Activity cards link to destination guidance; they are not operator offers, and prices or availability are shown only when verified.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-5 py-3 text-xs font-bold text-[var(--text-primary)]">
            <div>
              <span className="block text-[10px] uppercase text-[var(--text-muted)]">
                {activeView === 'destinations' ? 'Destination Catalogue' : 'Catalogue Activities'}
              </span>
              <span className="text-xl font-display font-bold text-[var(--brand-primary)]">
                {activeView === 'destinations'
                  ? `${filteredSpots.length} / ${PAKISTAN_99_LOCATIONS.length} Locations`
                  : `${filteredExperiences.length} Activities`}
              </span>
            </div>
            <div className="h-8 w-px bg-[var(--border-default)]" />
            <div>
              <span className="block text-[10px] uppercase text-[var(--text-muted)]">Prices & availability</span>
              <span className="text-sm text-[var(--text-secondary)]">Shown when verified</span>
            </div>
          </div>
        </div>

        {/* Dynamic Filter Capsule Bar */}
        <div className="mb-10 space-y-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-card sm:px-6 sm:py-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Browse destinations or activities">
            {[
              { id: 'destinations', label: 'Destinations' },
              { id: 'experiences', label: 'Experiences' }
            ].map((view) => (
              <button
                key={view.id}
                type="button"
                aria-pressed={activeView === view.id}
                onClick={() => {
                  setSelectedCategory('All experiences');
                  const search = searchTerm.trim() ? `?search=${encodeURIComponent(searchTerm.trim())}` : '';
                  navigate(`${view.id === 'experiences' ? '/experiences' : '/destinations'}${search}`);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeView === view.id
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            
            {/* Search Bar */}
            <div className="flex w-full items-center gap-3 rounded-full border border-[var(--border-default)] bg-[var(--bg-page)] px-3.5 py-1.5 md:w-96">
              <Search size={18} className="shrink-0 text-[var(--brand-primary)]" aria-hidden="true" />
              <input
                type="text"
                placeholder={activeView === 'experiences'
                  ? 'Search activities, destinations, or regions...'
                  : 'Search destinations, regions, or attractions...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
              />
            </div>
          </div>

          {activeView === 'experiences' && (
            <div className="flex gap-2 overflow-x-auto border-t border-[var(--border-default)] pt-3" aria-label="Filter experiences by category">
              {EXPERIENCE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-[var(--brand-primary)] font-bold text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Region Filter Bar */}
          <div className="flex gap-2 overflow-x-auto border-t border-[var(--border-default)] pt-3" aria-label="Filter by region">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  selectedRegion === region
                    ? 'bg-[var(--brand-primary)] font-bold text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {activeView === 'destinations' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSpots.map((spot) => (
              <Link
                key={spot.id}
                to={`/destinations/${spot.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)]"
              >
                <div className="relative h-56 overflow-hidden bg-[var(--bg-subtle)]">
                  <DestinationImage
                    key={`${spot.id}:${searchTerm}`}
                    alt={spot.name}
                    destinationId={spot.id}
                    locationName={`${spot.name} Pakistan`}
                    fill
                    className="transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-bold text-white">
                      <Mountain size={12} className="text-amber-300" />
                      <span>{spot.elevation}</span>
                    </span>
                    <span className="rounded-full bg-black/65 px-2 py-0.5 text-[10px] text-white">
                      {spot.difficulty}
                    </span>
                  </div>

                  <span className="absolute right-3 top-3 rounded-full bg-black/65 px-3 py-1 font-urdu text-sm font-bold text-white" dir="rtl">
                    {spot.urdu}
                  </span>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <div className="flex flex-1 flex-col gap-3.5 p-5">
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1 font-semibold text-[var(--brand-primary)]">
                      <MapPin size={13} aria-hidden="true" />
                      <span>{spot.region}</span>
                    </span>
                  </div>

                  <h2 className="m-0 line-clamp-2 font-display text-xl font-bold leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--brand-primary)]">
                    {spot.name}
                  </h2>

                  <div className="space-y-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)] p-3 text-xs text-[var(--text-secondary)]">
                    <p className="mb-0 line-clamp-2 leading-relaxed">
                      <strong className="text-[var(--text-primary)]">Why visit: </strong>{spot.whyFamous}
                    </p>
                    <p className="mb-0 line-clamp-1 text-[11px] text-[var(--text-muted)]">
                      <strong>Highlight: </strong>{spot.whatsUnique}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                    {(spot.activities || []).slice(0, 3).map((activity) => (
                      <span key={activity} className="rounded-full bg-[var(--brand-primary-soft)] px-2.5 py-1 text-[10px] text-[var(--brand-primary)]">{activity}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExperiences.map(({ activity, category, spot }) => (
              <article
                key={`${spot.id}-${activity}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card transition-shadow hover:shadow-lg"
              >
                <Link to={`/destinations/${spot.id}`} className="relative block h-52 overflow-hidden bg-[var(--bg-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)]">
                  <DestinationImage
                    key={`${spot.id}:${activity}:${searchTerm}`}
                    alt={`${spot.name} — ${activity}`}
                    destinationId={spot.id}
                    locationName={`${spot.name}, Pakistan`}
                    fill
                    className="transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white">
                    {category}
                  </span>
                </Link>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-primary)]">
                    <MapPin size={13} aria-hidden="true" />
                    <span>{spot.name}</span>
                  </div>
                  <h2 className="font-display text-xl font-bold leading-snug text-[var(--text-primary)]">
                    {activity}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {spot.region}{spot.bestMonths ? ` · Suggested season: ${spot.bestMonths}` : ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
                      Terrain: {spot.difficulty}
                    </span>
                    <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
                      Suggested window: {spot.bestMonths || 'Not listed'}
                    </span>
                  </div>
                  <p className="mt-auto border-t border-[var(--border-default)] pt-3 text-xs leading-relaxed text-[var(--text-muted)]">
                    Catalogue activity only. No provider, price, duration, or availability has been verified.
                  </p>
                  <Link
                    to={`/destinations/${spot.id}`}
                    className="inline-flex items-center justify-between rounded-lg border border-[var(--border-default)] px-3 py-2.5 text-sm font-semibold text-[var(--brand-primary)] transition-colors hover:bg-[var(--brand-primary-soft)]"
                  >
                    <span>View destination guidance</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
        {((activeView === 'destinations' && filteredSpots.length === 0)
          || (activeView === 'experiences' && filteredExperiences.length === 0)) && (
          <p className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-secondary)]" role="status">
            {activeView === 'experiences'
              ? 'No catalogue activities match those filters. Try another category or search.'
              : 'No destinations match that search. Try fewer words or check the spelling.'}
          </p>
        )}

      </div>
    </PageWrapper>
  );
}
