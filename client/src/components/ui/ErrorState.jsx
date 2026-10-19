import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ title = 'Unable to Load Travel Data', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-surface)] border border-rose-200 rounded-2xl gap-3">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
        <AlertCircle size={28} />
      </div>
      <h3 className="text-base font-bold text-[var(--text-primary)]">{title}</h3>
      {message && <p className="text-xs text-[var(--text-muted)] max-w-sm leading-relaxed">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          Try Again
        </Button>
      )}
    </div>
  );
}
