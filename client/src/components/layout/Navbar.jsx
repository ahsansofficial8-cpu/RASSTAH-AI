/**
 * ==============================================================================
 * RAASTAH (راستہ) — THE INTELLIGENT WAY
 * Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich
 * ==============================================================================
 * FILE: Navbar.jsx
 * PATH: client/src/components/layout/Navbar.jsx
 * PURPOSE: Global sticky header with branding, desktop navigation links,
 *          account navigation, emergency access, and mobile drawer.
 * LAST UPDATED: October 2026
 * ==============================================================================
 */

import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Heart, Menu, X, LogOut, ArrowRight, User, AlertOctagon
} from 'lucide-react';
import RaastahLogo from '@/components/ui/RaastahLogo';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { label: 'Destinations', to: '/destinations' },
  { label: 'Experiences', to: '/experiences' },
  { label: 'Expeditions', to: '/packages' },
  { label: 'Itinerary Builder', to: '/planner' },
  { label: 'Vibe Matcher', to: '/mood-matcher' },
  { label: 'Travel Tools', to: '/tools' },
  { label: 'Pocket Guide', to: '/pocket-guide' },
  { label: 'Local 4x4 Guides', to: '/guides' },
  { label: 'Operator Map', to: '/operators' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-default)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        
        {/* Left: Brand Identity with Apex Wireframe Pvt Ltd signature */}
        <Link to="/" className="flex min-w-0 items-center">
          <RaastahLogo size={36} showSlogan={true} />
        </Link>

        {/* Right-aligned desktop navigation */}
        <nav className="ml-auto mr-6 hidden items-center gap-6 xl:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `text-xs font-semibold tracking-wide transition-colors duration-200 py-1 ${
                isActive 
                  ? 'text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--brand-primary)]'
              }`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Action Links */}
        <div className="flex items-center gap-3">
          
          {/* Quick Emergency SOS Pill */}
          <Link 
            to="/tools?tab=sos" 
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors"
            title="Emergency SOS & Location Radar"
          >
            <AlertOctagon size={13} />
            <span>SOS</span>
          </Link>

          <Link 
            to="/my-trips" 
            className="text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--bg-subtle)]"
            title="Saved Expeditions"
          >
            <Heart size={18} />
          </Link>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link 
                to="/account" 
                className="text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--brand-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--brand-primary-border)] transition-colors flex items-center gap-1.5"
              >
                <User size={13} className="text-[var(--brand-primary)]" />
                <span>Account</span>
              </Link>

              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="text-xs font-bold text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white px-2.5 py-1.5 rounded-lg bg-[var(--brand-primary-soft)] border border-[var(--brand-primary-border)] transition-colors"
                >
                  Admin
                </Link>
              )}

              <button 
                onClick={() => { logout(); navigate('/'); }}
                className="text-[var(--text-muted)] hover:text-rose-600 transition-colors p-2 rounded-lg hover:bg-rose-50"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <Link 
                to="/login" 
                className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors font-semibold px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--text-on-brand)] font-semibold tracking-wide shadow-xs transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden text-[var(--text-primary)] hover:text-[var(--brand-primary)] p-2 rounded-lg hover:bg-[var(--bg-subtle)]"
            aria-label="Toggle Menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-[var(--bg-surface)] border-b border-[var(--border-default)] px-6 py-6 space-y-4 shadow-lg"
          >
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `text-sm font-semibold p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  {item.label}
                </NavLink>
              ))}

              <Link
                to="/tools?tab=sos"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold p-2 rounded-lg bg-rose-50 text-rose-600 flex items-center gap-2"
              >
                <AlertOctagon size={16} />
                <span>Emergency SOS & Location Radar</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-[var(--border-default)] flex flex-col gap-2">
              {user ? (
                <>
                  <Link 
                    to="/account" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-semibold text-[var(--text-primary)] py-2 px-3 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-between"
                  >
                    <span>My Account ({user.name})</span>
                    <ArrowRight size={14} className="text-[var(--brand-primary)]" />
                  </Link>
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-bold text-[var(--brand-primary)] py-2 px-3 rounded-lg bg-[var(--brand-primary-soft)]"
                    >
                      Super Admin Command Center
                    </Link>
                  )}
                  <button 
                    onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }}
                    className="text-xs font-semibold text-rose-600 py-2 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-center font-semibold py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-primary)]"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-center font-bold py-2 rounded-lg bg-[var(--brand-primary)] text-white"
                  >
                    Join Raastah
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
