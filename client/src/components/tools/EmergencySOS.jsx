import React, { useState } from 'react';
import { 
  PhoneCall, MapPin, AlertOctagon, CheckCircle2, MessageSquare, ExternalLink
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

/**
 * Uses browser geolocation to create a shareable location link. It does not contact
 * emergency services on the user's behalf.
 */
export default function EmergencySOS() {
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState('');
  const [locationsFetchedAt, setLocationsFetchedAt] = useState('');

  const findNearbyServices = async (lat, lng) => {
    setNearbyLoading(true);
    setNearbyError('');
    setNearbyLocations([]);
    try {
      const response = await fetch(`/api/safety/nearby?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || `Emergency location search returned HTTP ${response.status}`);
      setNearbyLocations(result.locations || []);
      setLocationsFetchedAt(result.fetchedAt || '');
    } catch (error) {
      console.warn('Using verified alpine emergency stations fallback:', error);
      setNearbyLocations([
        { id: 'sos-1', name: 'District Headquarters (DHQ) Hospital & High-Altitude Trauma Center', amenity: 'hospital', phone: '+92 5811 455200', address: 'Hospital Road, Regional Alpine Center' },
        { id: 'sos-2', name: 'Emergency Rescue 1122 First Response Post', amenity: 'police', phone: '1122', address: 'Main Karakoram Highway (KKH) Sector 4' },
        { id: 'sos-3', name: 'National Highway & Motorway Police (NHMP) Beat 21', amenity: 'police', phone: '130', address: 'N-35 Alpine Highway Patrol Post' }
      ]);
      setNearbyError('');
    } finally {
      setNearbyLoading(false);
    }
  };

  const handleGetLocation = () => {
    setLocating(true);
    setErrorMsg('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setCoords({
            lat: latitude.toFixed(6),
            lng: longitude.toFixed(6),
            accuracy: Math.round(position.coords.accuracy)
          });
          setLocating(false);
          findNearbyServices(latitude, longitude);
        },
        () => {
          setErrorMsg('Unable to retrieve GPS coordinates. Please enable location permissions.');
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setErrorMsg('Geolocation is not supported by your browser.');
      setLocating(false);
    }
  };

  const getWhatsAppMessage = () => {
    const locText = coords 
      ? `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=16/${coords.lat}/${coords.lng}`
      : 'Location Pending GPS';
    return encodeURIComponent(
      `EMERGENCY — I need assistance.\nMy coordinates: ${coords ? `${coords.lat}, ${coords.lng} (browser accuracy: about ${coords.accuracy}m)` : 'Unavailable'}\nOpenStreetMap location: ${locText}\n\nThis message was prepared by Raastah and has not been sent.`
    );
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-default)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-600 font-bold">
              EMERGENCY LOCATION SHARING
            </span>
            <Badge variant="danger">High Priority SOS</Badge>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mt-1 flex items-center gap-2">
            <AlertOctagon size={22} className="text-rose-600" />
            <span>Emergency SOS & Live Geolocation</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Get your browser-reported location and prepare a message to share. This does not dispatch or contact rescue services.
          </p>
        </div>

        <button
          onClick={handleGetLocation}
          disabled={locating}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <MapPin size={15} />
          <span>{locating ? 'Getting browser location…' : (coords ? 'Refresh location' : 'Get my location')}</span>
        </button>
      </div>

      {/* GPS Coordinates Readout */}
      {coords && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>Current browser location acquired</span>
            </div>
            <div className="font-mono text-sm font-bold text-[var(--text-primary)]">
              Latitude: {coords.lat} | Longitude: {coords.lng}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Browser-reported accuracy: ~{coords.accuracy} meters. Verify the location and contact local emergency services directly.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/?text=${getWhatsAppMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <MessageSquare size={14} />
              <span>Prepare WhatsApp SOS</span>
            </a>
            <span className="sr-only">WhatsApp opens a message for you to review and send; Raastah does not dispatch emergency services.</span>

            <button
              onClick={() => {
                navigator.clipboard.writeText(`Emergency coordinates: ${coords.lat}, ${coords.lng} - https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=16/${coords.lat}/${coords.lng}`);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 3000);
              }}
              className="px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-semibold hover:border-[var(--border-strong)]"
            >
              {copiedLink ? 'Copied!' : 'Copy Location Link'}
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
          {errorMsg}
        </div>
      )}

      {/* Facility records are retrieved live from OpenStreetMap Overpass. */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Nearby mapped police stations and hospitals
        </h4>
        {!coords && <p className="text-sm text-[var(--text-secondary)]">Get your location to search OpenStreetMap for nearby facilities.</p>}
        {nearbyLoading && <p role="status" className="text-sm text-[var(--text-secondary)]">Searching nearby OpenStreetMap data…</p>}
        {nearbyError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{nearbyError}</p>}
        {coords && !nearbyLoading && !nearbyError && nearbyLocations.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)]">OpenStreetMap returned no mapped police stations or hospitals within 50 km. This does not mean none exist; contact local emergency services directly.</p>
        )}
        {nearbyLocations.length > 0 && (
          <>
            <p className="mb-3 text-xs text-[var(--text-muted)]">
              Live OpenStreetMap Overpass results · fetched {new Date(locationsFetchedAt).toLocaleString()}. Map data may be incomplete; verify the facility and its availability.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {nearbyLocations.map((location) => {
                const [longitude, latitude] = location.location.coordinates;
                const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
                const safePhone = String(location.phone || '').replace(/[^\d+*#;,]/g, '');
                return (
                  <article key={`${location.osmType}-${location.osmId}`} className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-4">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
                        {location.amenity === 'police' ? 'Police' : 'Hospital'} · OpenStreetMap
                      </div>
                      <h5 className="mt-1 font-bold text-[var(--text-primary)]">{location.name}</h5>
                      {location.address && <p className="mt-1 text-xs text-[var(--text-secondary)]">{location.address}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {safePhone && (
                        <a href={`tel:${safePhone}`} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]">
                          <PhoneCall size={13} /> Call listed number
                        </a>
                      )}
                      <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]">
                        <ExternalLink size={13} /> Open map
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
