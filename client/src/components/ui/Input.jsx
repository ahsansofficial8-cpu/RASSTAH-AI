import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Input = forwardRef(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className,
  wrapperClassName,
  size = 'md',
  ...props
}, ref) => {
  const sizes = {
    sm: 'h-9 text-xs px-3',
    md: 'h-10 text-xs px-3.5',
    lg: 'h-12 text-sm px-4',
  };

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label className="text-xs font-semibold text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-[var(--text-secondary)] pointer-events-none z-10">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]',
            'placeholder:text-[var(--text-muted)]',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)]',
            error && 'border-[var(--danger)] focus:ring-[var(--danger)]/20 focus:border-[var(--danger)]',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            sizes[size],
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-[var(--text-secondary)]">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-[11px] text-[var(--danger)] font-medium">{error}</p>}
      {hint && !error && <p className="text-[11px] text-[var(--text-secondary)]">{hint}</p>}
    </div>
  );
});
Input.displayName = 'Input';
export default Input;
