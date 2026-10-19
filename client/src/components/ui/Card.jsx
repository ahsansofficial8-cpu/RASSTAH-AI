import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Card = forwardRef(({ className, children, hover = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] shadow-card text-[var(--text-primary)]',
      hover && 'transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-hover hover:border-[var(--brand-primary-border)] cursor-pointer',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

const CardImage = ({ src, alt, className, ratio = 'aspect-[4/3]' }) => (
  <div className={cn('overflow-hidden rounded-t-xl bg-[var(--bg-subtle)]', ratio, className)}>
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  </div>
);

const CardBody = ({ className, children }) => (
  <div className={cn('p-5 sm:p-6', className)}>{children}</div>
);

const CardFooter = ({ className, children }) => (
  <div className={cn('px-5 sm:px-6 py-4 border-t border-[var(--border-default)] bg-[var(--bg-page)] rounded-b-xl', className)}>{children}</div>
);

export { Card, CardImage, CardBody, CardFooter };
export default Card;
