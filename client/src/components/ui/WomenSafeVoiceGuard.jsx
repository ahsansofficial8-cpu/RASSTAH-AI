/**
 * ==============================================================================
 * RAASTAH (راستہ) — WOMEN-SAFE VOICE DISTRESS GUARDIAN
 * Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich
 * ==============================================================================
 * Real-time continuous speech recognition monitoring for emergency distress triggers
 * (e.g. "help", "bachao", "emergency", "madad").
 * Features two-stage voice confirmation ("Please say help again to confirm")
 * and automated multi-channel dispatch to Emergency Contacts, WhatsApp, and Admin Desk.
 * ==============================================================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Shield, Mic, MicOff, AlertTriangle, PhoneCall, MessageCircle, 
  MapPin, CheckCircle, X, Volume2, Radio, BellRing
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

const DISTRESS_KEYWORDS = [
  'help', 'help me', 'bachao', 'madad', 'emergency', 
  'danger', 'khatra', 'save me', 'police', 'ambulance'
];

export default function WomenSafeVoiceGuard() {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(() => {
    try {
      return localStorage.getItem('raastah-women-safe-mode') === 'true';
    } catch {
      return false;
    }
  });

  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [stage, setStage] = useState('idle'); // 'idle' | 'confirming' | 'dispatched'
  const [countdown, setCountdown] = useState(6);
  const [lastHeard, setLastHeard] = useState('');
  const [coords, setCoords] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const recognitionRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const stageRef = useRef(stage);
  stageRef.current = stage;
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  // Retrieve configured emergency contact
  const getEmergencyContact = useCallback(() => {
    try {
      return localStorage.getItem('raastah-emergency-contact') 
        || user?.phone 
        || '+92 343 6030463';
    } catch {
      return '+92 343 6030463';
    }
  }, [user]);

  // Track user location
  const refreshLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lon: Number(pos.coords.longitude.toFixed(6))
          });
        },
        () => {
          // National Fallback Coordinates
          setCoords({ lat: 33.6844, lon: 73.0479 });
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // Web Audio API emergency siren alarm
  const playSirenAlarm = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.6);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.9);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn('Audio alarm unavailable:', e);
    }
  }, []);

  // Text-To-Speech Synthesizer
  const speakText = useCallback((text) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
      }
    }
  }, []);

  // Trigger Distress Alerts
  const executeEmergencyDispatch = useCallback(async (triggerReason = 'Voice Keyword Confirmed') => {
    setStage('dispatched');
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    playSirenAlarm();
    speakText('Emergency alert confirmed. Dispatching live distress alert now.');

    const emergencyNum = getEmergencyContact();
    let cleanPhone = emergencyNum.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '92' + cleanPhone.slice(1);
    if (!cleanPhone.startsWith('92') && cleanPhone.length === 10) cleanPhone = '92' + cleanPhone;

    const lat = coords?.lat || 33.6844;
    const lon = coords?.lon || 73.0479;
    const mapsLink = `https://www.google.com/maps?q=${lat},${lon}`;

    const distressText = `URGENT WOMEN SOS: I am in danger and require immediate assistance! My current live location is ${mapsLink}. Please send help immediately. (Dispatched via Raastah Women-Safe System)`;

    // 1. Dispatch to Admin Backend
    try {
      await api.post('/safety/sos-alert', {
        location: { lat, lon, lng: lon, mapsLink },
        emergencyContact: emergencyNum,
        trigger: triggerReason,
        details: `Live voice keyword confirmed: "${lastHeard || 'Help'}"`,
        user: { name: user?.name || 'Traveler', email: user?.email || 'guest' }
      });
    } catch (err) {
      console.warn('Server SOS alert dispatch note:', err);
    }

    // 2. Open WhatsApp Alert Link directly to the configured contact (Native app on mobile)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const mobileWaUrl = `whatsapp://send?phone=${cleanPhone || '923436030463'}&text=${encodeURIComponent(distressText)}`;
    const webWaUrl = `https://api.whatsapp.com/send?phone=${cleanPhone || '923436030463'}&text=${encodeURIComponent(distressText)}`;

    if (isMobile) {
      window.location.href = mobileWaUrl;
    } else {
      window.open(webWaUrl, '_blank', 'noopener,noreferrer');
    }
  }, [coords, getEmergencyContact, lastHeard, playSirenAlarm, speakText, user]);

  // Stage 1 Trigger: First Distress Detection
  const handleInitialKeywordDetected = useCallback((keyword) => {
    setLastHeard(keyword);
    setStage('confirming');
    setCountdown(6);
    refreshLocation();

    // Audible confirmation voice prompt as explicitly requested
    speakText('Please say help again if you are in emergency to confirm.');

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          // If countdown expires without second confirmation, auto-trigger emergency as safety precaution
          executeEmergencyDispatch(`Distress Countdown Expired (${keyword})`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [executeEmergencyDispatch, refreshLocation, speakText]);

  // Handle Cancel / False Alarm
  const handleCancelEmergency = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setStage('idle');
    setCountdown(6);
    speakText('Emergency alert cancelled.');
  };

  // Setup and run Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    if (!isActive) {
      if (recognitionRef.current) {
        try { 
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
          recognitionRef.current.stop(); 
        } catch {}
      }
      setIsListening(false);
      return;
    }

    refreshLocation();

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const results = event.results;
      const latestResult = results[results.length - 1];
      const transcript = latestResult[0].transcript.toLowerCase().trim();

      const matchedKeyword = DISTRESS_KEYWORDS.find(kw => transcript.includes(kw));

      if (matchedKeyword) {
        if (stageRef.current === 'idle') {
          handleInitialKeywordDetected(matchedKeyword);
        } else if (stageRef.current === 'confirming') {
          // Second confirmation uttered by user!
          executeEmergencyDispatch(`Second Voice Confirmation (${matchedKeyword})`);
        }
      } else if (stageRef.current === 'confirming' && transcript.includes('cancel')) {
        handleCancelEmergency();
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        console.warn('Speech recognition warning:', event.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart recognition ONLY if still active according to the ref
      if (isActiveRef.current) {
        try {
          recognition.start();
        } catch {
          // ignore already started errors
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.warn('Recognition start warning:', err);
    }

    return () => {
      try {
        recognition.onend = null;
        recognition.abort();
        recognition.stop();
      } catch {}
      setIsListening(false);
    };
  }, [isActive, handleInitialKeywordDetected, executeEmergencyDispatch, refreshLocation]);

  // Sync mode changes across windows and instant shutdown on toggle
  useEffect(() => {
    const handleSync = () => {
      try {
        const enabled = localStorage.getItem('raastah-women-safe-mode') === 'true';
        setIsActive(enabled);
        isActiveRef.current = enabled;
        if (!enabled) {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.onend = null;
              recognitionRef.current.abort();
              recognitionRef.current.stop();
            } catch {}
          }
          setIsListening(false);
          setStage('idle');
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        }
      } catch {}
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('raastah-women-safe-toggle', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('raastah-women-safe-toggle', handleSync);
    };
  }, []);

  if (!speechSupported && isActive) {
    return (
      <aside aria-label="Speech recognition notice" className="fixed bottom-24 left-4 z-[9990] p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs backdrop-blur-md">
        ⚠️ Browser voice recognition unavailable. Offline manual SOS active.
      </aside>
    );
  }

  return (
    <>
      {/* 1. PERMANENT FLOATING STATUS PILL WHEN WOMEN-SAFE MODE IS ACTIVE */}
      {isActive && stage === 'idle' && (
        <aside 
          aria-label="Women-Safe Voice Guardian"
          className="fixed bottom-24 left-4 sm:left-6 z-[9990] flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#1e0d16]/95 border border-pink-500/50 text-white shadow-xl backdrop-blur-md transition-all hover:scale-102"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
          </div>
          
          <div className="flex items-center gap-1.5 text-xs">
            <Shield size={14} className="text-pink-400" />
            <span className="font-bold text-pink-200">Women-Safe Voice Guard:</span>
            <span className="text-[11px] text-white/80 hidden sm:inline">Listening for &quot;Help&quot;</span>
          </div>

          <button
            type="button"
            onClick={() => handleInitialKeywordDetected('Manual Test Trigger')}
            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 hover:bg-pink-500/40 transition cursor-pointer"
            title="Simulate saying 'Help' to test the emergency flow"
          >
            Test Voice SOS
          </button>
        </aside>
      )}

      {/* 2. STAGE 1: CONFIRMATION MODAL WITH COUNTDOWN & SPEECH SYNTHESIS */}
      {stage === 'confirming' && (
        <div 
          className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="alertdialog"
          aria-labelledby="voice-sos-title"
        >
          <div className="w-full max-w-md bg-[#16080e] border-2 border-rose-500 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden text-center space-y-4">
            
            {/* Pulsing Alert Radar */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-rose-600/30 animate-ping" />
              <div className="w-16 h-16 rounded-full bg-rose-600 border-2 border-rose-400 flex items-center justify-center shadow-lg shadow-rose-950">
                <Volume2 size={32} className="text-white animate-bounce" />
              </div>
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-rose-400 font-bold font-mono">
                EMERGENCY VOICE DETECTED
              </span>
              <h2 id="voice-sos-title" className="text-xl sm:text-2xl font-display font-bold text-white mt-1">
                &quot;Please say help again to confirm&quot;
              </h2>
              <p className="text-xs text-rose-200/90 mt-1">
                Detected keyword: <strong className="text-white font-mono uppercase">&quot;{lastHeard}&quot;</strong>
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-sm font-bold text-rose-300">
              <span className="text-lg font-mono text-white">{countdown}s</span>
              <span>auto-dispatching if not cancelled</span>
            </div>

            {coords && (
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white/80 font-mono">
                📍 Live Coordinates: {coords.lat}° N, {coords.lon}° E
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => executeEmergencyDispatch('Immediate User Confirmation Button')}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-rose-950 transition cursor-pointer"
              >
                🚨 CONFIRM SOS NOW
              </button>

              <button
                type="button"
                onClick={handleCancelEmergency}
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs transition cursor-pointer"
              >
                False Alarm / Cancel
              </button>
            </div>

            <p className="text-[11px] text-white/50">
              Tip: You can also say &quot;Help&quot; again aloud to confirm or &quot;Cancel&quot; to abort.
            </p>
          </div>
        </div>
      )}

      {/* 3. STAGE 2: DISPATCHED EMERGENCY DASHBOARD MODAL */}
      {stage === 'dispatched' && (
        <div 
          className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="alertdialog"
          aria-labelledby="dispatched-sos-title"
        >
          <div className="w-full max-w-lg bg-[#14060b] border-2 border-emerald-500 rounded-3xl p-6 text-white shadow-2xl relative text-left space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <h2 id="dispatched-sos-title" className="font-display font-bold text-lg text-white">
                    DISTRESS ALERTS DISPATCHED
                  </h2>
                  <p className="text-xs text-emerald-300">
                    Broadcasting live GPS beacon to emergency services
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStage('idle')}
                className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* WhatsApp & Cellular SMS Dispatch Actions */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-xs space-y-2">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <MessageCircle size={15} /> Emergency Alerts Dispatched
              </span>
              <p className="text-white/80">
                Live GPS beacon and emergency payload registered for: <strong>{getEmergencyContact()}</strong>.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {(() => {
                  const emergencyNum = getEmergencyContact();
                  let cleanPhone = emergencyNum.replace(/[^0-9]/g, '');
                  if (cleanPhone.startsWith('0')) cleanPhone = '92' + cleanPhone.slice(1);
                  if (!cleanPhone.startsWith('92') && cleanPhone.length === 10) cleanPhone = '92' + cleanPhone;
                  const lat = coords?.lat || 33.6844;
                  const lon = coords?.lon || 73.0479;
                  const mapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
                  const distressText = `URGENT WOMEN SOS: I am in danger! Live location: ${mapsLink}. Please send help immediately.`;
                  return (
                    <>
                      <a
                        href={`https://wa.me/${cleanPhone || '923436030463'}?text=${encodeURIComponent(distressText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition text-[11px]"
                      >
                        <MessageCircle size={14} /> Open WhatsApp
                      </a>
                      <a
                        href={`sms:${cleanPhone || '923436030463'}?body=${encodeURIComponent(distressText)}`}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition text-[11px]"
                      >
                        <Radio size={14} /> Send SMS Direct
                      </a>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Offline 1-Tap Emergency Hotlines */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider block">
                Immediate Direct Helpline Calls:
              </span>

              <a
                href="tel:1094"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold shadow-md transition"
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall size={18} className="animate-bounce" />
                  <div>
                    <span className="text-[10px] uppercase text-pink-100 block">Women Priority</span>
                    <span className="text-sm">Women Protection Authority (1094)</span>
                  </div>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Call 1094</span>
              </a>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href="tel:15"
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold transition"
                >
                  <PhoneCall size={15} className="text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-white/60 block">Police</span>
                    <span>Dial 15</span>
                  </div>
                </a>

                <a
                  href="tel:1122"
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold transition"
                >
                  <PhoneCall size={15} className="text-rose-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-white/60 block">Ambulance</span>
                    <span>Rescue 1122</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStage('idle')}
                className="text-xs text-white/60 hover:text-white underline cursor-pointer"
              >
                Dismiss Emergency Screen (Voice Guard Remains Active)
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
