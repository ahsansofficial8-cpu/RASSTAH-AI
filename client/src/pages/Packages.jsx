/**
 * ==============================================================================
 * RAASTAH (راستہ) — EXPEDITIONS & TOUR PACKAGES
 * Curated, high-fidelity Pakistani tour packages with verified operator badges,
 * day-by-day itineraries, transparent inclusions, and instant booking checkout.
 * ==============================================================================
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Compass, ShieldCheck, Star, Clock, Users, ArrowRight, 
  CheckCircle2, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { TOUR_PACKAGES } from '@/data/packagesData';
import { Button, Card, Badge } from '@/components/ui';
import DestinationImage from '@/components/ui/DestinationImage';

export default function Packages() {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  const regions = ['All', 'Gilgit-Baltistan', 'Khyber Pakhtunkhwa'];
  const difficulties = ['All', 'Easy - Family Friendly', 'Moderate', 'Adventurous', 'Challenging / Technical'];

  const filteredPackages = TOUR_PACKAGES.filter((pkg) => {
    const matchRegion = selectedRegion === 'All' || pkg.region === selectedRegion;
    const matchDiff = difficultyFilter === 'All' || pkg.difficulty === difficultyFilter;
    return matchRegion && matchDiff;
  });

  return (
    <PageWrapper>
      <main className="min-h-screen bg-[var(--bg-page)] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          
          {/* Header */}
          <header className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Compass size={14} />
              <span>OFFICIAL EXPEDITION CATALOGUE</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 sm:text-5xl">
              Verified Mountain Expeditions
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              All-inclusive high-altitude tours managed by licensed alpine drivers and certified local guides. Full vehicle logistics, permits, and accommodations included.
            </p>
          </header>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1">
                <Filter size={14} /> Region:
              </span>
              {regions.map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedRegion === reg
                      ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Showing <strong>{filteredPackages.length}</strong> expeditions</span>
            </div>
          </div>

          {/* Package Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <Card 
                  hover 
                  className="h-full flex flex-col justify-between overflow-hidden border-slate-200/90 bg-white shadow-md hover:shadow-xl transition-all group"
                >
                  <div>
                    {/* Media Banner */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <DestinationImage
                        destinationId={pkg.destinationId}
                        locationName={pkg.title}
                        fill
                        className="group-hover:scale-108 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 text-slate-900 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                        <Clock size={13} className="text-emerald-700" />
                        <span>{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-slate-900/85 text-white backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono shadow-md">
                        PKR {pkg.pricePKR.toLocaleString()} <span className="text-white/70 font-normal">(${pkg.priceUSD})</span>
                      </div>
                      <div className="absolute top-3 right-3 bg-emerald-600/90 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {pkg.difficulty}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-emerald-800 uppercase tracking-wider">
                          {pkg.region}
                        </span>
                        <div className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star size={13} className="fill-amber-500 text-amber-500" />
                          <span>{pkg.rating}</span>
                          <span className="text-slate-400 font-normal">({pkg.reviewsCount})</span>
                        </div>
                      </div>

                      <h2 className="font-display font-bold text-xl text-slate-900 group-hover:text-[var(--brand-primary)] transition-colors leading-snug">
                        {pkg.title}
                      </h2>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {pkg.tagline}
                      </p>

                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Key Inclusions:
                        </span>
                        {pkg.highlights.slice(0, 3).map((item, hIdx) => (
                          <div key={hIdx} className="flex items-center gap-2 text-xs text-slate-700">
                            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Operated by:</span>
                        <span className="font-bold text-slate-800 truncate max-w-[180px]">{pkg.operator.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0 flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/packages/${pkg.id}`)}
                      className="flex-1 text-xs font-bold"
                    >
                      View Itinerary
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={() => navigate(`/checkout?package=${pkg.id}`)}
                      className="flex-1 text-xs font-bold bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]"
                    >
                      Book Tour
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Trust Banner */}
          <div className="p-8 rounded-3xl bg-emerald-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold">Custom Alpine Expeditions & Private Charters</h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                Planning a corporate team offsite, filming expedition, or private family safari to K2 base camp or Khunjerab? Contact our expedition logistics desk.
              </p>
            </div>
            <Link 
              to="/contact" 
              className="px-6 py-3 rounded-xl bg-white text-emerald-950 font-bold text-xs shrink-0 hover:bg-emerald-50 transition-all hover:scale-105 shadow-md"
            >
              Request Custom Quote
            </Link>
          </div>

        </div>
      </main>
    </PageWrapper>
  );
}
