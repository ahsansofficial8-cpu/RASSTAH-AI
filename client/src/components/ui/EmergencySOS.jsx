/**
 * ==============================================================================
 * RAASTAH (راستہ) — EMERGENCY SOS & LOCATION RADAR
 * Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich
 * ==============================================================================
 * FILE: EmergencySOS.jsx
 * PATH: client/src/components/ui/EmergencySOS.jsx
 * PURPOSE: Women's safety and high-altitude emergency distress system.
 *          Gathers live device GPS, builds a pre-filled WhatsApp distress alert,
 *          and provides 1-tap offline cellular emergency hotlines (Rescue 1122, Police 15, etc.).
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, PhoneCall, MessageCircle, MapPin, 
  ShieldAlert, X, Copy, Check, ExternalLink, Settings, Radio, Shield, HeartHandshake
} from 'lucide-react';
import { Button, Card } from '@/components/ui';

export default function EmergencySOS({ 
  variant = 'prominent', // 'prominent' | 'compact' | 'pill'
  className = ''
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Women-Safe Mode sync from localStorage or event
  const [womenSafeMode, setWomenSafeMode] = useState(() => {
    try {
      return localStorage.getItem('raastah-women-safe-mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setWomenSafeMode(localStorage.getItem('raastah-women-safe-mode') === 'true');
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Configured emergency contact (from localStorage or default rescue number)
  const [emergencyPhone, setEmergencyPhone] = useState(() => {
    try {
      return localStorage.getItem('raastah-emergency-contact') || '+92 300 1122112';
    } catch {
      return '+92 300 1122112';
    }
  });
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [tempPhone, setTempPhone] = useState(emergencyPhone);

  const fetchLiveCoordinates = () => {
    setLocating(true);
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('GPS geolocation is not supported on this device. Using regional emergency fallback.');
      setCoords({ lat: 35.8825, lon: 74.4633 }); // Gilgit-Baltistan hub fallback
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lon: Number(pos.coords.longitude.toFixed(6))
        });
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocationError('Unable to lock GPS satellites. Using regional emergency base coordinates.');
        setCoords({ lat: 35.8825, lon: 74.4633 });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  const handleOpenModal = () => {
    try {
      setWomenSafeMode(localStorage.getItem('raastah-women-safe-mode') === 'true');
    } catch {
      // ignore
    }
    setModalOpen(true);
    fetchLiveCoordinates();
  };

  const cleanPhoneForWhatsApp = (phoneStr) => {
    let clean = (phoneStr || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '92' + clean.slice(1);
    }
    if (!clean.startsWith('92') && clean.length === 10) {
      clean = '92' + clean;
    }
    return clean || '923001122112';
  };

  const mapsUrl = coords 
    ? `https://www.google.com/maps?q=${coords.lat},${coords.lon}`
    : 'https://www.google.com/maps?q=35.8825,74.4633';

  // Strict required prompt formatting: "URGENT SOS: I am in danger. My current location is [Google Maps Link]. Please send help immediately."
  const distressMessage = womenSafeMode
    ? `URGENT WOMEN SOS: I am in danger and require immediate assistance. My current live GPS location is: ${mapsUrl}. Please dispatch emergency rescue help immediately.`
    : `URGENT SOS: I am in danger. My current location is: ${mapsUrl}. Please send help immediately.`;

  const whatsappUrl = `https://wa.me/${cleanPhoneForWhatsApp(emergencyPhone)}?text=${encodeURIComponent(distressMessage)}`;

  const handleTriggerWhatsAppSOS = (e) => {
    e.preventDefault();
    const confirmed = window.confirm(
      "Are you sure you want to trigger an emergency alert? This will share your live GPS location with your configured contact."
    );
    if (confirmed) {
      try {
        fetch('/api/safety/sos-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: coords 
              ? { lat: coords.lat, lon: coords.lon, lng: coords.lon, mapsUrl } 
              : { lat: 33.6844, lon: 73.0479, lng: 73.0479, mapsUrl },
            emergencyContact: emergencyPhone,
            trigger: womenSafeMode ? 'Women-Safe Manual SOS' : 'Manual Traveler SOS',
            details: 'Emergency SOS WhatsApp dispatch initiated'
          })
        }).catch(() => {});
      } catch {}

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const cleanPhone = cleanPhoneForWhatsApp(emergencyPhone);
      const mobileWaUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(distressMessage)}`;
      const webWaUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(distressMessage)}`;

      if (isMobile) {
        window.location.href = mobileWaUrl;
      } else {
        window.open(webWaUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const toggleWomenSafeMode = () => {
    const next = !womenSafeMode;
    setWomenSafeMode(next);
    try {
      localStorage.setItem('raastah-women-safe-mode', String(next));
      window.dispatchEvent(new Event('raastah-women-safe-toggle'));
    } catch {}
  };

  const handleDialHotline = (number, e) => {
    e.preventDefault();
    const confirmed = window.confirm(
      `Are you sure you want to call emergency hotline ${number}?`
    );
    if (confirmed) {
      window.location.href = `tel:${number}`;
    }
  };

  const handleSaveEmergencyContact = (e) => {
    e.preventDefault();
    setEmergencyPhone(tempPhone);
    try {
      localStorage.setItem('raastah-emergency-contact', tempPhone);
    } catch (err) {
      console.warn(err);
    }
    setIsEditingContact(false);
  };

  const copyMapsLink = () => {
    navigator.clipboard.writeText(mapsUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <>
      {/* TRIGGER BUTTONS */}
      {variant === 'prominent' && (
        <button
          type="button"
          onClick={handleOpenModal}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-600/90 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs shadow-md shadow-rose-950/40 transition-all border border-rose-400 backdrop-blur-md cursor-pointer ${className}`}
          aria-label="Trigger Emergency SOS Alert"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <AlertOctagon size={14} className="text-white" />
          <span>SOS EMERGENCY</span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          type="button"
          onClick={handleOpenModal}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all border border-rose-500 cursor-pointer ${className}`}
          aria-label="Emergency SOS"
        >
          <AlertOctagon size={14} />
          <span>SOS Help</span>
        </button>
      )}

      {variant === 'pill' && (
        <button
          type="button"
          onClick={handleOpenModal}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition-colors cursor-pointer ${className}`}
        >
          <AlertOctagon size={13} />
          <span>SOS Alert</span>
        </button>
      )}

      {/* EMERGENCY MODAL (SLIDE-UP / CENTERED POP-UP, RESPONSIVE, MAX-W-500PX, HIGH Z-INDEX) */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-sos-title"
        >
          <div className="w-full sm:max-w-[500px] max-h-[92vh] sm:max-h-[85vh] overflow-y-auto bg-[#120a0d] border border-rose-500/40 text-white shadow-2xl rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 relative flex flex-col">
            
            {/* Top Red Glow Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 animate-pulse"></div>

            {/* Header with Exit Close Button */}
            <div className="flex items-start justify-between pb-3 border-b border-rose-500/20 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h3 id="emergency-sos-title" className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
                    EMERGENCY DISTRESS SOS
                  </h3>
                  <p className="text-[11px] text-rose-300">
                    High-Altitude Rescue Radar & Distress Beacon
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close Emergency SOS Dialog"
                className="text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Women-Safe Mode Banner & Toggle */}
            <div className={`mb-4 p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              womenSafeMode 
                ? 'bg-pink-950/60 border-pink-500/50' 
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${womenSafeMode ? 'bg-pink-500/20 text-pink-400' : 'bg-white/10 text-white/60'}`}>
                  <Shield size={18} />
                </div>
                <div>
                  <span className={`font-bold block ${womenSafeMode ? 'text-pink-300' : 'text-white'}`}>
                    {womenSafeMode ? 'Women-Safe Emergency & Voice Guard Active' : 'Women-Safe Mode (Voice Guard)'}
                  </span>
                  <span className="text-[11px] text-white/70 block">
                    {womenSafeMode 
                      ? 'Continuous voice monitoring for distress ("Help") & 1094 priority'
                      : 'Listen for distress keywords and prioritize Women Helpline (1094)'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleWomenSafeMode}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  womenSafeMode 
                    ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-xs' 
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                {womenSafeMode ? 'Turn Off' : 'Turn On'}
              </button>
            </div>

            {/* GPS Status Box */}
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <MapPin size={13} className="text-rose-400" />
                  Live GPS Coordinates:
                </span>
                <button
                  type="button"
                  onClick={fetchLiveCoordinates}
                  disabled={locating}
                  className="text-[11px] font-mono text-rose-400 hover:text-white underline cursor-pointer"
                >
                  {locating ? 'Locking GPS...' : 'Refresh GPS'}
                </button>
              </div>

              {coords ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 font-mono text-xs">
                  <span className="text-white bg-black/50 px-2 py-1 rounded-lg border border-white/10">
                    {coords.lat}° N, {coords.lon}° E
                  </span>
                  <button
                    type="button"
                    onClick={copyMapsLink}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-white cursor-pointer"
                  >
                    {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Maps Link'}</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-rose-400 animate-pulse">
                  Acquiring satellite lock from browser GPS...
                </div>
              )}

              {locationError && (
                <p className="text-[11px] text-amber-300 font-sans mt-1">
                  ⚠️ {locationError}
                </p>
              )}
            </div>

            {/* Configured Emergency Contact */}
            <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/60">Configured Emergency Contact:</span>
                <button
                  type="button"
                  onClick={() => setIsEditingContact(!isEditingContact)}
                  className="text-[11px] text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
                >
                  {isEditingContact ? 'Cancel' : 'Change'}
                </button>
              </div>

              {isEditingContact ? (
                <form onSubmit={handleSaveEmergencyContact} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="flex-1 bg-black/60 border border-rose-500/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-400"
                  />
                  <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-3 py-1 h-auto">
                    Save
                  </Button>
                </form>
              ) : (
                <div className="font-mono text-xs font-bold text-white flex items-center justify-between">
                  <span>{emergencyPhone}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-sans">
                    Guardian / Next-of-Kin
                  </span>
                </div>
              )}
            </div>

            {/* ACTION 1: WHATSAPP & CELLULAR SMS DISTRESS DISPATCH */}
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleTriggerWhatsAppSOS}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all border border-emerald-400 cursor-pointer"
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp SOS Alert</span>
                </button>

                <a
                  href={`sms:${cleanPhoneForWhatsApp(emergencyPhone)}?body=${encodeURIComponent(distressMessage)}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-sky-600 hover:bg-sky-500 active:scale-98 text-white font-bold text-xs shadow-lg shadow-sky-950/40 transition-all border border-sky-400 cursor-pointer text-center"
                >
                  <Radio size={15} />
                  <span>Cellular SMS SOS</span>
                </a>
              </div>

              <p className="text-[11px] text-white/50 text-center">
                Pre-fills your exact Google Maps coordinates & distress message directly to your contact.
              </p>
            </div>

            {/* ACTION 2: OFFLINE DIRECT CELLULAR HOTLINES WITH CONFIRMATION */}
            <div className="pt-3 border-t border-rose-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                  Offline Direct Cellular Calls (Free):
                </span>
                <Radio size={13} className="text-rose-400 animate-pulse" />
              </div>

              {/* If WomenSafeMode is active, place Women Helpline 1094 at the top with prominent styling */}
              {womenSafeMode && (
                <button
                  type="button"
                  onClick={(e) => handleDialHotline('1094', e)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold shadow-md transition-all border border-pink-400 cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <PhoneCall size={16} className="text-white animate-bounce" />
                    <div>
                      <span className="block text-[10px] text-pink-100 uppercase tracking-wider">Priority Helpline</span>
                      <span className="text-xs sm:text-sm">Women Protection Hotline (1094)</span>
                    </div>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Dial 1094</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={(e) => handleDialHotline('1122', e)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-white font-bold transition-colors cursor-pointer text-left"
                >
                  <PhoneCall size={14} className="text-rose-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-rose-300 font-sans">Ambulance</span>
                    <span>Rescue 1122</span>
                  </div>
                </button>

                {!womenSafeMode && (
                  <button
                    type="button"
                    onClick={(e) => handleDialHotline('1094', e)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-white font-bold transition-colors cursor-pointer text-left"
                  >
                    <PhoneCall size={14} className="text-pink-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] text-pink-300 font-sans">Women Safety</span>
                      <span>Women 1094</span>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => handleDialHotline('15', e)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-colors cursor-pointer text-left"
                >
                  <PhoneCall size={14} className="text-amber-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-white/50 font-sans">Emergency</span>
                    <span>Police 15</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDialHotline('1422', e)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-colors cursor-pointer text-left"
                >
                  <PhoneCall size={14} className="text-emerald-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-white/50 font-sans">Northern Highway</span>
                    <span>Tourist 1422</span>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
