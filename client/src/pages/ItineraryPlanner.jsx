import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import { Card, Button, Badge, Input } from '@/components/ui';
import RouteSelector from '@/components/tools/RouteSelector';
import { Plus, Trash2, MapPin, Save, Share2 } from 'lucide-react';
import { PAKISTAN_99_LOCATIONS } from '@/data/pakistan59Locations';

function loadSavedTrip() {
  try {
    const saved = JSON.parse(localStorage.getItem('raastah-itinerary') || 'null');
    if (saved && typeof saved.title === 'string' && Array.isArray(saved.days)) return saved;
  } catch (error) {
    console.warn('Unable to read saved itinerary', error);
  }
  return { title: '', days: [] };
}

function getInitialTrip(destinationId) {
  const saved = loadSavedTrip();
  const destination = PAKISTAN_99_LOCATIONS.find((location) => location.id === destinationId);
  if (!destination) return { trip: saved, isSuggested: false };

  return {
    trip: {
      title: `${destination.name} trip`,
      days: [{
        id: `suggested-${destination.id}`,
        dayNumber: 1,
        name: `Suggested stops in ${destination.name}`,
        places: destination.activities
      }]
    },
    isSuggested: true
  };
}

export default function ItineraryPlanner() {
  const [searchParams] = useSearchParams();
  const [initial] = useState(() => getInitialTrip(searchParams.get('destination')));
  const [saved] = useState(initial.trip);
  const [tripTitle, setTripTitle] = useState(saved.title);
  const [days, setDays] = useState(saved.days);
  const [isSuggestedDraft] = useState(initial.isSuggested);
  const [newPlaceByDay, setNewPlaceByDay] = useState({});
  const [message, setMessage] = useState('');

  const addDay = () => {
    setDays((previous) => [
      ...previous,
      { id: `${Date.now()}-${previous.length}`, dayNumber: previous.length + 1, name: `Day ${previous.length + 1}`, places: [] }
    ]);
  };

  const updateDay = (dayId, updates) => {
    setDays((previous) => previous.map((day) => day.id === dayId ? { ...day, ...updates } : day));
  };

  const addPlaceToDay = (dayId) => {
    const place = (newPlaceByDay[dayId] || '').trim();
    if (!place) return;
    setDays((previous) => previous.map((day) => (
      day.id === dayId ? { ...day, places: [...day.places, place] } : day
    )));
    setNewPlaceByDay((previous) => ({ ...previous, [dayId]: '' }));
  };

  const saveTrip = () => {
    try {
      localStorage.setItem('raastah-itinerary', JSON.stringify({ title: tripTitle, days }));
      setMessage('Itinerary saved on this device.');
    } catch (error) {
      console.error('Unable to save itinerary', error);
      setMessage('Unable to save itinerary on this device.');
    }
  };

  const shareTrip = () => {
    const summary = days.map((day) => `${day.name}: ${day.places.join(', ') || 'No places added'}`).join('\n');
    const text = `${tripTitle || 'My Pakistan trip'}\n${summary || 'No days added yet.'}\nPlanning notes are user-entered and not travel or road-condition verification.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageWrapper>
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Badge variant="accent" className="mb-2">Manual itinerary planner</Badge>
            <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] sm:text-4xl">Plan your trip</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Add your own stops. Route estimates use OSRM and approximate catalogue coordinates; no road status or live traffic is implied.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" leftIcon={<Share2 size={16} />} onClick={shareTrip}>Share itinerary</Button>
            <Button variant="primary" leftIcon={<Save size={16} />} onClick={saveTrip}>Save trip</Button>
          </div>
        </header>

        <Input label="Trip title" value={tripTitle} onChange={(event) => setTripTitle(event.target.value)} placeholder="Name your trip" />
        {isSuggestedDraft && (
          <p className="mb-0 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="status">
            Suggested stops are drawn from the destination catalogue, not a verified day-by-day itinerary. Confirm order, access, opening hours, and road conditions locally.
          </p>
        )}
        {message && <p className="mb-0 text-sm text-[var(--text-secondary)]" role="status">{message}</p>}
        <RouteSelector />

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="space-y-4" aria-label="Itinerary days">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">Your days</h2>
              <Button size="sm" variant="secondary" onClick={addDay} leftIcon={<Plus size={14} />}>Add day</Button>
            </div>
            {!days.length && (
              <Card className="p-6 text-sm text-[var(--text-secondary)]">
                No itinerary days yet. Add a day and enter stops that you have confirmed for your trip.
              </Card>
            )}
            {days.map((day, dayIndex) => (
              <Card key={day.id} className="space-y-4 p-5">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-1 shrink-0 text-[var(--brand-primary)]" />
                  <label className="flex-1 text-xs font-semibold text-[var(--text-secondary)]">
                    Day {dayIndex + 1} title
                    <input value={day.name} onChange={(event) => updateDay(day.id, { name: event.target.value })} maxLength={120} className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--text-primary)]" />
                  </label>
                  <button type="button" onClick={() => setDays((previous) => previous.filter((item) => item.id !== day.id))} aria-label={`Remove ${day.name}`} className="rounded-md p-2 text-[var(--text-secondary)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]">
                    <Trash2 size={16} />
                  </button>
                </div>
                <ul className="space-y-2">
                  {day.places.map((place, index) => (
                    <li key={`${day.id}-${index}`} className="flex items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)]">
                      {place}
                      <button type="button" onClick={() => updateDay(day.id, { places: day.places.filter((_, itemIndex) => itemIndex !== index) })} aria-label={`Remove ${place}`} className="text-[var(--text-secondary)] hover:text-[var(--danger)]">
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={(event) => { event.preventDefault(); addPlaceToDay(day.id); }} className="flex gap-2">
                  <input value={newPlaceByDay[day.id] || ''} onChange={(event) => setNewPlaceByDay((previous) => ({ ...previous, [day.id]: event.target.value }))} placeholder="Add a stop or activity" maxLength={120} className="min-w-0 flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
                  <Button size="sm" variant="secondary" type="submit">Add stop</Button>
                </form>
              </Card>
            ))}
          </section>
          <aside className="space-y-4">
            <Card className="space-y-3 p-5">
              <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">Planning notes</h2>
              <p className="mb-0 text-sm text-[var(--text-secondary)]">Confirm closures, permits, transport, lodging, and opening hours with current local sources before departure.</p>
              <p className="mb-0 text-xs text-[var(--text-muted)]">OSRM estimates are not live traffic forecasts. The planner does not assess road safety or medical suitability.</p>
            </Card>
          </aside>
        </div>
      </main>
    </PageWrapper>
  );
}
