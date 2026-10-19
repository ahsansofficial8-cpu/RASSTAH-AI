import { useCallback, useEffect, useState } from 'react';
import { Activity, CloudSun, Fuel, Hospital, MapPinned, Radio, Wallet } from 'lucide-react';
import RouteSelector from '@/components/tools/RouteSelector';

const REFRESH_INTERVAL_MS = 30 * 60 * 1000;
const METRIC_CACHE_TTL = {
  weather: 30 * 60 * 1000,
  currency: 60 * 60 * 1000
};

async function getJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Request failed with HTTP ${response.status}`);
  return response.json();
}

function metric(value, source, updatedAt = new Date().toISOString()) {
  return { value, source, updatedAt, status: 'live' };
}

function readCachedMetric(key) {
  try {
    const stored = localStorage.getItem(`raastah-live-${key}`);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    const metricKey = key.split('-').pop();
    const maxAge = METRIC_CACHE_TTL[metricKey];
    if (!parsed?.value || !parsed.source || !parsed.updatedAt || !maxAge) return null;
    const updatedAt = Date.parse(parsed.updatedAt);
    if (!Number.isFinite(updatedAt) || Date.now() - updatedAt > maxAge) {
      localStorage.removeItem(`raastah-live-${key}`);
      return null;
    }
    return { ...parsed, status: 'cached' };
  } catch (error) {
    console.warn(`Unable to read cached live metric ${key}`, error);
    return null;
  }
}

function storeMetric(key, value) {
  try {
    localStorage.setItem(`raastah-live-${key}`, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to cache live metric ${key}`, error);
  }
}

function metricCacheKey(destination, coordinateKey, key) {
  return key === 'roadReport' ? `${destination.id}-${key}` : `${coordinateKey}-${key}`;
}

function weatherDescription(code) {
  if (code === 0) return 'Clear sky';
  if ([1, 2, 3].includes(code)) return 'Partly cloudy';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Conditions unavailable';
}

function buildWeather(data) {
  const current = data.current;
  const daily = data.daily;
  if (!current || !daily?.time?.length) throw new Error('Weather response is missing current or forecast data');
  return metric({
    temperature: `${Math.round(current.temperature_2m)} °C`,
    condition: weatherDescription(current.weather_code),
    humidity: `${current.relative_humidity_2m}%`,
    wind: `${Math.round(current.wind_speed_10m)} km/h`,
    uv: daily.uv_index_max?.[0] == null ? 'Unavailable' : `${daily.uv_index_max[0]}`,
    forecast: daily.time.map((date, index) => ({
      date,
      high: daily.temperature_2m_max?.[index] == null ? 'Unavailable' : `${Math.round(daily.temperature_2m_max[index])} °C`,
      low: daily.temperature_2m_min?.[index] == null ? 'Unavailable' : `${Math.round(daily.temperature_2m_min[index])} °C`,
      rain: daily.precipitation_probability_max?.[index] == null ? 'Unavailable' : `${daily.precipitation_probability_max[index]}%`
    }))
  }, 'Open-Meteo');
}

async function loadOverpass(coordinates, signal) {
  const data = await getJson(`/api/live/facilities?lat=${coordinates.lat}&lng=${coordinates.lng}`, signal);
  const toMetric = (facility) => metric(
    facility ? { name: facility.name, distance: `${facility.distanceKm.toFixed(1)} km` } : null,
    data.source || 'OpenStreetMap Overpass'
  );
  return { hospital: toMetric(data.hospital), fuelStation: toMetric(data.fuelStation) };
}

