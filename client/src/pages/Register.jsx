import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import { Card, Button, Input } from '@/components/ui';
import RaastahLogo from '@/components/ui/RaastahLogo';
import { useAuth } from '@/context/AuthContext';
import { Compass, Lock, Mail, User, Phone, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { detectUserLocation } from '@/services/liveWeatherLocationService';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [locationAutoDetected, setLocationAutoDetected] = useState(false);
  const [password, setPassword] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const runLocationDetection = async () => {
    setLocationDetecting(true);
    try {
      const loc = await detectUserLocation();
      if (loc?.name) {
        setCity(loc.name);
        setLocationAutoDetected(true);
      }
    } catch (err) {
      console.warn('GPS detect error:', err);
      setCity('Islamabad');
    } finally {
      setLocationDetecting(false);
    }
  };

  useEffect(() => {
    runLocationDetection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Store user's emergency contact for Women-Safe & live SOS distress routing
      if (emergencyContact.trim()) {
        try {
          localStorage.setItem('raastah-emergency-contact', emergencyContact.trim());
        } catch {
          // ignore
        }
      }
      await register(name, email, password, phone, city);
      navigate('/login?registered=true');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="w-full flex-grow min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-16">
        <Card className="max-w-md w-full p-8 shadow-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
          <div className="flex flex-col items-center text-center mb-6">
            <RaastahLogo size={52} showSlogan={false} className="justify-center mb-3" />
            <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] tracking-wide">CREATE ACCOUNT</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Join Raastah to track departures, save bespoke routes & receive road advisories
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ahsan Warraich"
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="WhatsApp Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
              />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Home City</label>
                  <button
                    type="button"
                    onClick={runLocationDetection}
                    disabled={locationDetecting}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <MapPin size={11} />
                    <span>{locationDetecting ? 'Detecting…' : '📍 Detect Location'}</span>
                  </button>
                </div>
                <Input
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setLocationAutoDetected(false);
                  }}
                  placeholder="e.g. Gujranwala, Lahore, Islamabad"
                />
                {locationDetecting && (
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1 animate-pulse">
                    <Sparkles size={11} className="text-amber-500" />
                    Detecting GPS location...
                  </span>
                )}
                {locationAutoDetected && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 size={11} />
                    Auto-detected via Live Geolocation & Nominatim
                  </span>
                )}
              </div>
            </div>
            <Input
              label="Emergency WhatsApp Contact (for Women-Safe & SOS Alerts)"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="e.g. +92 300 1122112 (Guardian / Next of Kin)"
              hint="Pre-configured destination for 1-tap WhatsApp emergency distress messages"
            />
            <Input
              label="Password (min 6 characters)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a secure password"
              required
            />
            
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register Account'}
            </Button>
          </form>

          <div className="text-center mt-6 text-xs text-[var(--text-muted)]">
            Already registered?{' '}
            <Link to="/login" className="text-[#E5983A] font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
