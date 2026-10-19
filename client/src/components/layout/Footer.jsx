/**
 * ==============================================================================
 * RAASTAH (راستہ) — THE INTELLIGENT WAY
 * Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich
 * ==============================================================================
 * FILE: Footer.jsx
 * PATH: client/src/components/layout/Footer.jsx
 * PURPOSE: Global high-contrast footer with rich link directory, corporate branding,
 *          and alpine expedition navigation.
 * ==============================================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mountain, Navigation, MapPin } from 'lucide-react';
import RaastahLogo from '@/components/ui/RaastahLogo';

export default function Footer() {
  return (
    <footer className="relative z-20 w-full mt-20 border-t border-white/10 bg-[#091116] text-white px-0 pb-24 pt-16 lg:pb-12 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          
          {/* Brand Info & Mission */}
          <div className="space-y-4">
            <RaastahLogo size={44} showSlogan={true} />
            
            <p className="max-w-sm pt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
              Pakistan's flagship high-altitude expedition platform. Real-time mountain weather, verified 4x4 drivers, OSRM pass routing, and comprehensive travel dossiers.
            </p>

            <div className="max-w-sm rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
              <div className="mb-1 flex items-center gap-2 font-urdu text-sm font-semibold text-emerald-400" dir="rtl">
                <span>"سفر وہ نہیں جو نقشے پر ہو، سفر وہ ہے جو دل کو چھو جائے"</span>
              </div>
              <p className="text-[11px] text-slate-400">Pioneering climate-smart, altitude-conscious travel across Pakistan.</p>
            </div>
          </div>

          {/* Column 1: Expeditions & Planners */}
          <div>
            <h4 className="mb-4 flex items-center gap-2 font-display text-sm font-bold text-white uppercase tracking-wider">
              <Mountain size={15} className="text-emerald-400" />
              <span>Expeditions & Atlas</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li><Link to="/destinations" className="transition-colors hover:text-emerald-400">All 99 Pakistani Destinations</Link></li>
              <li><Link to="/destinations/hunza-valley" className="transition-colors hover:text-emerald-400">Hunza Valley & Khunjerab Pass</Link></li>
              <li><Link to="/destinations/shangrila-resort" className="transition-colors hover:text-emerald-400">Skardu & Deosai National Park</Link></li>
              <li><Link to="/destinations/fairy-meadows" className="transition-colors hover:text-emerald-400">Fairy Meadows & Nanga Parbat Base</Link></li>
              <li><Link to="/packages" className="transition-colors hover:text-amber-400 font-semibold">Tour Packages & Expeditions</Link></li>
              <li><Link to="/planner" className="transition-colors hover:text-emerald-400">Custom Itinerary Builder</Link></li>
              <li><Link to="/mood-matcher" className="transition-colors hover:text-emerald-400">AI Trip Vibe Matcher</Link></li>
            </ul>
          </div>

          {/* Column 2: Mountain Intelligence Tools */}
          <div>
            <h4 className="mb-4 flex items-center gap-2 font-display text-sm font-bold text-white uppercase tracking-wider">
              <Navigation size={15} className="text-amber-400" />
              <span>Mountain Tools</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li><Link to="/tools" className="transition-colors hover:text-emerald-400">Live Weather Radar (Open-Meteo)</Link></li>
              <li><Link to="/tools" className="transition-colors hover:text-emerald-400">Babusar, Lowari & KKH Pass Alerts</Link></li>
              <li><Link to="/tools?tab=altitude" className="transition-colors hover:text-emerald-400">Altitude Sickness (AMS) Advisor</Link></li>
              <li><Link to="/pocket-guide" className="transition-colors hover:text-amber-400 font-semibold">Pocket Guide & Voice Translator</Link></li>
              <li><Link to="/tools" className="transition-colors hover:text-emerald-400">Fuel & Trip Cost Estimator</Link></li>
              <li><Link to="/group-trip" className="transition-colors hover:text-emerald-400">Group Trip Expense Splitter</Link></li>
            </ul>
          </div>

          {/* Column 3: Verified Marketplace & Safety */}
          <div>
            <h4 className="mb-4 flex items-center gap-2 font-display text-sm font-bold text-white uppercase tracking-wider">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span>Verified Directory</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li><Link to="/guides" className="transition-colors hover:text-emerald-400">Verified 4x4 Mountain Drivers</Link></li>
              <li><Link to="/operators" className="transition-colors hover:text-emerald-400">Tour Operator & Route Map</Link></li>
              <li><Link to="/my-trips" className="transition-colors hover:text-emerald-400">My Expeditions & Wishlist</Link></li>
              <li><Link to="/about" className="transition-colors hover:text-emerald-400">About Apex Wireframe Pvt Ltd</Link></li>
              <li><Link to="/faq" className="transition-colors hover:text-emerald-400">High-Altitude Safety FAQs</Link></li>
              <li><Link to="/admin/login" className="text-slate-400 transition-colors hover:text-emerald-400">Super Admin Command Center</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Banner with Signature Branding */}
        <div className="flex flex-col items-start justify-between gap-4 pt-8 text-xs text-slate-400 sm:flex-row sm:items-center">
          <div>
            <span>© {new Date().getFullYear()} RAASTAH (راستہ). All rights reserved.</span>
          </div>

          {/* Lead Signature */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs">
            <span className="text-slate-300">Engineered by</span>
            <span className="font-bold tracking-wide text-emerald-400">Apex Wireframe Pvt Ltd</span>
            <span className="text-slate-500">•</span>
            <span className="font-semibold text-white">Lead: Ahsan Warraich</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
