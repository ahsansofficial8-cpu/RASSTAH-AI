import { useMemo, useState } from 'react';
import { Check, Plus, Search, X } from 'lucide-react';
import { PAKISTAN_99_LOCATIONS } from '@/data/pakistan59Locations';

const BASE_ITEMS = [
  'Photo identification and travel documents',
  'Personal medication as directed by your clinician',
  'Personal first-aid supplies',
  'Reusable water bottle',
  'Offline map and saved accommodation details',
  'Phone charger and power bank',
  'Headlamp or flashlight with spare batteries',
  'Sun protection: sunscreen and sunglasses',
  'Lightweight quick-dry base layers',
  'Warm mid-layer for changing temperatures',
  'Windproof outer layer',
  'Waterproof shell or rain jacket',
  'Comfortable walking shoes with grip',
  'Spare socks',
  'Personal hygiene supplies',
  'Small day bag and reusable storage bags',
  'Cash and a payment method accepted at your destination'
];

const COLD_ITEMS = [
  'Insulated winter jacket',
  'Thermal base layers',
  'Waterproof insulated boots',
  'Warm gloves or mittens',
  'Insulating beanie',
  'Wool or thermal socks',
  'Lip balm and skin moisturizer',
  'Warm scarf or neck gaiter'
];

const WARM_ITEMS = [
  'Breathable cotton clothing',
  'Wide-brim sun hat',
  'Extra drinking water for the journey',
  'Electrolyte supplies suitable for you',
  'Lightweight breathable footwear'
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PackingChecklist() {
  const now = new Date();
  const [destinationId, setDestinationId] = useState('');
  const [month, setMonth] = useState(now.getMonth());
  const [checkedItems, setCheckedItems] = useState([]);
  const [customItems, setCustomItems] = useState([]);
  const [itemSearch, setItemSearch] = useState('');

  const destination = PAKISTAN_99_LOCATIONS.find((place) => place.id === destinationId);
  const elevationMeters = Number.parseInt(destination?.elevation?.replace(/[^0-9]/g, '') || '0', 10);
  const isColdSeason = [10, 11, 0, 1, 2].includes(month);
  const isHighAltitude = elevationMeters >= 2500;
  const isWarmSeason = [4, 5, 6, 7, 8].includes(month);

  const suggestedItems = useMemo(() => {
    const items = [...BASE_ITEMS];
    if (isColdSeason || isHighAltitude) items.push(...COLD_ITEMS);
    if (isWarmSeason && !isHighAltitude) items.push(...WARM_ITEMS);
    return [...new Set(items)];
  }, [isColdSeason, isHighAltitude, isWarmSeason]);

  const allItems = [...suggestedItems, ...customItems];
  const searchMatches = itemSearch.trim()
    ? suggestedItems.filter((item) => item.toLocaleLowerCase().includes(itemSearch.trim().toLocaleLowerCase()))
    : [];

  const addCustomItem = (value = itemSearch) => {
    const item = value.trim();
    if (!item || allItems.some((existing) => existing.toLocaleLowerCase() === item.toLocaleLowerCase())) return;
    setCustomItems((previous) => [...previous, item]);
    setItemSearch('');
  };

  const addSuggestedItem = (item) => {
    setCheckedItems((previous) => previous.includes(item) ? previous : [...previous, item]);
    setItemSearch('');
  };

  const toggleItem = (item) => {
    setCheckedItems((previous) => previous.includes(item)
      ? previous.filter((checked) => checked !== item)
      : [...previous, item]);
  };

  return (
    <section className="space-y-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6" aria-labelledby="packing-title">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">Trip preparation</p>
        <h2 id="packing-title" className="text-2xl font-display font-bold text-[var(--text-primary)]">Smart packing checklist</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Suggestions adapt to the selected destination's catalogue elevation and chosen month. This is a planning guide, not a live forecast; check current conditions before leaving.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          Destination
          <select value={destinationId} onChange={(event) => setDestinationId(event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] p-2.5 text-[var(--text-primary)]">
            <option value="">Choose from 99 destinations</option>
            {PAKISTAN_99_LOCATIONS.map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          Travel month
          <select value={month} onChange={(event) => setMonth(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] p-2.5 text-[var(--text-primary)]">
            {MONTHS.map((monthName, index) => <option key={monthName} value={index}>{monthName}</option>)}
          </select>
        </label>
      </div>

      <div className="rounded-xl border border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)] p-3 text-sm text-[var(--text-primary)]" role="status">
        {destination
          ? `${destination.name} · ${destination.elevation} catalogue elevation · ${MONTHS[month]} suggestions · ${allItems.length} checklist items`
          : `${MONTHS[month]} suggestions · choose a destination to tailor this checklist · ${allItems.length} checklist items`}
      </div>

      <form onSubmit={(event) => { event.preventDefault(); addCustomItem(); }} className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="search"
            value={itemSearch}
            onChange={(event) => setItemSearch(event.target.value)}
            placeholder="Search suggestions or type an item to add"
            aria-label="Search and add packing items"
            className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)]"
          />
          {searchMatches.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-1 shadow-lg">
              {searchMatches.slice(0, 6).map((item) => (
                <li key={item}>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => addSuggestedItem(item)} className="w-full rounded-md px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]">
                    Check suggestion: {item}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white">
          <Plus size={16} aria-hidden="true" /> Add item
        </button>
      </form>

      <ul className="grid gap-2 sm:grid-cols-2" aria-label="Packing checklist">
        {allItems.map((item) => {
          const checked = checkedItems.includes(item);
          return (
            <li key={item} className="flex items-center gap-2">
              <label className={`flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-[var(--brand-primary)] ${checked ? 'border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--text-secondary)]' : 'border-[var(--border-default)] bg-[var(--bg-page)] text-[var(--text-primary)]'}`}>
                <input type="checkbox" checked={checked} onChange={() => toggleItem(item)} className="sr-only" />
                <span aria-hidden="true" className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${checked ? 'border-[var(--success)] bg-[var(--success)] text-white' : 'border-[var(--border-strong)] bg-white'}`}>
                  {checked && <Check size={13} />}
                </span>
                <span className={`min-w-0 ${checked ? 'line-through' : ''}`}>{item}</span>
              </label>
              {customItems.includes(item) && (
                <button type="button" aria-label={`Remove ${item}`} onClick={() => { setCustomItems((previous) => previous.filter((value) => value !== item)); setCheckedItems((previous) => previous.filter((value) => value !== item)); }} className="rounded-md p-2 text-[var(--text-muted)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]">
                  <X size={15} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