async function fetchMetrics(destination, signal) {
  const { lat, lng } = destination;
  const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
  weatherUrl.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max',
    forecast_days: '7',
    timezone: 'auto'
  });
  const currencyUrl = '/api/live/currency';
  const prayerUrl = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=1`;
  const roadReportsUrl = `/api/reports/road/community?destinationSlug=${encodeURIComponent(destination.id)}`;

  const results = await Promise.allSettled([
    getJson(weatherUrl, signal),
    getJson(currencyUrl, signal),
    loadOverpass(destination, signal),
    getJson(prayerUrl, signal),
    getJson(roadReportsUrl, signal)
  ]);
  if (signal.aborted) return { data: {}, failures: {} };

  const data = {};
  const failures = {};
  const load = (index, key, transform, source) => {
    const result = results[index];
    if (result.status !== 'fulfilled') {
      failures[key] = result.reason;
      return;
    }
    try {
      data[key] = transform(result.value, source);
    } catch (error) {
      failures[key] = error;
    }
  };

  load(0, 'weather', buildWeather);
  load(1, 'currency', (response) => {
    if (!Number.isFinite(response.rate)) throw new Error('Exchange rate response did not include PKR');
    return metric({
      date: response.updatedAt || new Date().toISOString(),
      rates: { PKR: response.rate }
    }, response.source || 'Exchange Rate API', response.updatedAt || new Date().toISOString());
  });
  if (results[2].status === 'fulfilled') {
    data.hospital = results[2].value.hospital || null;
    data.fuelStation = results[2].value.fuelStation || null;
  } else {
    failures.hospital = results[2].reason;
    failures.fuelStation = results[2].reason;
  }
  load(3, 'prayer', (response) => {
    if (response.code !== 200 || !response.data?.timings) throw new Error('Prayer-time service returned no timings');
    const { Fajr, Dhuhr, Asr, Maghrib, Isha } = response.data.timings;
    return metric({ Fajr, Dhuhr, Asr, Maghrib, Isha }, 'Aladhan');
  });
  if (results[4].status === 'fulfilled') {
    const report = results[4].value.reports?.[0];
    const reviewed = report?.status === 'verified_active';
    data.roadReport = report
      ? { ...metric({
          roadOrPass: report.roadOrPass,
          condition: report.condition,
          description: report.description
        }, reviewed ? 'Admin-reviewed traveler report (not an official authority feed)' : 'Traveler report (unverified)', report.reportedAt), status: reviewed ? 'reviewed' : 'unverified' }
      : null;
  } else {
    failures.roadReport = results[4].reason;
  }

  return { data, failures };
}

function LiveStatus({ value, error }) {
  if (!value) {
    return <span className="text-xs text-[var(--text-muted)]">{error ? 'Offline · source unavailable' : 'Loading live source…'}</span>;
  }
  const updated = new Date(value.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <span className="text-[10px] font-medium text-[var(--text-muted)]">
      {value.status === 'unverified' ? 'Unverified report' : value.status === 'reviewed' ? 'Admin-reviewed report' : value.status === 'live' ? 'Live' : 'Cached'} · updated {updated} · {value.source}
    </span>
  );
}

function DataCard({ icon: Icon, title, metric: value, error, unavailable, emptyLabel, loading = false, showStatus = true, children }) {
  return (
    <article className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2 text-[var(--brand-primary)]">
        <Icon size={17} />
        <h3 className="m-0 text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      </div>
      {children || <p className="mb-2 text-sm text-[var(--text-primary)]">{value?.value ?? emptyLabel ?? 'This live source did not return a value.'}</p>}
      {showStatus && (
        value ? <LiveStatus value={value} /> : loading && !error && !unavailable
          ? <span className="text-xs text-[var(--text-muted)]">Loading live source…</span>
          : error || unavailable
            ? <LiveStatus error={error || new Error(unavailable)} />
            : <span className="text-xs text-[var(--text-muted)]">{emptyLabel || 'No live result returned.'}</span>
      )}
      {(error || unavailable) && (
        <p className="mb-0 mt-2 text-[11px] text-[var(--text-muted)]">
          {error?.message || unavailable}
        </p>
      )}
    </article>
  );
}

export default function LiveDataPanel({ destination, onDataChange }) {
  const cacheKey = `${destination.lat.toFixed(3)}-${destination.lng.toFixed(3)}`;
  const [snapshot, setSnapshot] = useState(() => {
    const data = {};
    for (const key of ['weather', 'currency', 'hospital', 'fuelStation', 'prayer']) {
      const cached = readCachedMetric(metricCacheKey(destination, cacheKey, key));
      if (cached) data[key] = cached;
    }
    return { data, errors: {}, refreshedAt: null, loading: true };
  });
  const refresh = useCallback(async (signal) => {
    try {
      const { data, failures } = await fetchMetrics(destination, signal);
      setSnapshot((previous) => {
        const merged = { ...previous.data };
        const errors = {};
        for (const [key, value] of Object.entries(data)) {
          merged[key] = value;
          if (METRIC_CACHE_TTL[key] && value) {
            storeMetric(metricCacheKey(destination, cacheKey, key), value);
          }
        }
        for (const [key, error] of Object.entries(failures)) {
          if (METRIC_CACHE_TTL[key] && merged[key]) {
            merged[key] = { ...merged[key], status: 'cached' };
          } else {
            delete merged[key];
            errors[key] = error;
          }
        }
        return { data: merged, errors, refreshedAt: new Date().toISOString(), loading: false };
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(`Unable to refresh live data for ${destination.name}`, error);
        setSnapshot((previous) => {
          const next = {
            ...previous,
            errors: Object.fromEntries(Object.keys(previous.data).map((key) => [key, error])),
            loading: false
          };
          return next;
        });
      }
    }
  }, [destination, cacheKey]);

  useEffect(() => {
    const controller = new AbortController();
    refresh(controller.signal);
    const interval = window.setInterval(() => refresh(controller.signal), REFRESH_INTERVAL_MS);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [refresh]);

  useEffect(() => {
    onDataChange?.(snapshot);
  }, [snapshot, onDataChange]);

  const { data, errors } = snapshot;
  const rates = data.currency?.value?.rates;

  return (
    <section className="space-y-4" aria-label={`Live travel data for ${destination.name}`}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">Live source dashboard</span>
          <h2 className="mb-0 mt-1 text-2xl font-display font-bold text-[var(--text-primary)]">{destination.name}</h2>
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          Refreshes every 30 minutes · Catalogue coordinates may be approximate
        </span>
      </div>
      <RouteSelector initialDestinationId={destination.id} />
      {snapshot.loading && Object.keys(data).length === 0 && (
        <p className="mb-0 text-xs text-[var(--text-muted)]">Loading available sources; metrics will appear as each source responds.</p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DataCard icon={CloudSun} title="Weather" metric={data.weather} error={errors.weather} emptyLabel="Open-Meteo forecast is temporarily unavailable.">
          {data.weather ? (
            <div className="mb-2">
              <p className="mb-1 text-lg font-semibold text-[var(--text-primary)]">
                {data.weather.value.temperature} · {data.weather.value.condition}
              </p>
              <p className="mb-2 text-xs text-[var(--text-secondary)]">
                Humidity {data.weather.value.humidity} · Wind {data.weather.value.wind} · UV {data.weather.value.uv}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {data.weather.value.forecast.map((day) => (
                  <span key={day.date} className="shrink-0 rounded-lg bg-[var(--bg-subtle)] px-2 py-1 text-[10px] text-[var(--text-secondary)]">
                    {day.date.slice(5)} · {day.high}/{day.low} · rain {day.rain}
                  </span>
                ))}
              </div>
            </div>
          ) : <p className="mb-2 text-sm text-[var(--text-secondary)]">
            {errors.weather ? 'Weather data is temporarily unavailable.' : 'Loading current conditions and seven-day forecast…'}
          </p>}
        </DataCard>
        <DataCard icon={Activity} title="USD currency rates" metric={data.currency} error={errors.currency} emptyLabel="Exchange rate is temporarily unavailable.">
          {rates && (
            <p className="mb-2 text-sm text-[var(--text-primary)]">
              1 USD = {Number(rates.PKR).toFixed(2)} PKR
              <span className="block text-[10px] text-[var(--text-muted)]">As of {data.currency.value.date}</span>
            </p>
          )}
          {!rates && <p className="mb-2 text-sm text-[var(--text-secondary)]">{errors.currency ? 'Exchange rate is temporarily unavailable.' : 'Loading the latest USD/PKR rate…'}</p>}
          <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer" className="text-[10px] text-[var(--brand-primary)] underline">
            Rates By Exchange Rate API
          </a>
        </DataCard>
        <DataCard icon={Hospital} title="Nearest mapped medical facility" metric={data.hospital} error={errors.hospital} emptyLabel="No mapped facility nearby.">
          {data.hospital?.value ? (
            <p className="mb-2 text-sm text-[var(--text-primary)]">
              {data.hospital.value.name} · {data.hospital.value.distance}
            </p>
          ) : <p className="mb-2 text-sm text-[var(--text-secondary)]">
            {errors.hospital ? 'Facility lookup is temporarily unavailable.' : data.hospital ? 'No mapped facility nearby.' : 'Searching OpenStreetMap within 50 km…'}
          </p>}
        </DataCard>
        <DataCard icon={MapPinned} title="Nearest mapped fuel station" metric={data.fuelStation} error={errors.fuelStation} emptyLabel="No mapped facility nearby.">
          {data.fuelStation?.value ? (
            <p className="mb-2 text-sm text-[var(--text-primary)]">
              {data.fuelStation.value.name} · {data.fuelStation.value.distance}
            </p>
          ) : <p className="mb-2 text-sm text-[var(--text-secondary)]">
            {errors.fuelStation ? 'Facility lookup is temporarily unavailable.' : data.fuelStation ? 'No mapped facility nearby.' : 'Searching OpenStreetMap within 50 km…'}
          </p>}
        </DataCard>
        <DataCard icon={Fuel} title="Estimated fuel cost" showStatus={false}>
          <p className="mb-2 text-sm font-semibold text-[var(--text-primary)]">PKR 2,800 per 100 km</p>
          <p className="mb-2 text-[11px] text-[var(--text-secondary)]">Illustrative estimate using PKR 280/L and 10 L/100 km fuel consumption. Actual fuel prices and vehicle efficiency vary.</p>
        </DataCard>
        <DataCard
          icon={Radio}
          title="Community road reports"
          metric={data.roadReport}
          error={errors.roadReport}
          unavailable={!errors.roadReport && !data.roadReport ? 'No traveler report from the last 72 hours. Community reports are not official road advisories; confirm current access locally.' : undefined}
          loading={snapshot.loading}
        >
          {data.roadReport && (
            <div className="mb-2 text-sm text-[var(--text-primary)]">
              <p className="mb-1 font-semibold">{data.roadReport.value.roadOrPass} · {data.roadReport.value.condition}</p>
              <p className="mb-0 text-xs text-[var(--text-secondary)]">{data.roadReport.value.description}</p>
            </div>
          )}
        </DataCard>
        <DataCard icon={Wallet} title="Trip budget" showStatus={false}>
          <p className="mb-2 text-sm text-[var(--text-primary)]">Build a quote-based total in the trip calculator below.</p>
        </DataCard>
        <DataCard icon={Activity} title="Mobile coverage" showStatus={false}>
          <p className="mb-2 text-sm text-[var(--text-secondary)]">Check signal availability with your mobile carrier for this area.</p>
        </DataCard>
        <DataCard icon={Activity} title="Prayer times" metric={data.prayer} error={errors.prayer}>
          {data.prayer && (
            <p className="mb-2 text-xs text-[var(--text-primary)]">
              {Object.entries(data.prayer.value).map(([name, time]) => `${name}: ${time}`).join(' · ')}
            </p>
          )}
        </DataCard>
      </div>
      {snapshot.refreshedAt && (
        <p className="mb-0 text-right text-[10px] text-[var(--text-muted)]">
          Last refresh attempt: {new Date(snapshot.refreshedAt).toLocaleString()}
        </p>
      )}
    </section>
  );
}
