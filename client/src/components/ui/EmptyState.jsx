import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-[var(--bg-surface)] border border-dashed border-[var(--border-strong)] rounded-2xl">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] flex items-center justify-center mb-4">
          <Icon size={26} />
        </div>
      )}
      <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5">{title}</h3>
      {description && <p className="text-xs text-[var(--text-muted)] max-w-sm mb-4 leading-relaxed">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
