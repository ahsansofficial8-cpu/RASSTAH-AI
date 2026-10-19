import { useEffect, useState } from 'react';
import { LoaderCircle, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import { PAKISTAN_99_LOCATIONS } from '@/data/pakistan59Locations';

function useLocationSuggestions(query) {
  const [result, setResult] = useState({ query: '', locations: [], unavailable: false });
  const [loadingQuery, setLoadingQuery] = useState('');
  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed.length < 3) {
      return undefined;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoadingQuery(trimmed);
      try {
        const response = await fetch(`/api/routes/search-locations?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || `Location search returned HTTP ${response.status}`);
        setResult({ query: trimmed, locations: payload.locations || [], unavailable: false });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn('Location suggestions are unavailable; free-text routing remains available.', error);
          setResult({ query: trimmed, locations: [], unavailable: true });
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingQuery((current) => current === trimmed ? '' : current);
        }
      }
    }, 1100);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [trimmed]);

  return {
    locations: result.query === trimmed ? result.locations : [],
    unavailable: result.query === trimmed && result.unavailable,
    loading: loadingQuery === trimmed
  };
}

function LocationField({ id, label, value, onChange, selected, onSelect, placeholder }) {
  const { locations, loading, unavailable } = useLocationSuggestions(selected ? '' : value);
  const suggestions = selected ? [] : locations;

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-xs font-semibold text-[var(--text-secondary)]">
        {label}
      </label>
      <div className="relative mt-1">
        <MapPin size={15} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={suggestions.length > 0}
          aria-controls={`${id}-suggestions`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          maxLength={120}
          required
          className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
        {loading && <LoaderCircle size={15} aria-label="Searching locations" className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--brand-primary)]" />}
      </div>
      {suggestions.length > 0 && (
        <ul id={`${id}-suggestions`} role="listbox" className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-1 shadow-lg">
          {suggestions.map((location) => (
            <li key={`${location.lat}:${location.lng}:${location.name}`} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => onSelect(location)}
                className="w-full rounded-md px-3 py-2 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              >
                {location.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {!selected && value.trim().length >= 3 && !loading && suggestions.length === 0 && (
        <p className="mt-1 text-[10px] text-[var(--text-muted)]">
          {unavailable
            ? 'OpenStreetMap suggestions are unavailable right now. You can still try this typed place.'
            : 'No suggestions found. You can still try this typed place.'}
        </p>
      )}
    </div>
  );
}

export default function RouteSelector({ initialDestinationId = '' }) {
  const initialDestination = PAKISTAN_99_LOCATIONS.find((location) => location.id === initialDestinationId);
  const [origin, setOrigin] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [destination, setDestination] = useState(initialDestination?.name || '');
  const [selectedDestination, setSelectedDestination] = useState(initialDestination
    ? { name: initialDestination.name, lat: initialDestination.lat, lng: initialDestination.lng }
    : null);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateOrigin = (value) => {
    setOrigin(value);
    setSelectedOrigin(null);
    setRoute(null);
  };
  const updateDestination = (value) => {
    setDestination(value);
    setSelectedDestination(null);
    setRoute(null);
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setRoute(null);
    if (!origin.trim() || !destination.trim()) {
      setError('Enter an origin and destination.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/routes/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: selectedOrigin || origin.trim(),
          destination: selectedDestination || destination.trim()
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || `Route lookup returned HTTP ${response.status}`);
      setRoute(payload);
    } catch (lookupError) {
      console.error('Unable to calculate the selected route', lookupError);
      setError(lookupError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-5xl mx-auto flex flex-col gap-5 p-6 sm:p-8 bg-slate-50/80 rounded-2xl border border-slate-200/90 shadow-sm" aria-labelledby="route-selector-title">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h3 id="route-selector-title" className="m-0 text-lg font-display font-bold text-slate-900">
            Interactive Pakistan Route Estimator
          </h3>
          <p className="mb-0 text-xs text-slate-500 mt-1">
            Real-time driving distance and estimated highway travel duration powered by OpenStreetMap & OSRM routing engine.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold w-fit">
          <MapPin size={13} />
          <span>OSRM Live Network</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <LocationField
            id="route-origin"
            label="Origin City or Landmark"
            value={origin}
            selected={selectedOrigin}
            onChange={updateOrigin}
            onSelect={(location) => { setOrigin(location.name); setSelectedOrigin(location); setRoute(null); }}
            placeholder="e.g. Islamabad, Lahore, Peshawar, Rawalpindi"
          />
          <LocationField
            id="route-destination"
            label="Destination Mountain Valley"
            value={destination}
            selected={selectedDestination}
            onChange={updateDestination}
            onSelect={(location) => { setDestination(location.name); setSelectedDestination(location); setRoute(null); }}
            placeholder="e.g. Hunza, Skardu, Kalam, Naran, Babusar"
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button 
            type="submit" 
            className="w-full sm:w-auto px-8 py-3 bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all hover:scale-105" 
            disabled={loading || !origin.trim() || !destination.trim()}
          >
            {loading ? <LoaderCircle size={16} className="animate-spin" /> : 'Calculate Route & Duration'}
          </Button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {route && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4" aria-live="polite">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-700 block mb-0.5">Calculated Route</span>
              <p className="mb-0 text-lg font-display font-bold text-slate-900">
                {route.origin.name} → {route.destination}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-emerald-50 text-emerald-900 px-4 py-2 rounded-xl border border-emerald-200 font-mono text-sm font-bold w-fit">
              <span>{route.distanceKm.toLocaleString()} km</span>
              <span>·</span>
              <span>approx. {route.durationHours} hrs</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Total Driving Distance</span>
              <span className="text-sm font-bold text-slate-900">{route.distanceKm.toLocaleString()} Kilometers</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Approx. Driving Time</span>
              <span className="text-sm font-bold text-slate-900">{route.durationHours} Hours (non-stop)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Estimated Fuel Budget</span>
              <span className="text-sm font-bold text-emerald-700">
                ~PKR {Math.round((route.distanceKm / 10) * 285).toLocaleString()}
              </span>
            </div>
          </div>

          {route.alternativeRoutes?.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-2 text-xs font-semibold text-slate-900">Alternative OSRM Highway Passes:</p>
              <ul className="space-y-1.5">
                {route.alternativeRoutes.map((alternative) => (
                  <li key={alternative.option} className="text-xs text-slate-600 flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="font-medium">Option {alternative.option}</span>
                    <span className="font-mono text-slate-800 font-semibold">{alternative.distanceKm.toLocaleString()} km · ~{alternative.durationHours} hrs</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mb-0 text-[11px] text-slate-400 pt-1">
            Live OSRM query · fetched {new Date(route.fetchedAt).toLocaleTimeString()}. Mountain pass travel durations may vary with seasonal road work or weather closures.
          </p>
        </div>
      )}
    </section>
  );
}
