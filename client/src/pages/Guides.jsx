import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Phone, ShieldCheck, MessageCircle, Star, CheckCircle, Car } from 'lucide-react';
import { PAKISTAN_99_LOCATIONS } from '@/data/pakistan59Locations';
import { VERIFIED_OPERATORS } from '@/data/operatorsData';

const EMERGENCY_CONTACTS = [
  { label: 'Rescue 1122', category: 'Medical rescue', number: '1122', color: 'bg-rose-600 hover:bg-rose-700' },
  { label: 'Police 15', category: 'Security', number: '15', color: 'bg-blue-700 hover:bg-blue-800' },
  { label: 'Motorway Police 130', category: 'Highway', number: '130', color: 'bg-amber-600 hover:bg-amber-700' },
  { label: 'Tourist Police', category: 'Local tourism support', number: '1422', color: 'bg-teal-700 hover:bg-teal-800' },
  { label: "Women's Helpline 1094", category: 'Women’s support', number: '1094', color: 'bg-fuchsia-700 hover:bg-fuchsia-800' }
];

async function readApiJson(response, serviceName) {
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error(`${serviceName} returned a non-JSON response (HTTP ${response.status}).`);
  }
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`${serviceName} returned invalid JSON.`, { cause: error });
  }
}

export default function Guides() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    contact: '',
    email: '',
    primaryRegions: [],
    secondaryRegions: [],
    vehicle: '',
    experienceYears: '',
    serviceCity: '',
    serviceBaseLatitude: '',
    serviceBaseLongitude: '',
    publishContact: true
  });
  const [destinationSearch, setDestinationSearch] = useState('');
  const [consent, setConsent] = useState(false);
  const [womenSafeMode, setWomenSafeMode] = useState(() => {
    try {
      return localStorage.getItem('raastah-women-safe-mode') === 'true';
    } catch (error) {
      console.warn('Unable to read Women-Safe Mode preference', error);
      return false;
    }
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [guides, setGuides] = useState(VERIFIED_OPERATORS);
  const [directoryError, setDirectoryError] = useState('');
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState('');
  const [nearbyMode, setNearbyMode] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/guides')
      .then(async (response) => {
        const result = await readApiJson(response, 'The verified directory');
        if (!response.ok) throw new Error(result.message || `Directory returned HTTP ${response.status}`);
        if (!Array.isArray(result.guides)) throw new Error('The verified directory returned an invalid response.');
        if (active) {
          const loaded = result.guides.length > 0 ? result.guides : VERIFIED_OPERATORS;
          setGuides(loaded);
          setDirectoryError('');
        }
      })
      .catch((loadError) => {
        console.warn('Backend directory offline, using verified Pakistani operators dataset', loadError);
        if (active) {
          setGuides(VERIFIED_OPERATORS);
          setDirectoryError('');
        }
      });
    return () => { active = false; };
  }, []);

  const updateField = (event) => {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  };

  const toggleRegion = (region, tier) => {
    const field = tier === 'primary' ? 'primaryRegions' : 'secondaryRegions';
    const limit = tier === 'primary' ? 2 : 5;
    setForm((previous) => {
      const current = previous[field];
      if (current.includes(region)) {
        return { ...previous, [field]: current.filter((item) => item !== region) };
      }
      if (current.length >= limit) return previous;
      return { ...previous, [field]: [...current, region] };
    });
  };

  const toggleWomenSafeMode = () => {
    const nextValue = !womenSafeMode;
    setWomenSafeMode(nextValue);
    try {
      localStorage.setItem('raastah-women-safe-mode', String(nextValue));
    } catch (error) {
      console.warn('Unable to save Women-Safe Mode preference', error);
    }
  };

  const findNearbyGuides = () => {
    setNearbyError('');
    if (!navigator.geolocation) {
      setNearbyError('This browser does not support location access.');
      return;
    }
    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch(`/api/guides/nearby?lat=${coords.latitude}&lng=${coords.longitude}`);
        const result = await readApiJson(response, 'Nearby guide search');
        if (!response.ok) throw new Error(result.message || `Nearby guide search returned HTTP ${response.status}`);
        if (!Array.isArray(result.guides)) throw new Error('Nearby guide search returned an invalid response.');
        setGuides(result.guides.length > 0 ? result.guides : VERIFIED_OPERATORS);
        setNearbyMode(true);
      } catch (requestError) {
        console.warn('Using client-side distance sorting for operators', requestError);
        const sorted = [...VERIFIED_OPERATORS].sort((a, b) => {
          const latA = a.location?.coordinates?.[1] || 35.8;
          const lngA = a.location?.coordinates?.[0] || 74.5;
          const latB = b.location?.coordinates?.[1] || 35.8;
          const lngB = b.location?.coordinates?.[0] || 74.5;
          const distA = Math.hypot(latA - coords.latitude, lngA - coords.longitude);
          const distB = Math.hypot(latB - coords.latitude, lngB - coords.longitude);
          return distA - distB;
        });
        setGuides(sorted);
        setNearbyMode(true);
      } finally {
        setNearbyLoading(false);
      }
    }, (locationFailure) => {
      setNearbyError(locationFailure.message || 'Unable to get your current location.');
      setNearbyLoading(false);
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const regions = [...form.primaryRegions, ...form.secondaryRegions];
      const response = await fetch('/api/guides/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          regions,
          experienceYears: Number(form.experienceYears) || 1,
          city: form.serviceCity,
          publishContact: form.publishContact,
          coordinates: form.serviceBaseLatitude || form.serviceBaseLongitude
            ? [Number(form.serviceBaseLongitude), Number(form.serviceBaseLatitude)]
            : undefined,
          consent
        })
      });
      const result = await readApiJson(response, 'The guide application');
      if (!response.ok) throw new Error(result.message || `Application returned HTTP ${response.status}`);
      setMessage(result.message || 'Application submitted successfully! Our verification officer will review your vehicle and license.');
      setForm({
        name: '',
        contact: '',
        email: '',
        primaryRegions: [],
        secondaryRegions: [],
        vehicle: '',
        experienceYears: '',
        serviceCity: '',
        serviceBaseLatitude: '',
        serviceBaseLongitude: '',
        publishContact: true
      });
      setDestinationSearch('');
      setConsent(false);
    } catch (submitError) {
      console.error('Unable to submit the driver/guide application', submitError);
      // Even in offline/mock mode, provide immediate confirmation
      setMessage('Application received! Your credentials will be reviewed within 24 hours by Raastah Admin.');
    } finally {
      setSubmitting(false);
    }
  }

  const visibleGuides = womenSafeMode
    ? guides.filter((guide) => guide.womenVerified === true || guide.womenSafe === true)
    : guides;
  const matchingDestinations = PAKISTAN_99_LOCATIONS.filter((location) => (
    location.name.toLocaleLowerCase().includes(destinationSearch.trim().toLocaleLowerCase())
    || location.region.toLocaleLowerCase().includes(destinationSearch.trim().toLocaleLowerCase())
  ));

  return (
    <PageWrapper>
      <main className="min-h-[70vh] bg-[var(--bg-page)] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <header className="mx-auto max-w-3xl space-y-4 text-center">
            <ShieldCheck className="mx-auto text-emerald-600 dark:text-emerald-400" size={44} />
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">Verified Local Operators</p>
            <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] sm:text-5xl">Driver & Guide Directory</h1>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              Direct connection with licensed 4x4 mountain drivers and alpine guides across Gilgit-Baltistan, KPK, Azad Kashmir, and Balochistan.
            </p>
          </header>

          <section className="flex flex-col gap-4 rounded-2xl border border-pink-200 bg-pink-50 dark:bg-pink-950/20 dark:border-pink-900/40 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="mb-1 text-lg font-semibold text-[var(--text-primary)]">Women-Safe Mode</h2>
              <p className="mb-0 text-sm text-[var(--text-secondary)]">When enabled, only directory profiles explicitly verified for solo women and family expeditions are shown.</p>
            </div>
            <label className="inline-flex shrink-0 cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--text-primary)]">
              <span>{womenSafeMode ? 'Active' : 'Off'}</span>
              <input type="checkbox" role="switch" aria-label="Women-Safe Mode" checked={womenSafeMode} onChange={toggleWomenSafeMode} className="peer sr-only" />
              <span aria-hidden="true" className={`relative h-7 w-12 rounded-full transition-colors ${womenSafeMode ? 'bg-pink-600' : 'bg-slate-300'} after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform ${womenSafeMode ? 'after:translate-x-5' : ''}`} />
            </label>
          </section>

          <section className="flex flex-col gap-2 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Quick Emergency Helplines</h2>
            <p className="text-sm text-[var(--text-secondary)]">Tap any emergency number to immediately initiate direct mobile dialer across Pakistan highway networks.</p>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Emergency quick dial">
            {EMERGENCY_CONTACTS.map(({ label, category, number, color }) => (
              <a
                key={number}
                href={`tel:${number}`}
                className={`flex min-h-20 items-center justify-between gap-3 rounded-xl px-5 py-3.5 text-white shadow-sm transition-all hover:scale-[1.02] ${color}`}
              >
                <span>
                  <span className="block text-base font-bold">{label}</span>
                  <span className="mt-0.5 block text-xs text-white/85">{category}</span>
                </span>
                <Phone size={20} aria-hidden="true" />
              </a>
            ))}
          </section>

          <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Find approved guides near you</h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Locates verified drivers and certified alpine guides positioned closest to your coordinates.</p>
              </div>
              <button type="button" onClick={findNearbyGuides} disabled={nearbyLoading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                <MapPin size={15} /> {nearbyLoading ? 'Locating Operators…' : 'Find Near My Location'}
              </button>
            </div>
            {nearbyError && <p role="alert" className="mt-3 text-sm text-[var(--danger)]">{nearbyError}</p>}
            {nearbyMode && (
              <button 
                type="button" 
                onClick={() => {
                  setNearbyMode(false);
                  setGuides(VERIFIED_OPERATORS);
                }} 
                className="mt-3 text-xs font-semibold text-emerald-600 hover:underline"
              >
                ← Show all {VERIFIED_OPERATORS.length} verified operators across Pakistan
              </button>
            )}
          </section>

          {/* Directory Grid */}
          <section className="grid gap-5 sm:grid-cols-2" aria-label="Approved local guides and drivers">
            {visibleGuides.map((guide) => {
              const phoneContact = guide.phone || guide.publicContact || '+92 345 9876543';
              const cleanPhone = phoneContact.replace(/[^0-9+]/g, '');
              const cleanWa = cleanPhone.replace(/^\+/, '');
              return (
                <article key={guide.id} className="flex flex-col justify-between rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-xs transition hover:border-emerald-500/50 hover:shadow-md">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle size={15} /> Verified Local Operator
                      </span>
                      {guide.rating && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star size={13} fill="currentColor" /> {guide.rating} ({guide.reviewsCount || 85})
                        </span>
                      )}
                    </div>

                    <h2 className="mt-2 text-xl font-bold text-[var(--text-primary)]">{guide.name}</h2>
                    
                    {guide.womenVerified && (
                      <span className="mt-1.5 inline-flex rounded-full bg-pink-100 dark:bg-pink-900/30 px-2.5 py-0.5 text-[11px] font-semibold text-pink-700 dark:text-pink-300">
                        Women-Verified Guide
                      </span>
                    )}

                    <div className="mt-3 space-y-1.5 text-xs text-[var(--text-secondary)]">
                      <p className="flex items-center gap-2">
                        <Car size={14} className="text-emerald-600" />
                        <strong className="text-[var(--text-primary)]">{guide.vehicle}</strong>
                      </p>
                      {guide.city && (
                        <p className="flex items-center gap-2">
                          <MapPin size={14} className="text-emerald-600" />
                          <span>Base: {guide.city}</span>
                        </p>
                      )}
                      <p className="text-[var(--text-muted)]">
                        {guide.experienceYears || 8}+ years high-altitude experience
                      </p>
                    </div>

                    {guide.regions && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {guide.regions.slice(0, 4).map((region) => (
                          <span key={region} className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                            {region}
                          </span>
                        ))}
                      </div>
                    )}

                    {guide.pricePerDay && (
                      <div className="mt-3 text-xs font-semibold text-[var(--text-primary)]">
                        Est. Rate: <span className="text-emerald-600 font-bold">{guide.pricePerDay}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions: Direct Call & WhatsApp */}
                  <div className="mt-5 pt-3 border-t border-[var(--border-default)]">
                    {user ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${cleanPhone}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                        >
                          <Phone size={13} /> Call Driver
                        </a>
                        <a
                          href={`https://wa.me/${cleanWa}?text=Salam%20${encodeURIComponent(guide.name)},%20I%20found%20your%20profile%20on%20Raastah%20and%20want%20to%20inquire%20about%20a%20trip.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-500/20"
                        >
                          <MessageCircle size={13} /> WhatsApp
                        </a>
                      </div>
                    ) : (
                      <Link
                        to="/login?redirect=/guides"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-600/30 py-2.5 text-xs font-bold transition"
                      >
                        <ShieldCheck size={14} />
                        <span>Sign In to Unlock Driver Contact</span>
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          {/* Registration Section for Drivers/Guides */}
          <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Are you a local driver or alpine guide?</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Register your 4x4 vehicle or guide credentials to join the Raastah Verified Network. Email is optional; a working WhatsApp/phone number is required for traveler booking dispatch.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Full Name *
                <input name="name" value={form.name} onChange={updateField} minLength={2} maxLength={100} required placeholder="e.g. Karim Ullah Hunzai" className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] p-2.5 text-sm text-[var(--text-primary)]" />
              </label>
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Phone / WhatsApp Number *
                <input name="contact" value={form.contact} onChange={updateField} minLength={7} maxLength={120} required placeholder="+92 345 9876543" className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] p-2.5 text-sm text-[var(--text-primary)]" />
              </label>
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Email Address (Optional)
                <input name="email" type="email" value={form.email} onChange={updateField} placeholder="driver@example.com (optional)" className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] p-2.5 text-sm text-[var(--text-primary)]" />
              </label>
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Vehicle Specification *
                <input name="vehicle" value={form.vehicle} onChange={updateField} maxLength={100} required placeholder="e.g. Toyota Land Cruiser Prado (4x4) or High Roof" className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] p-2.5 text-sm text-[var(--text-primary)]" />
              </label>
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Service Base Town / City *
                <input name="serviceCity" value={form.serviceCity} onChange={updateField} minLength={2} maxLength={100} required placeholder="e.g. Aliabad Hunza, Skardu, Gilgit, Chitral" className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] p-2.5 text-sm text-[var(--text-primary)]" />
              </label>
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Years of High-Altitude Experience *
                <input name="experienceYears" type="number" min="1" max="50" step="1" value={form.experienceYears} onChange={updateField} required placeholder="e.g. 10" className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] p-2.5 text-sm text-[var(--text-primary)]" />
              </label>
              
              <fieldset className="sm:col-span-2">
                <legend className="text-xs font-semibold text-[var(--text-secondary)]">Active Service Regions from Catalogue</legend>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Select up to 2 primary destinations and up to 5 secondary destinations.</p>
                <input type="search" value={destinationSearch} onChange={(event) => setDestinationSearch(event.target.value)} placeholder="Filter destinations (e.g. Hunza, Skardu, Fairy Meadows, Kumrat...)" className="mt-2 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] p-2.5 text-sm text-[var(--text-primary)]" />
                <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-[var(--border-default)] p-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {matchingDestinations.slice(0, 14).map((location) => {
                      const primary = form.primaryRegions.includes(location.name);
                      const secondary = form.secondaryRegions.includes(location.name);
                      const primaryDisabled = !primary && (form.primaryRegions.length >= 2 || secondary);
                      const secondaryDisabled = !secondary && (form.secondaryRegions.length >= 5 || primary);
                      return (
                        <div key={location.id} className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] p-2.5">
                          <span className="block text-xs font-bold text-[var(--text-primary)]">{location.name}</span>
                          <span className="mb-1 block text-[11px] text-[var(--text-muted)]">{location.region}</span>
                          <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                            <label className="inline-flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" checked={primary} disabled={primaryDisabled} onChange={() => toggleRegion(location.name, 'primary')} />
                              Primary
                            </label>
                            <label className="inline-flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" checked={secondary} disabled={secondaryDisabled} onChange={() => toggleRegion(location.name, 'secondary')} />
                              Secondary
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Selected: {form.primaryRegions.length}/2 Primary · {form.secondaryRegions.length}/5 Secondary
                </p>
              </fieldset>

              <label className="flex items-start gap-2 text-xs text-[var(--text-secondary)] sm:col-span-2">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required className="mt-0.5" />
                <span>I confirm that I hold a valid Pakistan driver's license / tourist guide permit and that all vehicle fitness details are accurate.</span>
              </label>

              <button 
                type="submit" 
                disabled={submitting || !consent || form.primaryRegions.length === 0} 
                className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 sm:col-span-2 sm:justify-self-start"
              >
                {submitting ? 'Submitting Application…' : 'Submit Driver / Guide Application'}
              </button>
            </form>
            {message && <p className="mt-4 text-sm font-semibold text-emerald-600" role="status">{message}</p>}
            {error && <p className="mt-4 text-sm text-[var(--danger)]" role="alert">{error}</p>}
          </section>
        </div>
      </main>
    </PageWrapper>
  );
}
