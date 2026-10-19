/**
 * ==============================================================================
 * RAASTAH (راستہ) — THE INTELLIGENT WAY
 * Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich
 * ==============================================================================
 * FILE: App.jsx
 * PATH: client/src/App.jsx
 * PURPOSE: Root application component configuring React Router routes, global navigation,
 *          bottom navigation for mobile, AI Guide chatbot overlay, and page transitions.
 * LAST UPDATED: October 2026
 * ==============================================================================
 */

import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import RaastahGuideChatbot from '@/components/ui/RaastahGuideChatbot';
import WomenSafeVoiceGuard from '@/components/ui/WomenSafeVoiceGuard';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import RaastahLogo from '@/components/ui/RaastahLogo';

// Pages
import Home from '@/pages/Home';
import Destinations from '@/pages/Destinations';
import DestinationDetail from '@/pages/DestinationDetail';
import Packages from '@/pages/Packages';
import PackageDetail from '@/pages/PackageDetail';
import ItineraryPlanner from '@/pages/ItineraryPlanner';
import MoodMatcher from '@/pages/MoodMatcher';
import BookingCheckout from '@/pages/BookingCheckout';
import BookingConfirmation from '@/pages/BookingConfirmation';
import MyTrips from '@/pages/MyTrips';
import GroupTrip from '@/pages/GroupTrip';
import Guides from '@/pages/Guides';
import Operators from '@/pages/Operators';
import TravelTools from '@/pages/TravelTools';
import PocketGuide from '@/pages/PocketGuide';
import Blog from '@/pages/Blog';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminLogin from '@/pages/AdminLogin';
import GenericPage from '@/pages/GenericPage';

export default function App() {
  const location = useLocation();
  const lastPath = useRef(location.pathname);
  const [isRouteChanging, setIsRouteChanging] = useState(false);

  useEffect(() => {
    if (lastPath.current === location.pathname) return undefined;
    lastPath.current = location.pathname;
    setIsRouteChanging(true);
    const timeout = window.setTimeout(() => setIsRouteChanging(false), 180);
    return () => window.clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <div className="flex w-full min-h-screen flex-col overflow-x-hidden bg-background text-text selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-grow flex flex-col w-full">
        <AnimatePresence mode="wait">
          <ErrorBoundary key={location.pathname}>
          <Routes location={location} key={location.pathname}>
            {/* Core Multi-Page Application Sitelist */}
            <Route path="/" element={<Home />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/experiences" element={<Destinations />} />
            <Route path="/destinations/:id" element={<DestinationDetail />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/packages/:id" element={<PackageDetail />} />
            <Route path="/planner" element={<ItineraryPlanner />} />
            <Route path="/mood-matcher" element={<MoodMatcher />} />
            <Route path="/vibe-matcher" element={<MoodMatcher />} />
            <Route path="/checkout" element={<BookingCheckout />} />
            <Route path="/confirmation" element={<BookingConfirmation />} />
            
            {/* Customer Account & Trips */}
            <Route path="/dashboard" element={<MyTrips />} />
            <Route path="/my-trips" element={<MyTrips />} />
            <Route path="/account" element={<MyTrips />} />
            <Route path="/my-bookings" element={<MyTrips />} />
            <Route path="/my-profile" element={<MyTrips />} />
            
            {/* Group Travel & Mountain Services */}
            <Route path="/group-trip" element={<GroupTrip />} />
            <Route path="/group-trip/:id" element={<GroupTrip />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/operators" element={<Operators />} />
            <Route path="/tools" element={<TravelTools />} />
            <Route path="/pocket-guide" element={<PocketGuide />} />
            <Route path="/stories" element={<Blog />} />
            <Route path="/blog" element={<Blog />} />
            
            {/* Authentication & Security */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Admin Command Center */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin/customers" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminDashboard />} />
            <Route path="/admin/prices" element={<AdminDashboard />} />
            <Route path="/admin/feedback" element={<AdminDashboard />} />

            {/* Standard Expedition & Safety Pages */}
            <Route path="/about" element={
              <GenericPage title="About Raastah (راستہ)" subtitle="Pioneering climate-smart, altitude-conscious travel planning in Northern Pakistan and worldwide. Powered by Apex Wireframe Pvt Ltd" />
            } />
            <Route path="/contact" element={
              <GenericPage title="Expedition Desk & Support" subtitle="Get in touch with our operations desk in Islamabad, Gilgit, and Skardu for pass advisories and logistics." />
            } />
            <Route path="/faq" element={
              <GenericPage title="High-Altitude & Route FAQs" subtitle="Real-time advice on road permits, altitude sickness protocols, Babusar seasonal openings, and vetted 4x4 drivers." />
            } />
            <Route path="/policies/*" element={
              <GenericPage title="Policies & Guarantees" subtitle="Transparent 72-hour cancellation terms, honest availability without fake timers, and emergency support." />
            } />
            <Route path="*" element={
              <GenericPage title="404 — Valley Trail Not Found" subtitle="Looks like you wandered off the marked trail. Return to Raastah home base to resume your mountain journey." />
            } />
          </Routes>
          </ErrorBoundary>
        </AnimatePresence>
      </main>
      
      {/* RaastahGuide Multi-Model Gemini Copilot */}
      <ErrorBoundary>
        <RaastahGuideChatbot />
      </ErrorBoundary>

      {/* Women-Safe Voice Emergency Guardian */}
      <ErrorBoundary>
        <WomenSafeVoiceGuard />
      </ErrorBoundary>
      
      <Footer />
      <BottomNav />
      {isRouteChanging && (
        <div
          className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-[var(--bg-page)]/90"
          role="status"
          aria-live="polite"
          aria-label="Changing page"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute h-20 w-20 animate-spin rounded-full border-2 border-[var(--brand-primary-border)] border-t-[var(--brand-primary)]" />
            <RaastahLogo size={56} showSlogan={false} />
          </div>
          <span className="sr-only">Changing page…</span>
        </div>
      )}
    </div>
  );
}
