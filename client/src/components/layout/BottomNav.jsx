import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Package, Map, Wrench, User } from 'lucide-react';
import { cn } from '@/utils/cn';

const TABS = [
  { label: 'Explore', to: '/destinations', icon: Compass },
  { label: 'Packages', to: '/packages', icon: Package },
  { label: 'Planner', to: '/planner', icon: Map },
  { label: 'Tools', to: '/tools', icon: Wrench },
  { label: 'Account', to: '/my-trips', icon: User },
];

export default function BottomNav() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border flex justify-around py-2 px-1">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => cn(
            'flex flex-col items-center justify-center w-full py-1 text-xs gap-1',
            isActive ? 'text-primary font-semibold' : 'text-text-muted hover:text-text'
          )}
        >
          <tab.icon size={20} />
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
