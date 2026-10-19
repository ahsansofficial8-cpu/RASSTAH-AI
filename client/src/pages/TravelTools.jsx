import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import MultiModalPlanner from '@/components/tools/MultiModalPlanner';
import MotorwayFogAlerts from '@/components/tools/MotorwayFogAlerts';
import EmergencySOS from '@/components/tools/EmergencySOS';
import PackingChecklist from '@/components/tools/PackingChecklist';

const TOOLS = [
  ['cost', 'Quote calculator'],
  ['transit', 'Transport options'],
  ['fog', 'Visibility reports'],
  ['passes', 'Road status'],
  ['altitude', 'Elevation'],
  ['packing', 'Packing'],
  ['sos', 'Emergency']
];

function RateInput({ label, value, onChange, step = 500 }) {
  return (
    <label className="block text-sm font-medium text-[var(--text-secondary)]">
      {label}
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] p-2.5 text-[var(--text-primary)]"
      />
    </label>
  );
}

export default function TravelTools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [travelers, setTravelers] = useState(2);
  const [days, setDays] = useState(5);
  const [rooms, setRooms] = useState(1);
  const [vehicleQuote, setVehicleQuote] = useState('');
  const [roomRate, setRoomRate] = useState('');
  const [mealRate, setMealRate] = useState('');
  const [includeJeep, setIncludeJeep] = useState(false);
  const [jeepRate, setJeepRate] = useState('');
  const [vehicleType, setVehicleType] = useState('4x4');
  const [baggageSlots, setBaggageSlots] = useState(1);
  const [extraItemsQuote, setExtraItemsQuote] = useState('');
  const [mealPreference, setMealPreference] = useState('No preference');
  const [includeGuide, setIncludeGuide] = useState(false);
  const [guideRate, setGuideRate] = useState('');
  const [elevation, setElevation] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');

  const requestedTool = searchParams.get('tab') || 'cost';
  const activeTool = TOOLS.some(([id]) => id === requestedTool) ? requestedTool : 'cost';
  const inputRates = [
    vehicleQuote,
    roomRate,
    mealRate,
    ...(includeJeep ? [jeepRate] : []),
    ...(includeGuide ? [guideRate] : []),
    ...(extraItemsQuote !== '' ? [extraItemsQuote] : [])
  ];
  const hasValidRates = inputRates.every((rate) => rate !== '' && Number.isFinite(Number(rate)) && Number(rate) >= 0);
  const costs = {
    vehicle: Number(vehicleQuote) || 0,
    accommodation: (Number(roomRate) || 0) * rooms * Math.max(0, days - 1),
    meals: (Number(mealRate) || 0) * travelers * days,
    jeep: includeJeep ? (Number(jeepRate) || 0) * days : 0,
    guide: includeGuide ? (Number(guideRate) || 0) * days : 0,
    extras: Number(extraItemsQuote) || 0
  };
  const total = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
  const quoteDetails = {
    vehicleType,
    travelers,
    rooms,
    days,
    baggageSlots,
    extraItemsQuote: Number(extraItemsQuote) || 0,
    mealPreference,
    includeGuide,
    costs,
    total,
    createdAt: new Date().toISOString()
  };

  const saveQuote = () => {
    try {
      const savedQuotes = JSON.parse(localStorage.getItem('raastah-manual-quotes') || '[]');
      localStorage.setItem('raastah-manual-quotes', JSON.stringify([quoteDetails, ...savedQuotes].slice(0, 20)));
      setQuoteMessage('Quote saved successfully to your offline travel wallet.');
    } catch (error) {
      console.error('Unable to save quote locally', error);
      setQuoteMessage('Could not save this quote on the device.');
    }
  };

  const shareQuote = () => {
    const text = `RAASTAH trip estimate: PKR ${Math.round(total).toLocaleString()} total for ${travelers} traveler(s), ${days} day(s), vehicle: ${vehicleType}. Generated via Raastah Smart Expedition Suite.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageWrapper>
      <main className="min-h-[70vh] bg-[var(--bg-page)] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <header>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">Travel tools</p>
            <h1 className="mt-2 text-3xl font-display font-bold text-[var(--text-primary)] sm:text-5xl">Plan with current information</h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--text-secondary)]">
              Live road, fuel-price, and mobile coverage feeds are not configured. Estimates below use only quotes you enter.
            </p>
          </header>

          <section className="rounded-2xl border border-rose-200 bg-[var(--bg-surface)] p-5 shadow-sm sm:p-6" aria-labelledby="quick-dial-title">
            <div className="mb-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-rose-700">Emergency support</p>
              <h2 id="quick-dial-title" className="m-0 text-xl font-display font-bold text-[var(--text-primary)]">Emergency Quick Dial</h2>
              <p className="mb-0 mt-2 text-sm text-[var(--text-secondary)]">Tap a number to open your device’s phone app. Confirm local service availability and place the call yourself.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Police', number: '15', color: 'bg-blue-700 hover:bg-blue-800' },
                { label: 'Rescue 1122', number: '1122', color: 'bg-rose-700 hover:bg-rose-800' },
                { label: 'Tourist Police', number: '1422', color: 'bg-teal-700 hover:bg-teal-800' }
              ].map(({ label, number, color }) => (
                <a
                  key={number}
                  href={`tel:${number}`}
                  className={`flex min-h-14 items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors ${color}`}
                >
                  <span>{label}</span>
                  <span className="font-mono">{number}</span>
                </a>
              ))}
            </div>
          </section>

          <nav className="flex flex-wrap gap-2" aria-label="Travel tools">
            {TOOLS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSearchParams({ tab: id })}
                aria-current={activeTool === id ? 'page' : undefined}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${activeTool === id ? 'bg-[var(--brand-primary)] text-white' : 'border border-[var(--border-default)] text-[var(--text-secondary)]'}`}
              >
                {label}
              </button>
            ))}
          </nav>

          {activeTool === 'cost' && (
            <section className="space-y-6 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6" aria-labelledby="quote-calculator-title">
              <div>
                <h2 id="quote-calculator-title" className="text-2xl font-display font-bold text-[var(--text-primary)]">Your quote calculator</h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Enter current provider quotes. No default market rates are used.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <RateInput label="Vehicle quote for full trip (PKR)" value={vehicleQuote} onChange={setVehicleQuote} />
                <RateInput label="Room rate per night (PKR)" value={roomRate} onChange={setRoomRate} />
                <RateInput label="Meals per traveler per day (PKR)" value={mealRate} onChange={setMealRate} />
                <RateInput label="Travelers" value={travelers} onChange={(value) => setTravelers(Math.max(1, Number(value) || 1))} />
                <RateInput label="Rooms" value={rooms} onChange={(value) => setRooms(Math.max(1, Number(value) || 1))} />
                <RateInput label="Trip days" value={days} onChange={(value) => setDays(Math.max(1, Number(value) || 1))} />
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input type="checkbox" checked={includeJeep} onChange={(event) => setIncludeJeep(event.target.checked)} />
                  Include local 4x4 quote
                </label>
                {includeJeep && <RateInput label="4x4 quote per day (PKR)" value={jeepRate} onChange={setJeepRate} />}
                <label className="block text-sm font-medium text-[var(--text-secondary)]">
                  Vehicle type
                  <select value={vehicleType} onChange={(event) => setVehicleType(event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] p-2.5 text-[var(--text-primary)]">
                    <option value="4x4">4x4 (Prado / Land Cruiser)</option>
                    <option value="Hiace">Hiace (14-seater)</option>
                    <option value="Coaster">Coaster (30-seater)</option>
                    <option value="Sedan">Sedan (Corolla / Civic)</option>
                    <option value="Motorcycle">Motorcycle</option>
                  </select>
                </label>
                <RateInput label="Baggage slots per traveler" value={baggageSlots} onChange={(value) => setBaggageSlots(Math.max(0, Number(value) || 0))} step={1} />
                <RateInput label="Optional extra items / permits quote (PKR)" value={extraItemsQuote} onChange={setExtraItemsQuote} />
                <label className="block text-sm font-medium text-[var(--text-secondary)]">
                  Meal preference
                  <select value={mealPreference} onChange={(event) => setMealPreference(event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] p-2.5 text-[var(--text-primary)]">
                    <option>No preference</option>
                    <option>Vegetarian</option>
                    <option>Non-vegetarian</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input type="checkbox" checked={includeGuide} onChange={(event) => setIncludeGuide(event.target.checked)} />
                  Include local guide
                </label>
                {includeGuide && <RateInput label="Guide quote per day (PKR)" value={guideRate} onChange={setGuideRate} />}
              </div>
              <div className="rounded-xl bg-[var(--bg-subtle)] p-5">
                {hasValidRates ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">Calculated from your inputs</p>
                    <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">PKR {Math.round(total).toLocaleString()}</p>
                    <p className="mt-3 text-sm text-[var(--text-secondary)]">
                      Vehicle: PKR {Math.round(costs.vehicle).toLocaleString()} · Lodging: PKR {Math.round(costs.accommodation).toLocaleString()} · Meals: PKR {Math.round(costs.meals).toLocaleString()} · 4x4: PKR {Math.round(costs.jeep).toLocaleString()} · Guide: PKR {Math.round(costs.guide).toLocaleString()} · Extras: PKR {Math.round(costs.extras).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">Approx. PKR {Math.round(total / travelers).toLocaleString()} per traveler · {baggageSlots} baggage slot(s) per traveler · {mealPreference}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={saveQuote} className="rounded-lg border border-[var(--border-default)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">Save on this device</button>
                      <button type="button" onClick={shareQuote} className="rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--text-on-brand)]">Share via WhatsApp</button>
                    </div>
                    {quoteMessage && <p className="mb-0 mt-2 text-xs text-[var(--text-secondary)]" role="status">{quoteMessage}</p>}
                  </>
                ) : (
                  <p className="mb-0 text-sm text-[var(--text-secondary)]">Enter your vehicle, room, and meal quotes to calculate a total.</p>
                )}
              </div>
            </section>
          )}

          {activeTool === 'passes' && (
            <section className="space-y-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6">
              <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">Road and pass status</h2>
              <p className="text-sm text-[var(--text-secondary)]">Confirm current closures, permits, and access with local authorities before travel.</p>
              <Link className="text-sm font-semibold text-[var(--brand-primary)] underline" to="/destinations">Open a destination page for an OSRM route estimate where available</Link>
            </section>
          )}

          {activeTool === 'transit' && (
            <section className="space-y-3">
              <p className="mb-0 text-sm text-[var(--text-secondary)]">
                Provider fares, schedules, and travel times are not live or verified here. Confirm availability directly before booking.
              </p>
              <MultiModalPlanner />
            </section>
          )}

          {activeTool === 'fog' && (
            <section className="space-y-3">
              <p className="mb-0 text-sm text-[var(--text-secondary)]">
                Community reports are not official road advisories. Confirm closures and access with local authorities before travel.
              </p>
              <MotorwayFogAlerts />
            </section>
          )}

          {activeTool === 'altitude' && (
            <section className="space-y-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6">
              <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">Elevation reference</h2>
              <RateInput label="Destination elevation (metres, verify the source)" value={elevation} onChange={setElevation} />
              {elevation !== '' && Number.isFinite(Number(elevation)) && (
                <p className="text-sm text-[var(--text-secondary)]">Entered elevation: {Number(elevation).toLocaleString()} m. This is not a medical risk assessment; seek qualified medical advice about altitude travel.</p>
              )}
            </section>
          )}

          {activeTool === 'packing' && (
            <PackingChecklist />
          )}

          {activeTool === 'sos' && (
            <section className="space-y-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6">
              <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">Emergency information</h2>
              <p className="text-sm text-[var(--text-secondary)]">Emergency numbers and service availability can vary by area. Confirm local contacts before travelling and use the official emergency services for your location.</p>
              <p className="text-sm text-[var(--text-secondary)]">Pakistan commonly uses Rescue 1122 and Police 15; verify that these services operate in your destination.</p>
              <EmergencySOS />
            </section>
          )}
        </div>
      </main>
    </PageWrapper>
  );
}
