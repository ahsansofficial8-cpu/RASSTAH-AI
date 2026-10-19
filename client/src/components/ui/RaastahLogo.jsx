import React from 'react';

export default function RaastahLogo({ size = 42, showSlogan = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-Fidelity Alpine & Raastah (Way/Path) Travel Crest */}
      <div 
        className="relative flex items-center justify-center shrink-0 rounded-2xl transition-all duration-300 hover:scale-105 shadow-md"
        style={{ 
          width: size, 
          height: size, 
          background: 'linear-gradient(135deg, #0d3b37 0%, #064e3b 50%, #042f2e 100%)',
          border: '1.5px solid rgba(45, 212, 191, 0.35)',
          boxShadow: '0 4px 14px rgba(6, 78, 59, 0.3)'
        }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="peakGlow" x1="50" y1="12" x2="50" y2="82" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="roadGold" x1="20" y1="85" x2="80" y2="45" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <radialGradient id="sunGlow" cx="50" cy="22" r="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde68a" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Compass Rose Ring Background */}
          <circle cx="50" cy="50" r="42" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="34" stroke="rgba(45, 212, 191, 0.18)" strokeWidth="1" />

          {/* Golden Sunrise behind peaks */}
          <circle cx="50" cy="30" r="12" fill="url(#sunGlow)" />
          <circle cx="50" cy="28" r="4.5" fill="#fef08a" />

          {/* Background Mountain (Nanga Parbat / Rakaposhi) */}
          <polygon points="68,36 88,78 48,78" fill="#065f46" opacity="0.65" />
          <polygon points="68,36 88,78 68,78" fill="#044e39" opacity="0.85" />

          {/* Foreground Majestic Alpine Summit (K2 / Hunza Horn) */}
          <polygon points="36,22 62,78 10,78" fill="url(#peakGlow)" />
          {/* Shaded Chiseled Ridge Face */}
          <polygon points="36,22 62,78 36,78" fill="#022c22" opacity="0.45" />
          {/* Snow Cap */}
          <polygon points="36,22 45,42 36,38 27,42" fill="#ffffff" opacity="0.95" />

          {/* Winding Scenic Highway Ribbon ("Raastah") */}
          <path 
            d="M 16 84 C 28 80, 38 68, 48 64 C 58 60, 68 52, 78 48" 
            stroke="url(#roadGold)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
          {/* Highway center dash marks */}
          <path 
            d="M 22 82 C 32 78, 40 68, 50 63" 
            stroke="#ffffff" 
            strokeWidth="1" 
            strokeDasharray="2 3" 
            strokeLinecap="round"
            opacity="0.85" 
          />

          {/* Explorer's Compass Star Pinpoint */}
          <polygon points="50,11 52,19 60,21 52,23 50,31 48,23 40,21 48,19" fill="#fef08a" />
          <circle cx="50" cy="21" r="1.5" fill="#d97706" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-baseline gap-2">
          <span 
            className="font-display font-black tracking-tight text-xl leading-none text-[var(--text-primary)]"
          >
            RAASTAH
          </span>
          <span 
            className="font-urdu font-bold text-base leading-none text-emerald-600 dark:text-emerald-400" 
            dir="rtl"
          >
            راستہ
          </span>
        </div>

        {showSlogan && (
          <div className="hidden items-center gap-1.5 mt-0.5 sm:flex">
            <span 
              className="text-[9px] tracking-widest uppercase font-bold text-[var(--text-secondary)] font-sans"
            >
              PAKISTAN EXPEDITIONS
            </span>
            <span className="text-[7px] text-amber-500">•</span>
            <span 
              className="text-[8.5px] tracking-wider uppercase font-semibold text-emerald-600 dark:text-emerald-400 font-sans"
            >
              The Intelligent Way
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
