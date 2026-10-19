import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const variants = {
  primary:   'bg-[var(--brand-primary)] text-[var(--text-on-brand)] hover:bg-[var(--brand-primary-hover)] shadow-sm hover:shadow active:scale-[0.99]',
  secondary: 'bg-[var(--bg-surface)] text-[var(--brand-primary)] border border-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)]',
  ghost:     'bg-transparent text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)]',
  accent:    'bg-[var(--brand-accent)] text-[var(--text-on-accent)] hover:bg-[var(--brand-accent-hover)] shadow-sm hover:shadow',
  danger:    'bg-[var(--danger)] text-[var(--text-on-danger)] hover:brightness-95 shadow-sm',
  outline:   'bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] shadow-sm',
  icon:      'bg-transparent p-2 hover:bg-[var(--brand-primary-soft)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)]',
};

const sizes = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 font-semibold',
  md: 'text-xs px-4 py-2.5 gap-2 font-semibold tracking-wide',
  lg: 'text-sm px-6 py-3 gap-2.5 font-bold tracking-wide',
};

const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-sans transition-all duration-200 cursor-pointer select-none',
        'focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40 focus-visible:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : leftIcon}
      {children && <span>{children}</span>}
      {!loading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
