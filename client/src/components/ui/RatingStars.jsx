import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function RatingStars({ rating = 0, max = 5, size = 16, className }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star
              size={size}
              className="text-border fill-border absolute inset-0"
            />
            {(filled || partial) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: partial ? `${(rating % 1) * 100}%` : '100%' }}
              >
                <Star size={size} className="text-accent fill-accent" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
