import React from 'react';
import { cn } from '@/utils/cn';

const variants = {
  primary:   'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] border border-[var(--brand-primary-border)]',
  accent:    'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)] border border-[var(--brand-accent-border)] font-semibold',
  success:   'bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success-border)]',
  warning:   'bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning-border)]',
  danger:    'bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger-border)]',
  muted:     'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]',
  solid:     'bg-[var(--brand-primary)] text-[var(--text-on-brand)]',
};

const sizes = {
  sm: 'text-[10px] px-2 py-0.5 tracking-wider uppercase font-semibold',
  md: 'text-xs px-2.5 py-1 font-medium',
  lg: 'text-sm px-3.5 py-1.5 font-semibold',
};

export default function Badge({
  variant = 'primary',
  size = 'md',
  className,
  children,
  dot = false,
}) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full',
      variants[variant],
      sizes[size],
      className
    )}>
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          variant === 'primary' ? 'bg-[var(--brand-primary)]' :
          variant === 'accent'  ? 'bg-[var(--brand-accent)]' :
          variant === 'success' ? 'bg-[var(--success)]' :
          variant === 'warning' ? 'bg-[var(--warning)]' :
          variant === 'danger'  ? 'bg-[var(--danger)]' : 'bg-[var(--text-muted)]'
        )} />
      )}
      {children}
    </span>
  );
}
