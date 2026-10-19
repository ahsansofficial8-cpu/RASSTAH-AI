/**
 * ==============================================================================
 * RAASTAH (راستہ) — THE INTELLIGENT WAY
 * Apex Wireframe Pvt Ltd | Lead: Ahsan Warraich
 * ==============================================================================
 * FILE: AdminLogin.jsx
 * PATH: client/src/pages/AdminLogin.jsx
 * PURPOSE: Restricted Super Admin authentication gateway with role-checked redirection.
 * LAST UPDATED: October 2026
 * ==============================================================================
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import { Card, Button, Input } from '@/components/ui';
import RaastahLogo from '@/components/ui/RaastahLogo';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ShieldCheck, KeyRound } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillDemoAdmin = () => {
    setEmail('admin');
    setPassword('ahsan2008');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        setError('Super Admin privileges required to enter the Command Center.');
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="w-full flex-grow min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-16">
        <Card className="max-w-md w-full border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 shadow-xl">
          
          <div className="flex flex-col items-center text-center mb-6">
            <RaastahLogo size={52} showSlogan={false} className="justify-center mb-3" />
            <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
              SUPER ADMIN PORTAL
            </div>
            <h1 className="text-2xl font-display font-bold tracking-wide text-[var(--text-primary)]">
              RAASTAH COMMAND CENTER
            </h1>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Restricted management console for Apex Wireframe Pvt Ltd operations
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] p-3 text-xs text-[var(--danger)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin Username or Email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin or admin@raastah.pk"
              required
            />
            <Input
              label="Master Key Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password (ahsan2008)"
              required
            />

            <Button 
              type="submit" 
              className="mt-2 w-full"
              disabled={loading}
            >
              {loading ? 'Verifying Security Clearance...' : 'Authenticate & Enter'}
            </Button>
          </form>

          {/* Hackathon Evaluation Quick-Fill Credentials */}
          <div className="mt-5 p-3 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck size={14} /> Evaluation Credentials
            </div>
            <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
              Username: <strong className="font-mono text-[var(--text-primary)]">admin</strong> · Password: <strong className="font-mono text-[var(--text-primary)]">ahsan2008</strong>
            </p>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              <KeyRound size={13} /> Quick-Fill Super Admin
            </button>
          </div>

          <div className="text-center mt-6">
            <Link to="/" className="text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]">
              ← Return to Public Website
            </Link>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
