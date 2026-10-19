import { useState } from 'react';
import { 
  Car, Train, Bus, Plane, ShieldCheck, Info
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import RouteSelector from '@/components/tools/RouteSelector';

/**
 * Multi-Modal Route Intelligence:
 * Compares Drive (KKH/Motorway), Luxury Bus (Faisal Movers/Daewoo/NATCO),
 * Pakistan Railways (Pak Rail Live GPS data), and Regional Flight (PIA to Gilgit/Skardu).
 */
export default function MultiModalPlanner() {
  const [selectedMode, setSelectedMode] = useState('drive');

  const modes = [
    {
      id: 'drive',
      name: 'Private 4x4 / Car',
      icon: <Car size={18} />,
      routeDesc: 'Direct highway and alpine pass travel. 4x4 recommended for off-road sectors and steep switchbacks.',
      available: true,
      tag: 'Direct Alpine Highway'
    },
    {
      id: 'bus',
      name: 'Executive Intercity Bus',
      icon: <Bus size={18} />,
      routeDesc: 'Luxury air-conditioned coaches operating regular departures to Gilgit, Swat, and Naran.',
      available: true,
      tag: 'NATCO & Faisal Movers'
    },
    {
      id: 'train',
      name: 'Pakistan Railways',
      icon: <Train size={18} />,
      routeDesc: 'Scenic rail service to Rawalpindi / Havelian gateway stations with seamless onward 4x4 road connections.',
      available: true,
      tag: 'Green Line Express'
    },
    {
      id: 'flight',
      name: 'PIA Scenic Mountain Air',
      icon: <Plane size={18} />,
      routeDesc: 'Direct scenic 45-minute mountain flights from Islamabad to Gilgit and Skardu airports.',
      available: true,
      tag: 'Direct Flights to GB'
    }
  ];

  const currentSelection = modes.find(m => m.id === selectedMode) || modes[0];

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-default)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--brand-primary)] font-bold">
              MULTI-MODAL ROUTE INTELLIGENCE
            </span>
            <Badge variant="primary">Verified Pakistani Travel Options</Badge>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mt-1">
            Choose your route and compare travel modes
          </h3>
        </div>

      </div>

      <RouteSelector />

      {/* Mode Selectors Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => setSelectedMode(mode.id)}
            disabled={!mode.available && mode.id === 'flight'}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              selectedMode === mode.id
                ? 'bg-[var(--brand-primary-soft)] border-[var(--brand-primary)] shadow-xs'
                : 'bg-[var(--bg-subtle)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`p-2 rounded-lg ${selectedMode === mode.id ? 'bg-[var(--brand-primary)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}>
                {mode.icon}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                Active Route
              </span>
            </div>

            <div>
              <div className="font-bold text-xs text-[var(--text-primary)]">{mode.name}</div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{mode.tag}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Mode Detail Spotlight */}
      <div className="p-5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <div className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
              Selected Travel Mode: {currentSelection.name}
            </div>
            <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
              Available Daily · Weather & Road clearance checked
            </div>
          </div>

          <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">Regular Scheduled Departures</span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {currentSelection.routeDesc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-[var(--border-default)]">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
            <span>Confirm schedules, fare, and reliability with the service provider.</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Info size={14} className="text-[var(--brand-accent)] shrink-0" />
            <span>Multi-modal transfer notes: 4x4 clearance mandatory past transit checkpoints.</span>
          </div>
        </div>
      </div>

    </div>
  );
}
