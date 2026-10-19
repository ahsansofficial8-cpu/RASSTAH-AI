import React from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Card, Button, Badge } from '@/components/ui';

export default function GenericPage({ title, subtitle, icon: Icon, children }) {
  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 min-h-[60vh]">
        <div className="mb-8">
          <Badge variant="primary" className="mb-3">Raastah (راستہ) • Expedition Desk</Badge>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-text mb-2">{title}</h1>
          {subtitle && <p className="text-text-muted max-w-2xl">{subtitle}</p>}
        </div>
        {children}
      </div>
    </PageWrapper>
  );
}
