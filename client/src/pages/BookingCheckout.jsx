/**
 * ==============================================================================
 * RAASTAH (راستہ) — EXPEDITION CHECKOUT & RESERVATION
 * High-fidelity booking checkout simulator for Hackathon demo.
 * Supports Pakistani payment flows (JazzCash, EasyPaisa, Raast Bank Wire, Card Test).
 * ==============================================================================
 */

import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, CreditCard, Smartphone, Building, CheckCircle2, 
  ArrowLeft, Calendar, Users, Lock, Tag, AlertCircle
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { useAuth } from '@/context/AuthContext';
import { getPackageById, TOUR_PACKAGES } from '@/data/packagesData';
import { Button, Card, Input } from '@/components/ui';

export default function BookingCheckout() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packageId = searchParams.get('package') || 'hunza-khunjerab-expedition';
  const pkg = getPackageById(packageId) || TOUR_PACKAGES[0];

  const [travelersCount, setTravelersCount] = useState(2);
  const [departureDate, setDepartureDate] = useState('2026-11-05');
  const [paymentMethod, setPaymentMethod] = useState('easypaisa');
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    fullName: 'Ahsan Warraich',
    email: 'ahsan@example.com',
    phone: '+92 300 1234567',
    cnic: '35202-1234567-1',
    emergencyContact: '+92 321 7654321',
    specialNotes: 'Require vegetarian meals and high-clearance 4x4 seat.'
  });

  const baseTotal = pkg.pricePKR * travelersCount;
  const discountAmount = discountApplied ? Math.round(baseTotal * 0.10) : 0;
  const tax = Math.round((baseTotal - discountAmount) * 0.05); // 5% tourism fee
  const finalTotal = baseTotal - discountAmount + tax;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'HACKATHON2026' || couponCode.trim().toUpperCase() === 'RAASTAH') {
      setDiscountApplied(true);
    } else {
      alert('Try promo code: HACKATHON2026 for 10% discount!');
    }
  };

  const handleCompleteBooking = (e) => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setSubmitting(true);

    // Generate verified booking reference
    const bookingRef = `RAASTAH-EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const bookingRecord = {
      reference: bookingRef,
      destination: pkg.title,
      packageId: pkg.id,
      customerName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      cnic: formData.cnic,
      departureDate,
      travelersCount,
      totalAmount: finalTotal,
      currency: 'PKR',
      paymentMethod,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    // Save to user bookings storage
    try {
      const existing = JSON.parse(localStorage.getItem('raastah-user-bookings') || '[]');
      existing.unshift(bookingRecord);
      localStorage.setItem('raastah-user-bookings', JSON.stringify(existing));
    } catch (err) {
      console.warn('Local storage error', err);
    }

    setTimeout(() => {
      setSubmitting(false);
      navigate(`/confirmation?ref=${bookingRef}`);
    }, 900);
  };

  return (
    <PageWrapper>
      <main className="min-h-screen bg-[var(--bg-page)] px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          
          <button 
            type="button"
            onClick={() => navigate(`/packages/${pkg.id}`)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[var(--brand-primary)] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Expedition Details</span>
          </button>

          <header className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Expedition Reservation</span>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">
              Confirm Your Mountain Journey
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Complete passenger documentation and choose a flexible payment method.
            </p>
          </header>

          {!user && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-amber-600 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Client Authentication Required</h4>
                  <p className="text-xs text-slate-600">Please sign in to confirm your booking and view driver dispatch details.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
              >
                Sign In to Reserve
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Left 7 Cols */}
            <form onSubmit={handleCompleteBooking} className="lg:col-span-7 space-y-6">
              
              {/* Passenger Info */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  Lead Traveler Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CNIC / Passport No</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.cnic}
                      onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                      placeholder="e.g. 35202-XXXXXXX-X"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Phone</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Number</label>
                  <input 
                    type="tel" 
                    required 
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Expedition Details */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                  <Calendar size={20} className="text-emerald-600" />
                  Expedition Logistics
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Departure Date</label>
                    <input 
                      type="date" 
                      required 
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Travelers</label>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button" 
                        onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                        className="w-10 h-10 rounded-xl bg-slate-100 font-bold hover:bg-slate-200"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-slate-900">{travelersCount} Guests</span>
                      <button 
                        type="button" 
                        onClick={() => setTravelersCount(Math.min(10, travelersCount + 1))}
                        className="w-10 h-10 rounded-xl bg-slate-100 font-bold hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                  <Lock size={18} className="text-emerald-600" />
                  Payment Options (Demo Mode Available)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'easypaisa', name: 'EasyPaisa Mobile', icon: Smartphone, desc: 'Instant mobile wallet pin' },
                    { id: 'jazzcash', name: 'JazzCash Wallet', icon: Smartphone, desc: 'Instant mobile wallet pin' },
                    { id: 'raast', name: 'Raast / Bank Transfer', icon: Building, desc: 'HBL, Meezan, Alfalah wire' },
                    { id: 'card', name: 'Credit/Debit Card (Test)', icon: CreditCard, desc: 'Simulated 3DS approval' }
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <label 
                        key={method.id}
                        className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1 text-emerald-600 focus:ring-emerald-600"
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">{method.name}</span>
                          <span className="text-[11px] text-slate-500">{method.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-amber-600" />
                  <span><strong>Hackathon Test Mode:</strong> No real money will be charged. Instant verifiable voucher generated upon confirmation.</span>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-sm font-bold bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] rounded-xl shadow-xl transition-all hover:scale-102"
              >
                {submitting 
                  ? 'Generating Verifiable Voucher…' 
                  : !user 
                    ? '🔒 Sign In to Confirm Reservation' 
                    : `Confirm Reservation · PKR ${finalTotal.toLocaleString()}`}
              </Button>
            </form>

            {/* Right 5 Cols: Price Breakdown & Voucher Preview */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-3">
                  Reservation Summary
                </span>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{pkg.title}</h3>
                  <p className="text-xs text-slate-500">{pkg.durationDays} Days / {pkg.durationNights} Nights · {pkg.region}</p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span>Base Expedition Rate:</span>
                    <span className="font-mono text-slate-900 font-semibold">PKR {pkg.pricePKR.toLocaleString()} × {travelersCount}</span>
                  </div>

                  {discountApplied && (
                    <div className="flex items-center justify-between text-emerald-700 font-semibold">
                      <span>Promo Discount (10%):</span>
                      <span>- PKR {discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>Tourism & Eco Park Levy (5%):</span>
                    <span className="font-mono text-slate-900 font-semibold">PKR {tax.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                    <span>Final Amount:</span>
                    <span className="text-xl text-[var(--brand-primary)]">PKR {finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Promo Code (HACKATHON2026)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-grow rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 uppercase focus:outline-none"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleApplyCoupon}
                      className="text-xs font-bold shrink-0"
                    >
                      Apply
                    </Button>
                  </div>
                  {discountApplied && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      ✓ 10% Hackathon discount applied successfully!
                    </p>
                  )}
                </div>
              </div>

              {/* Guarantees */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Raastah Traveler Guarantee</span>
                </div>
                <p>• Verified 4x4 mountain vehicles with licensed local driver.</p>
                <p>• 100% full refund if high mountain pass closed by NDMA.</p>
                <p>• Immediate PDF itinerary download with QR verification.</p>
              </div>

            </div>

          </div>

        </div>
      </main>
    </PageWrapper>
  );
}
