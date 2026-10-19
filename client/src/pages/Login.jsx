/**
 * ==============================================================================
 * RAASTAH (راستہ) — THE INTELLIGENT WAY
 * Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich
 * ==============================================================================
 * FILE: Login.jsx
 * PATH: client/src/pages/Login.jsx
 * PURPOSE: User and expedition member sign-in page with safe redirects and session integration.
 * LAST UPDATED: October 2026
 * ==============================================================================
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import { Card, Button, Input } from '@/components/ui';
import RaastahLogo from '@/components/ui/RaastahLogo';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const requestedRedirect = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email.trim(), password);
      const isSafeRedirect = requestedRedirect
        && requestedRedirect.startsWith('/')
        && !requestedRedirect.startsWith('//')
        && !requestedRedirect.includes('\\');
      const destination = isSafeRedirect
        ? requestedRedirect
        : (loggedUser?.role === 'admin' ? '/admin' : '/dashboard');
      navigate(destination);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="w-full flex-grow min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-16">
        <Card className="max-w-md w-full border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 shadow-xl">
          <div className="flex flex-col items-center text-center mb-6">
            <RaastahLogo size={52} showSlogan={false} className="justify-center mb-3" />
            <h1 className="text-2xl font-display font-bold tracking-wide text-[var(--text-primary)]">RAASTAH SIGN IN</h1>
            <p className="mt-1 font-sans text-xs text-[var(--text-secondary)]">
              Enter your credentials to access your trips or expedition management
            </p>
          </div>

          {searchParams.get('registered') === 'true' && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Account created successfully! Please sign in with your credentials to access your trips.</span>
            </div>
          )}

          {requestedRedirect && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)] p-3 text-xs text-[var(--brand-primary)]">
              <ShieldCheck size={16} className="shrink-0" />
              <span>Sign in required before completing your expedition checkout.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] p-3 text-xs text-[var(--danger)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address or Username"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@domain.com or admin"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <div className="flex items-center justify-between pt-1 text-xs text-[var(--text-secondary)]">
              <Link to="/forgot-password" className="transition-colors hover:text-[var(--brand-primary)]">
                Forgot password?
              </Link>
              <Link to="/register" className="transition-colors hover:text-[var(--brand-primary)]">
                Create new account
              </Link>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          {/* Quick-Fill Demo Traveler Account for Evaluators */}
          <div className="mt-4 p-2.5 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 text-center">
            <p className="text-[11px] text-[var(--text-secondary)]">
              Quick Test Account: <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">user@raastah.pk</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail('user@raastah.pk');
                setPassword('user123');
                setError('');
              }}
              className="mt-1.5 inline-block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Fill Demo Traveler Credentials →
            </button>
          </div>

          <div className="mt-5 pt-3 border-t border-[var(--border-default)] text-center">
            <Link to="/admin-login" className="text-xs text-[var(--text-muted)] hover:text-emerald-600 transition">
              Are you an administrator? Super Admin Portal →
            </Link>
          </div>

        </Card>
      </div>
    </PageWrapper>
  );
}
