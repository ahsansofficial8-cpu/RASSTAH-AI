import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value, onChange, children, className }) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  const setActive = onChange ?? setInternal;

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn('', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className }) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 border-b border-border overflow-x-auto no-scrollbar',
        className
      )}
    >
      {children}
    </div>
  );
}

export function Tab({ value, children, className }) {
  const { active, setActive } = useContext(TabsContext);
  const isActive = active === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActive(value)}
      className={cn(
        'relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
        isActive 
          ? 'text-emerald-700 dark:text-emerald-400 font-bold' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium',
        className
      )}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400"
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}
    </button>
  );
}

export function TabPanel({ value, children, className }) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('py-5', className)}
    >
      {children}
    </motion.div>
  );
}
