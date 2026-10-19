/**
 * ==============================================================================
 * RAASTAH (راستہ) — EXPEDITION DETAIL DOSSIER
 * Interactive tour detail page with complete day-by-day timeline,
 * gear requirements, inclusions/exclusions, and booking integration.
 * ==============================================================================
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Clock, Users, Star, ShieldCheck, CheckCircle2, 
  XCircle, MapPin, Calendar, Compass, PhoneCall, ChevronDown
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { getPackageById, TOUR_PACKAGES } from '@/data/packagesData';
import DestinationImage from '@/components/ui/DestinationImage';
import { Button, Card, Badge } from '@/components/ui';

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pkg = getPackageById(id) || TOUR_PACKAGES[0];
  const [activeTab, setActiveTab] = useState('itinerary');

  return (
    <PageWrapper>
      <main className="min-h-screen bg-[var(--bg-page)] px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          
          {/* Back button */}
          <button 
            type="button"
            onClick={() => navigate('/packages')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[var(--brand-primary)] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to All Expeditions</span>
          </button>

          {/* Hero Banner */}
          <div className="relative aspect-[21/9] min-h-[340px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900">
            <DestinationImage
              destinationId={pkg.destinationId}
              locationName={pkg.title}
              fill
              priority
              className="opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 text-white space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white backdrop-blur-md">
                  {pkg.region}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md">
                  {pkg.difficulty}
                </span>
                <div className="flex items-center gap-1 text-amber-400 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                  <Star size={14} className="fill-amber-400" />
                  <span>{pkg.rating} ({pkg.reviewsCount} reviews)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight">
                {pkg.title}
              </h1>

              <p className="text-xs sm:text-sm text-white/90 max-w-3xl leading-relaxed">
                {pkg.tagline}
              </p>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8 Cols: Dossier & Itinerary */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Quick Specs Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="p-2">
                  <span className="text-[11px] text-slate-500 font-medium block">Duration</span>
                  <span className="text-sm font-bold text-slate-900">{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
                </div>
                <div className="p-2 border-l border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Group Size</span>
                  <span className="text-sm font-bold text-slate-900">{pkg.groupSize}</span>
                </div>
                <div className="p-2 border-l border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Departure</span>
                  <span className="text-sm font-bold text-slate-900">{pkg.departureLocation}</span>
                </div>
                <div className="p-2 border-l border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Operator</span>
                  <span className="text-sm font-bold text-emerald-700 truncate block">{pkg.operator.name}</span>
                </div>
              </div>

              {/* Expedition Highlights */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-display font-bold text-slate-900">Expedition Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pkg.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day-by-Day Itinerary */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-display font-bold text-slate-900">Day-by-Day Itinerary</h2>
                  <span className="text-xs text-slate-500">{pkg.itinerary.length} Expedition Stages</span>
                </div>

                <div className="relative border-l-2 border-emerald-200 pl-6 ml-3 space-y-8">
                  {pkg.itinerary.map((day) => (
                    <div key={day.day} className="relative group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                        {day.day}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                          Day {day.day}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {day.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                          {day.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                <h2 className="text-xl font-display font-bold text-slate-900">What’s Included & Excluded</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      Inclusions
                    </span>
                    <ul className="space-y-2">
                      {pkg.inclusions.map((inc, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle size={15} className="text-rose-600" />
                      Exclusions
                    </span>
                    <ul className="space-y-2">
                      {pkg.exclusions.map((exc, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>

            </div>

            {/* Right 4 Cols: Booking Card & Operator Badge */}
            <div className="lg:col-span-4 space-y-6 sticky top-24">
              
              {/* Sticky Booking Box */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-xs text-slate-500 font-medium block">Starting Price Per Person</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-display font-bold text-slate-900">
                      PKR {pkg.pricePKR.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">/ approx. ${pkg.priceUSD} USD</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Guaranteed Departure:</span>
                    <span className="font-semibold text-slate-900">Weekly (May – Oct)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Deposit Required:</span>
                    <span className="font-semibold text-slate-900">20% to lock reservation</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cancellation:</span>
                    <span className="font-semibold text-emerald-700">Free up to 7 days prior</span>
                  </div>
                </div>

                <Button 
                  variant="primary"
                  onClick={() => navigate(`/checkout?package=${pkg.id}`)}
                  className="w-full py-4 text-sm font-bold bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] rounded-xl shadow-lg hover:scale-102 transition-all"
                >
                  Proceed to Reservation
                </Button>

                <p className="text-[11px] text-center text-slate-400">
                  Instant reservation confirmation with verifiable reference code.
                </p>
              </div>

              {/* Operator Credentials Card */}
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-slate-800 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <ShieldCheck size={18} />
                  <span>Verified Alpine Operator</span>
                </div>
                <h4 className="font-bold text-base text-slate-900">{pkg.operator.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pkg.operator.badge}. 10+ years operating commercial 4x4 safaris across Gilgit-Baltistan with zero safety compromises.
                </p>
                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Helpline:</span>
                  <span className="font-mono font-bold text-emerald-900">{pkg.operator.contact}</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
    </PageWrapper>
  );
}
