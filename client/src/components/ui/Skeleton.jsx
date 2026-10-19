import React from 'react';

export function SkeletonLine({ width = '100%', height = '12px', className = '' }) {
  return (
    <div 
      className={`bg-[var(--bg-subtle)] rounded animate-pulse ${className}`} 
      style={{ width, height }} 
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-xs flex flex-col">
      <div className="aspect-[16/10] bg-gradient-to-r from-[var(--bg-subtle)] via-[var(--bg-hover)] to-[var(--bg-subtle)] animate-pulse" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 w-3/4 bg-[var(--bg-subtle)] rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-[var(--bg-subtle)] rounded animate-pulse" />
        <div className="h-3 w-full bg-[var(--bg-subtle)] rounded animate-pulse mt-2" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return <SkeletonCard />;
}

export function HeroSkeleton() {
  return (
    <div className="w-full min-h-[480px] bg-[var(--bg-subtle)] rounded-2xl animate-pulse p-8 flex flex-col justify-end gap-4">
      <div className="h-6 w-1/4 bg-[var(--bg-hover)] rounded" />
      <div className="h-10 w-2/3 bg-[var(--bg-hover)] rounded" />
      <div className="h-4 w-1/2 bg-[var(--bg-hover)] rounded" />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-64 w-full bg-[var(--bg-subtle)] rounded-2xl" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-[var(--bg-subtle)] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default function Skeleton({ className = '', ...props }) {
  return <div className={`bg-[var(--bg-subtle)] rounded animate-pulse ${className}`} {...props} />;
}
