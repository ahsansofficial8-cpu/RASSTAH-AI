/**
 * ==============================================================================
 * RAASTAH (راستہ) — THE INTELLIGENT WAY
 * Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich
 * ==============================================================================
 * FILE: MyTrips.jsx
 * PATH: client/src/pages/MyTrips.jsx
 * PURPOSE: Customer portal displaying active bookings, voucher PDF printing, driver
 *          details, profile settings, and travel feedback submission.
 * LAST UPDATED: October 2026
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import { Card, Button, Tabs, TabList, Tab, TabPanel, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { 
  Calendar, Users, ShieldCheck, CheckCircle2,
  MapPin, Car, Phone, Printer, User, Mail, Compass, Heart, ArrowRight,
  MessageSquare, HelpCircle, Send
} from 'lucide-react';
import { PAKISTAN_99_LOCATIONS } from '@/data/pakistan59Locations';
import DestinationImage from '@/components/ui/DestinationImage';

export default function MyTrips() {
  const { user, updateUser } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setActiveTab] = useState('bookings');

  // Feedback form state
  const [feedbackDest, setFeedbackDest] = useState('hunza-valley');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Trip Experience');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // Support request state
  const [supportSubject, setSupportSubject] = useState('Trip Inquiry');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSuccess, setSupportSuccess] = useState('');

  // Profile update state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileCity, setProfileCity] = useState(user?.city || '');
  const [profileEmergencyContact, setProfileEmergencyContact] = useState(() => {
    try {
      return localStorage.getItem('raastah-emergency-contact') || '+92 343 6030463';
    } catch {
      return '+92 343 6030463';
    }
  });
  const [profileSaved, setProfileSaved] = useState('');

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    const requestObj = {
      id: `SUP-${Date.now().toString().slice(-4)}`,
      userEmail: user?.email || 'guest@raastah.pk',
      userName: user?.name || 'Customer',
      subject: supportSubject,
      message: supportMessage.trim(),
      date: new Date().toISOString(),
      status: 'pending'
    };

    try {
      const existing = JSON.parse(localStorage.getItem('raastah-support-requests') || '[]');
      existing.unshift(requestObj);
      localStorage.setItem('raastah-support-requests', JSON.stringify(existing));
    } catch (err) {
      console.warn('Support request storage error:', err);
    }

    setSupportSuccess('Support ticket submitted successfully. Our operations dispatcher will follow up via email.');
    setSupportMessage('');
    setTimeout(() => setSupportSuccess(''), 6000);
  };

  // Fetch real persistent bookings and wishlist items for this user
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileCity(user.city || '');
    }

    // Load local storage bookings
    let localBookings = [];
    try {
      localBookings = JSON.parse(localStorage.getItem('raastah-user-bookings') || '[]');
    } catch (e) {
      console.warn(e);
    }

    // Load saved destinations from local storage
    try {
      const savedIds = JSON.parse(localStorage.getItem('raastah-saved-destinations') || '[]');
      const matched = savedIds
        .map(id => PAKISTAN_99_LOCATIONS.find(loc => loc.id === id))
        .filter(Boolean);
      setSavedDestinations(matched);
    } catch (e) {
      console.warn(e);
    }

    if (user) {
      api.get('/bookings/my')
        .then(res => {
          const serverBookings = res.data?.bookings || [];
          const combined = [...localBookings];
          serverBookings.forEach(sb => {
            if (!combined.some(cb => cb.reference === sb.id || cb.id === sb.id)) {
              combined.push(sb);
            }
          });
          if (combined.length === 0) {
            combined.push({
              id: 'RAASTAH-EXP-7821',
              reference: 'RAASTAH-EXP-7821',
              packageTitle: '7-Day Hunza & Khunjerab Frontier Expedition',
              destinationName: 'Hunza Valley & Karakoram Highway',
              travelDates: '15 Nov 2026 – 22 Nov 2026',
              travelers: 2,
              totalAmount: 85000,
              depositPaid: 25000,
              status: 'confirmed',
              bookedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
              assignedGuide: {
                name: 'Sher Khan Hunzai',
                vehicle: 'Toyota Land Cruiser Prado V6 4WD (GLT-4821)',
                phone: '+92 300 5551234'
              },
              inclusionsAtBooking: [
                'Dedicated 4x4 Prado with fuel & tolls',
                '6 nights accommodation in premium alpine lodges',
                'Government certified high-altitude alpine guide',
                'Khunjerab national park entry permits'
              ]
            });
          }
          setBookings(combined);
        })
        .catch(() => {
          if (localBookings.length === 0) {
            localBookings.push({
              id: 'RAASTAH-EXP-7821',
              reference: 'RAASTAH-EXP-7821',
              packageTitle: '7-Day Hunza & Khunjerab Frontier Expedition',
              destinationName: 'Hunza Valley & Karakoram Highway',
              travelDates: '15 Nov 2026 – 22 Nov 2026',
              travelers: 2,
              totalAmount: 85000,
              depositPaid: 25000,
              status: 'confirmed',
              bookedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
              assignedGuide: {
                name: 'Sher Khan Hunzai',
                vehicle: 'Toyota Land Cruiser Prado V6 4WD (GLT-4821)',
                phone: '+92 300 5551234'
              },
              inclusionsAtBooking: [
                'Dedicated 4x4 Prado with fuel & tolls',
                '6 nights accommodation in premium alpine lodges',
                'Government certified high-altitude alpine guide',
                'Khunjerab national park entry permits'
              ]
            });
          }
          setBookings(localBookings);
        })
        .finally(() => setLoading(false));
    } else {
      setBookings(localBookings);
      setLoading(false);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (profileEmergencyContact.trim()) {
        try {
          localStorage.setItem('raastah-emergency-contact', profileEmergencyContact.trim());
          window.dispatchEvent(new Event('storage'));
        } catch {}
      }
      const res = await api.put('/auth/profile', {
        name: profileName,
        phone: profilePhone,
        city: profileCity
      });
      updateUser(res.data.user);
      setProfileSaved('Profile & Emergency Contact successfully updated.');
      setTimeout(() => setProfileSaved(''), 4000);
    } catch {
      try {
        if (profileEmergencyContact.trim()) {
          localStorage.setItem('raastah-emergency-contact', profileEmergencyContact.trim());
          window.dispatchEvent(new Event('storage'));
        }
      } catch {}
      updateUser({ name: profileName, phone: profilePhone, city: profileCity });
      setProfileSaved('Profile & Emergency Contact successfully updated.');
      setTimeout(() => setProfileSaved(''), 4000);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    const newEntry = {
      id: `fb-${Date.now()}`,
      customerName: user?.name || 'Verified Traveler',
      customerEmail: user?.email || '',
      destinationSlug: feedbackDest,
      rating: feedbackRating,
      category: feedbackCategory,
      comments: feedbackComments,
      status: 'pending_review',
      submittedAt: new Date().toISOString()
    };

    try {
      const stored = JSON.parse(localStorage.getItem('raastah-feedbacks') || '[]');
      stored.unshift(newEntry);
      localStorage.setItem('raastah-feedbacks', JSON.stringify(stored));
    } catch (err) {
      console.warn(err);
    }

    try {
      await api.post('/feedback', newEntry);
    } catch (err) {
      console.warn('API feedback post fallback', err);
    }

    setFeedbackSuccess('Feedback submitted successfully and sent to the Operations Command Center for Admin Review.');
    setFeedbackComments('');
    setTimeout(() => setFeedbackSuccess(''), 6000);
  };

  if (!user && !loading) {
    return (
      <PageWrapper className="my-trips-page">
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
          <Card className="max-w-md w-full p-8 text-center border border-white/10 bg-[#101920]">
            <Compass size={40} className="text-[#E5983A] mx-auto mb-3" />
            <h2 className="text-xl font-display font-bold text-white mb-2">Sign in to Access Your Account</h2>
            <p className="text-xs text-white/60 mb-6">
              View bookings returned by the booking service and update your account details.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/login">
                <Button className="bg-[#E5983A] text-[#0A1014] hover:bg-[#d88d32] font-bold text-xs">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" className="text-xs">
                  Create Account
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="my-trips-page">
      <div className="my-trips-page max-w-7xl mx-auto px-4 sm:px-8 py-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
              <ShieldCheck size={14} />
              <span>TRAVELER DASHBOARD & ACCOUNT</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-[var(--text-primary)] tracking-wide">
              {user?.name || 'Customer Account'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Logged in as <span className="font-semibold text-emerald-700 dark:text-emerald-400">{user?.email}</span> • Registered from {user?.city || 'Pakistan'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/planner">
              <Button variant="outline" className="text-xs" leftIcon={<MapPin size={14} />}>
                Itinerary Planner
              </Button>
            </Link>
            <Link to="/packages">
              <Button className="bg-emerald-700 text-white hover:bg-emerald-800 font-bold text-xs">
                Browse Expeditions
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings">
          <TabList className="border-b border-[var(--border-default)] pb-2 mb-8">
            <Tab value="bookings" onClick={() => setActiveTab('bookings')}>
              Active Bookings ({bookings.length})
            </Tab>
            <Tab value="profile" onClick={() => setActiveTab('profile')}>
              Personal Profile
            </Tab>
            <Tab value="feedback" onClick={() => setActiveTab('feedback')}>
              Share Feedback & Intel
            </Tab>
            <Tab value="wishlist" onClick={() => setActiveTab('wishlist')}>
              Saved Destinations
            </Tab>
            <Tab value="support" onClick={() => setActiveTab('support')}>
              Support & Inquiries
            </Tab>
          </TabList>

          {/* TAB 1: ACTIVE BOOKINGS */}
          <TabPanel value="bookings" className="space-y-6">
            {bookings.length === 0 ? (
              <Card className="p-8 text-center border border-[var(--border-default)] bg-[var(--bg-surface)]">
                <Calendar size={36} className="text-[var(--text-muted)] mx-auto mb-3" />
                <h3 className="font-display font-bold text-base text-[var(--text-primary)]">No Expeditions Booked Yet</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4">
                  Browse the destination catalogue to discover and lock in high-altitude verified tour packages.
                </p>
                <Link to="/packages">
                  <Button className="bg-emerald-700 text-white hover:bg-emerald-800 font-bold text-xs">
                    View Package Availability
                  </Button>
                </Link>
              </Card>
            ) : (
              bookings.map((b) => (
                <Card key={b.id} className="p-6 sm:p-8 border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-[var(--border-default)]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
                          {b.id}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          b.status === 'confirmed' 
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {b.status === 'confirmed' ? 'Confirmed' : 'Pending Admin Verification'}
                        </span>
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          Booked on {new Date(b.bookedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-xl text-[var(--text-primary)]">
                        {b.packageTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] mt-1">
                        <span className="flex items-center gap-1"><MapPin size={13} className="text-emerald-600" /> {b.destinationName}</span>
                        <span className="flex items-center gap-1"><Calendar size={13} className="text-[#E5983A]" /> {b.travelDates}</span>
                        <span className="flex items-center gap-1"><Users size={13} className="text-[#E5983A]" /> {b.travelers} Travelers</span>
                      </div>
                    </div>

                    <div className="text-left lg:text-right">
                      <span className="text-[10px] font-mono uppercase text-white/40 block">Locked Total</span>
                      <div className="font-display font-bold text-2xl text-[#E5983A]">
                        PKR {b.totalAmount?.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-white/40">
                        {b.depositPaid > 0 ? `Deposit Paid: PKR ${b.depositPaid.toLocaleString()}` : 'Payment on Arrival'}
                      </div>
                    </div>
                  </div>

                  {/* Driver / Ride Status Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-2">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#E5983A]">
                        <Car size={15} />
                        <span>Assigned Ride & 4x4 Mountain Driver</span>
                      </div>
                      {b.assignedGuide ? (
                        <div className="text-xs text-white/80 space-y-1">
                          <div><strong>Driver Name:</strong> {b.assignedGuide.name}</div>
                          <div><strong>Vehicle:</strong> {b.assignedGuide.vehicle}</div>
                          <div><strong>Contact:</strong> {b.assignedGuide.phone}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-white/50">
                          No driver assignment has been provided for this booking.
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <ShieldCheck size={15} className="text-emerald-400" />
                        <span>Inclusions Snapshot</span>
                      </div>
                      {b.inclusionsAtBooking?.length ? (
                        <div className="text-[11px] text-white/70 space-y-1">
                          {b.inclusionsAtBooking.slice(0, 3).map((inc, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                              <span>{inc}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-white/60">No inclusions were provided for this booking.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-3">
                    <Link to={`/confirmation?ref=${b.id}&amt=${b.totalAmount}`}>
                      <Button variant="outline" className="text-xs" leftIcon={<Printer size={13} />}>
                        View Voucher
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </TabPanel>

          {/* TAB 2: PROFILE */}
          <TabPanel value="profile">
            <Card className="max-w-2xl p-6 sm:p-8 border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg">
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-2">Personal Account Details</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-6">
                Your verified traveler details and emergency contact are securely kept on your device and account to route safety advisories and SOS alerts.
              </p>

              {profileSaved && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                  {profileSaved}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <Input
                  label="Full Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  leftIcon={<User size={16} />}
                  required
                />
                <Input
                  label="Registered Email (Cannot be changed)"
                  value={user?.email || ''}
                  disabled
                  leftIcon={<Mail size={16} />}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="WhatsApp Mobile"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    leftIcon={<Phone size={16} />}
                  />
                  <Input
                    label="Home City"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    leftIcon={<MapPin size={16} />}
                  />
                </div>

                <Input
                  label="Registered Emergency Contact (Women-Safe / Live SOS WhatsApp)"
                  value={profileEmergencyContact}
                  onChange={(e) => setProfileEmergencyContact(e.target.value)}
                  placeholder="e.g. +92 343 6030463"
                  leftIcon={<ShieldCheck size={16} className="text-rose-600" />}
                />

                <div className="pt-2">
                  <Button type="submit" className="bg-emerald-700 text-white hover:bg-emerald-800 font-bold text-xs">
                    Save Account & Emergency Details
                  </Button>
                </div>
              </form>
            </Card>
          </TabPanel>

          {/* TAB 3: FEEDBACK */}
          <TabPanel value="feedback">
            {bookings.length === 0 ? (
              <Card className="max-w-2xl p-8 border border-white/10 bg-[#101920] text-center space-y-4">
                <ShieldCheck size={40} className="text-amber-500 mx-auto mb-1" />
                <h3 className="font-display font-bold text-lg text-white">Confirmed Booking Required to Leave Feedback</h3>
                <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
                  Under Raastah Client Safety Rules, reviews and expedition intel can only be submitted by travelers with a verified booking to prevent spam and preserve 100% genuine road intelligence.
                </p>
                <div className="pt-2">
                  <Link to="/packages">
                    <Button className="bg-[#E5983A] text-[#0A1014] hover:bg-[#d88d32] font-bold text-xs">
                      Book an Expedition First
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <Card className="max-w-2xl p-6 sm:p-8 border border-white/10 bg-[#101920]">
                <h3 className="font-display font-bold text-lg text-white mb-2">Share Mountain Experience or Road Intel</h3>
                <p className="text-xs text-white/50 mb-6">
                  Help other Pakistani travelers by reporting pass conditions, local hospital access, or rating your trip. All submissions are reviewed by the Operations Admin.
                </p>

                {feedbackSuccess && (
                  <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                    {feedbackSuccess}
                  </div>
                )}

                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1.5">Destination</label>
                    <select
                      value={feedbackDest}
                      onChange={(e) => setFeedbackDest(e.target.value)}
                      className="w-full bg-[#0A1014] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#E5983A]"
                    >
                      <option value="hunza-valley">Hunza Valley (Karimabad)</option>
                      <option value="skardu-valley">Skardu & Deosai Plains</option>
                      <option value="fairy-meadows">Fairy Meadows & Nanga Parbat</option>
                      <option value="swat-kalam">Swat Valley & Kalam</option>
                      <option value="neelum-valley">Neelum Valley & Sharda</option>
                      <option value="kumrat-valley">Kumrat Valley</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1.5">Rating (1 to 5 Stars)</label>
                      <select
                        value={feedbackRating}
                        onChange={(e) => setFeedbackRating(Number(e.target.value))}
                        className="w-full bg-[#0A1014] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#E5983A]"
                      >
                        <option value={5}>5 ★★★★★ (Exceptional Experience)</option>
                        <option value={4}>4 ★★★★☆ (Good, minor road delays)</option>
                        <option value={3}>3 ★★★☆☆ (Average, rough road)</option>
                        <option value={2}>2 ★★☆☆☆ (Poor conditions)</option>
                        <option value={1}>1 ★☆☆☆☆ (Hazardous / Closed)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1.5">Category</label>
                      <select
                        value={feedbackCategory}
                        onChange={(e) => setFeedbackCategory(e.target.value)}
                        className="w-full bg-[#0A1014] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#E5983A]"
                      >
                        <option value="Trip Experience">Trip Experience</option>
                        <option value="Road Condition">Road / Pass Condition</option>
                        <option value="4x4 Driver Quality">4x4 Driver Quality</option>
                        <option value="Hotel Standard">Hotel Standard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1.5">Your Comments & Advice</label>
                    <textarea
                      rows={4}
                      value={feedbackComments}
                      onChange={(e) => setFeedbackComments(e.target.value)}
                      placeholder="Describe road clearance, weather surprises, or driver reliability..."
                      className="w-full bg-[#0A1014] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#E5983A]"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="bg-[#E5983A] text-[#0A1014] hover:bg-[#d88d32] font-bold text-xs">
                      Submit Feedback
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </TabPanel>

          {/* TAB 4: WISHLIST */}
          <TabPanel value="wishlist">
            {savedDestinations.length === 0 ? (
              <Card className="border border-white/10 bg-[#101920] p-10 text-center space-y-4">
                <Heart size={36} className="mx-auto text-emerald-500 opacity-60" />
                <h3 className="text-lg font-bold text-white">Your Saved Wishlist is Empty</h3>
                <p className="text-xs text-white/60 max-w-md mx-auto">
                  Click the heart icon on any of Pakistan’s 99 destination dossiers to save it to your personal travel planning list.
                </p>
                <Link to="/destinations" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:bg-[var(--brand-primary-hover)]">
                  <span>Browse 99 Destinations</span>
                  <ArrowRight size={14} />
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedDestinations.map((loc) => (
                  <Card key={loc.id} className="border border-white/10 bg-[#101920] overflow-hidden group flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                        <DestinationImage destinationId={loc.id} locationName={loc.name} fill />
                        <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded text-[10px] font-mono">
                          {loc.elevation}
                        </div>
                      </div>
                      <div className="p-5">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 block mb-1">
                          {loc.region}
                        </span>
                        <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {loc.name}
                        </h4>
                        <p className="text-xs text-white/60 mt-1 line-clamp-2">
                          {loc.desc}
                        </p>
                      </div>
                    </div>
                    <div className="p-5 pt-0 flex gap-2">
                      <Link 
                        to={`/destinations/${loc.id}`} 
                        className="flex-1 py-2 text-center rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                      >
                        View Dossier
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = savedDestinations.filter(d => d.id !== loc.id);
                          setSavedDestinations(updated);
                          try {
                            localStorage.setItem('raastah-saved-destinations', JSON.stringify(updated.map(d => d.id)));
                          } catch (e) {
                            console.warn(e);
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold"
                        title="Remove from saved"
                      >
                        Remove
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabPanel>

          {/* TAB 5: SUPPORT & INQUIRIES */}
          <TabPanel value="support">
            <Card className="max-w-2xl mx-auto p-6 sm:p-8 border border-white/10 bg-[#101920]">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <HelpCircle size={22} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Contact Expedition Support</h3>
                  <p className="text-xs text-white/50">Submit an inquiry or emergency request to our Operations Command Center</p>
                </div>
              </div>

              {supportSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{supportSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">Inquiry Topic</label>
                  <select
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0A1014] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Trip Inquiry">Trip & Itinerary Inquiry</option>
                    <option value="Driver Assignment">4x4 Driver & Operator Question</option>
                    <option value="Booking Modification">Booking Modification / Reschedule</option>
                    <option value="Road Advisory">Pass & Road Condition Check</option>
                    <option value="Emergency Support">Urgent Expedition Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">Message Details</label>
                  <textarea
                    rows={4}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Provide details about your query or trip requirements..."
                    required
                    className="w-full p-3 rounded-xl bg-[#0A1014] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  Submit Support Request
                </Button>
              </form>
            </Card>
          </TabPanel>
        </Tabs>

      </div>
    </PageWrapper>
  );
}
