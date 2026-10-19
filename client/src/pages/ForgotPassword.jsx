import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import { Card, Button, Input } from '@/components/ui';
import RaastahLogo from '@/components/ui/RaastahLogo';
import api from '@/services/api';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data?.message || 'Password reset instructions dispatched.');
      setSubmitted(true);
    } catch (requestError) {
      setError(typeof requestError === 'string' ? requestError : 'Password recovery instructions sent if email exists.');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="w-full flex-grow min-h-[75vh] flex items-center justify-center px-4 sm:px-6 py-16">
        <Card className="max-w-md w-full p-8 shadow-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
          <div className="flex flex-col items-center text-center mb-6">
            <RaastahLogo size={52} showSlogan={false} className="justify-center mb-3" />
            <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] tracking-wide">RESET PASSWORD</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Enter your registered email address to receive secure recovery instructions
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 size={26} />
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {message}
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="outline" className="w-full text-xs">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                required
              />
              {error && <p className="mb-0 text-sm text-[var(--danger)]" role="alert">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : 'Send Recovery Instructions'}
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <ArrowLeft size={13} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
}
