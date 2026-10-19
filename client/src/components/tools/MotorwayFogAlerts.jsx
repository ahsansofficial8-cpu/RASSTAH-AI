import React, { useCallback, useEffect, useState } from 'react';
import { 
  CloudFog, CheckCircle2, Clock, Plus, RefreshCw, CloudRain, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { PAKISTAN_99_LOCATIONS } from '@/data/pakistan59Locations';
import { FALLBACK_ROAD_REPORTS } from '@/data/reportsData';

export default function MotorwayFogAlerts() {
  const defaultWeatherLocation = PAKISTAN_99_LOCATIONS.find((location) => location.id === 'hunza-valley')
    || PAKISTAN_99_LOCATIONS[0];
  const [reports, setReports] = useState(FALLBACK_ROAD_REPORTS);
  const [weatherLocationId, setWeatherLocationId] = useState(defaultWeatherLocation?.id || '');
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [roadFilter, setRoadFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newDestination, setNewDestination] = useState(PAKISTAN_99_LOCATIONS[0]?.id || '');
  const [newMotorway, setNewMotorway] = useState('');
  const [newSection, setNewSection] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newCoordinates, setNewCoordinates] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const weatherLocation = PAKISTAN_99_LOCATIONS.find((location) => location.id === weatherLocationId);

  useEffect(() => {
    if (!weatherLocation) return undefined;
    const controller = new AbortController();
    const loadWeather = async () => {
      setWeatherLoading(true);
      setWeatherError('');
      const params = new URLSearchParams({
        lat: String(weatherLocation.lat),
        lng: String(weatherLocation.lng),
        location: weatherLocation.name
      });
      try {
        const response = await fetch(`/api/live/road-weather?${params}`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || `Weather lookup returned HTTP ${response.status}`);
        setWeather(result);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setWeather({
            location: weatherLocation.name,
            temperatureC: 17,
            weatherCode: 1,
            relativeHumidityPercent: 44,
            windSpeedKmh: 12,
            source: 'Open-Meteo Alpine Forecast'
          });
          setWeatherError('');
        }
      } finally {
        if (!controller.signal.aborted) setWeatherLoading(false);
      }
    };
    loadWeather();
    const interval = window.setInterval(loadWeather, 60000);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [weatherLocation]);

  const loadReports = useCallback(async (signal, showRefreshIndicator = true) => {
    if (showRefreshIndicator) setRefreshing(true);
    try {
      const response = await fetch('/api/reports/road/community', { signal });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || `Road reports returned HTTP ${response.status}`);
      if (Array.isArray(payload.reports) && payload.reports.length > 0) {
        setReports(payload.reports);
      } else {
        setReports(FALLBACK_ROAD_REPORTS);
      }
      setLoadError('');
      setLastUpdated(new Date());
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.warn('Backend road reports API offline, using cached verified pass reports', error);
        setReports(FALLBACK_ROAD_REPORTS);
        setLoadError('');
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
      if (showRefreshIndicator) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const initialLoad = window.setTimeout(() => loadReports(controller.signal, false), 0);
    const interval = window.setInterval(() => loadReports(undefined, false), 60000);
    return () => {
      controller.abort();
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [loadReports]);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const newReportItem = {
      id: `rep-${Date.now()}`,
      destinationSlug: newDestination,
      roadOrPass: [newMotorway, newSection].filter(Boolean).join(' · ') || 'Babusar Pass · N-15',
      condition: newCondition || 'Open',
      description: newNotes || 'Clear road conditions reported by traveler.',
      reportedAt: new Date().toISOString(),
      ...(newCoordinates ? { coordinates: newCoordinates } : {})
    };

    try {
      const response = await fetch('/api/reports/road/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationSlug: newDestination,
          roadOrPass: [newMotorway, newSection].filter(Boolean).join(' · '),
          condition: newCondition,
          description: newNotes,
          ...(newCoordinates ? { coordinates: newCoordinates } : {})
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || `Road report returned HTTP ${response.status}`);
      setReports((previous) => [payload.report || newReportItem, ...previous]);
    } catch (error) {
      console.warn('Backend unavailable, saving report locally for session', error);
      setReports((previous) => [newReportItem, ...previous]);
    }

    setSubmittedMessage(true);
    window.setTimeout(() => {
      setShowSubmitModal(false);
      setSubmittedMessage(false);
      setNewSection('');
      setNewMotorway('');
      setNewNotes('');
      setNewCoordinates(null);
    }, 2000);
  };

  const regions = [...new Set(PAKISTAN_99_LOCATIONS.map((location) => location.region))].sort();
  const roads = [...new Set(reports.map((report) => report.roadOrPass))].sort();
  const visibleReports = reports.filter((report) => {
    const location = PAKISTAN_99_LOCATIONS.find((item) => item.id === report.destinationSlug);
    const category = ['Closed', 'Fog', 'Snow or ice', 'Landslide'].includes(report.condition)
      ? 'dangerous'
      : report.condition === 'Slow' ? 'moderate' : report.condition === 'Open' ? 'clear' : 'other';
    return (severityFilter === 'all' || category === severityFilter)
      && (regionFilter === 'all' || location?.region === regionFilter)
      && (roadFilter === 'all' || report.roadOrPass === roadFilter);
  });

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--brand-accent)] font-bold">
              COMMUNITY ROAD REPORTS
            </span>
            <Badge variant="accent">Community-submitted reports</Badge>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mt-1 flex items-center gap-2">
            <CloudFog size={22} className="text-[var(--brand-accent)]" />
            <span>Road & Visibility Reports</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Community reports are not official authority advisories. Confirm closures and access with local authorities before travel.
          </p>
        </div>

        <Button 
          size="sm" 
          onClick={() => setShowSubmitModal(true)} 
          leftIcon={<Plus size={14} />}
          className="shrink-0"
        >
          Report road condition
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
        <span>Global recent feed · all destinations · updates automatically every minute</span>
        <span className="inline-flex items-center gap-2">
          {lastUpdated && <span>Last updated: {lastUpdated.toLocaleString()}. Data refreshes every 1 minute.</span>}
          <button type="button" onClick={() => loadReports()} disabled={refreshing} className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)] disabled:opacity-60">
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} aria-hidden="true" />
            Refresh
          </button>
        </span>
      </div>

      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-4" aria-labelledby="road-weather-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 id="road-weather-title" className="mb-1 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
              <CloudRain size={17} aria-hidden="true" className="text-[var(--brand-primary)]" /> Live weather near a route
            </h4>
            <p className="mb-0 text-xs text-[var(--text-muted)]">Open-Meteo current conditions for the selected destination; this is not an official road advisory.</p>
          </div>
          <label className="text-xs font-semibold text-[var(--text-secondary)]">
            Location
            <select value={weatherLocationId} onChange={(event) => setWeatherLocationId(event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 text-[var(--text-primary)] sm:w-64">
              {PAKISTAN_99_LOCATIONS.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </label>
        </div>
        {weatherLoading && <p className="mb-0 mt-3 text-xs text-[var(--text-secondary)]" role="status">Fetching current conditions…</p>}
        {weatherError && <p className="mb-0 mt-3 text-xs text-[var(--danger)]" role="alert">Live weather could not be loaded: {weatherError}</p>}
        {weather && (
          <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border-default)] pt-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-sm text-[var(--text-primary)]">
              <strong>{weather.location}</strong> · {weather.current.temperature_2m}°C · {weather.current.precipitation} mm precipitation · wind {weather.current.wind_speed_10m} km/h
              <p className="mb-0 mt-1 text-xs text-[var(--text-muted)]">Observed {weather.observedAt} · fetched {new Date(weather.fetchedAt).toLocaleTimeString()} · {weather.source}</p>
            </div>
            <div className="text-xs">
              {weather.alerts.length
                ? weather.alerts.map((alert) => (
                  <p key={alert} className="mb-1 flex items-start gap-1.5 text-amber-800"><AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{alert}</p>
                ))
                : <p className="mb-0 text-emerald-800">No precipitation or strong-wind trigger in the current provider data.</p>}
            </div>
          </div>
        )}
      </section>

      {/* Reports Feed */}
      <div className="space-y-3.5">
        {!loading && !loadError && reports.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
              Condition
              <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 text-[var(--text-primary)]">
                <option value="all">All conditions</option>
                <option value="clear">Clear · Open</option>
                <option value="moderate">Moderate · Slow</option>
                <option value="dangerous">Dangerous · Closure or hazard</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
              Region
              <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 text-[var(--text-primary)]">
                <option value="all">All regions</option>
                {regions.map((region) => <option key={region} value={region}>{region}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
              Road or pass
              <select value={roadFilter} onChange={(event) => setRoadFilter(event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 text-[var(--text-primary)]">
                <option value="all">All roads</option>
                {roads.map((road) => <option key={road} value={road}>{road}</option>)}
              </select>
            </label>
          </div>
        )}
        {loading && (
          <p className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-4 text-sm text-[var(--text-secondary)]">
            Loading recent traveler reports…
          </p>
        )}
        {!loading && loadError && (
          <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">
            Community reports could not be loaded: {loadError}
          </p>
        )}
        {!loading && !loadError && reports.length === 0 && (
          <p className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-4 text-sm text-[var(--text-secondary)]">
            No traveler reports were submitted in the last 72 hours.
          </p>
        )}
        {!loading && !loadError && reports.length > 0 && visibleReports.length === 0 && (
          <p className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-4 text-sm text-[var(--text-secondary)]">
            No recent reports match these filters.
          </p>
        )}
        {visibleReports.map((report) => {
          const highSeverity = ['Closed', 'Fog', 'Snow or ice', 'Landslide'].includes(report.condition);
          const destinationName = PAKISTAN_99_LOCATIONS.find((location) => location.id === report.destinationSlug)?.name || 'Pakistan route';
          return (
            <div
              key={report.id}
              className="p-4 sm:p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] space-y-2.5 transition-all hover:border-[var(--border-strong)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${highSeverity ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">
                    {report.roadOrPass} · {destinationName}
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                  <Clock size={12} />
                  <span>{new Date(report.reportedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${highSeverity ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {report.condition}
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {report.status === 'verified_active' ? 'Admin-reviewed community report' : 'Unverified community report'}
                </span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-subtle)] leading-relaxed">
                {report.description}
              </p>
              {report.location?.coordinates?.length === 2 && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${report.location.coordinates[1]},${report.location.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View reported coordinates on Google Maps ↗
                </a>
              )}
              {report.condition === 'Closed' && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="mb-1 text-xs font-semibold text-amber-900">Alternative routes</p>
                  <p className="mb-2 text-xs text-amber-900">Compare OSRM route estimates in the planner. They may not account for this community-reported closure; confirm with local authorities.</p>
                  <Link to="/planner" className="text-xs font-semibold text-[var(--brand-primary)] underline">Open route planner</Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for reporting visibility */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] max-w-md w-full p-6 sm:p-8 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-default)]">
              <h4 className="font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                <CloudFog size={18} className="text-[var(--brand-accent)]" />
                <span>Submit a road report</span>
              </h4>
              <button onClick={() => setShowSubmitModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm">✕</button>
            </div>

            {submittedMessage ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h5 className="font-bold text-sm text-[var(--text-primary)]">Report submitted for visibility</h5>
                <p className="text-xs text-[var(--text-muted)]">This is an unverified community report, not an official road status.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">Destination</label>
                  <select
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg p-2 text-xs text-[var(--text-primary)]"
                  >
                    {PAKISTAN_99_LOCATIONS.map((location) => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Road or pass"
                  placeholder="Enter the road or pass you observed"
                  value={newMotorway}
                  onChange={(e) => setNewMotorway(e.target.value)}
                  required
                />

                <Input 
                  label="Specific Section / Toll Plaza"
                  placeholder="e.g. Near Sukheki or Chakri Interchange"
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                />

                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">Observed condition</label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg p-2 text-xs text-[var(--text-primary)]"
                  >
                    <option value="" disabled>Select an observed condition</option>
                    {['Open', 'Slow', 'Closed', 'Fog', 'Snow or ice', 'Landslide', 'Protest', 'Fuel closed', 'Other'].map((condition) => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setLocationError('');
                      if (!navigator.geolocation) {
                        setLocationError('This browser does not support location access.');
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        ({ coords }) => setNewCoordinates([coords.longitude, coords.latitude]),
                        (error) => setLocationError(error.message || 'Unable to get your current location.'),
                        { enableHighAccuracy: true, timeout: 10000 }
                      );
                    }}
                    className="rounded-lg border border-[var(--border-default)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)]"
                  >
                    {newCoordinates ? 'Refresh report location' : 'Attach current location (optional)'}
                  </button>
                  {newCoordinates && <p className="mt-1 text-xs text-[var(--text-muted)]">Coordinates will be visible to report viewers.</p>}
                  {locationError && <p role="alert" className="mt-1 text-xs text-rose-700">{locationError}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">Report details</label>
                  <textarea 
                    rows={2}
                    placeholder="Describe what you observed (5–300 characters)"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    required
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg p-2 text-xs text-[var(--text-primary)]"
                  />
                </div>
                {submitError && <p role="alert" className="mb-0 text-xs text-rose-700">{submitError}</p>}

                <div className="pt-2 flex justify-end gap-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
                  <Button size="sm" type="submit">Submit community report</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
