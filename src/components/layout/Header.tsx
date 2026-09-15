import clsx from 'clsx';
import { Truck } from 'lucide-react';
import { LiveIndicator } from '@/components/common/LiveIndicator';
import { NotificationCenter } from './NotificationCenter';
import type { NotificationItem } from '@/types';
import { formatClock } from '@/utils/format';

export type ViewKey = 'overview' | 'shipments' | 'exceptions' | 'carriers' | 'analytics';

const NAV_ITEMS: Array<{ key: ViewKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'shipments', label: 'Shipments' },
  { key: 'exceptions', label: 'Exceptions' },
  { key: 'carriers', label: 'Carriers' },
  { key: 'analytics', label: 'Analytics' },
];

export function Header({
  activeView,
  onNavigate,
  lastSyncedAt,
  notifications,
  onOpenNotifications,
  exceptionCount,
}: {
  activeView: ViewKey;
  onNavigate: (v: ViewKey) => void;
  lastSyncedAt: Date;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  exceptionCount: number;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface-base/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-blue">
              <Truck size={18} className="text-white" strokeWidth={2.25} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-ink-primary">Meridian Freight Network</p>
              <p className="text-[11px] leading-tight text-ink-muted">Logistics Operations Center</p>
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-lg border border-surface-border bg-surface-raised p-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={clsx(
                'relative rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors',
                activeView === item.key
                  ? 'bg-accent-blue text-white'
                  : 'text-ink-secondary hover:bg-surface-overlay hover:text-ink-primary',
              )}
            >
              {item.label}
              {item.key === 'exceptions' && exceptionCount > 0 && (
                <span
                  className={clsx(
                    'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    activeView === item.key ? 'bg-white/20 text-white' : 'bg-accent-red/15 text-accent-red',
                  )}
                >
                  {exceptionCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LiveIndicator />
          <div className="hidden text-right lg:block">
            <p className="text-[11px] text-ink-muted">Last synchronized</p>
            <p className="font-mono text-xs tabular text-ink-secondary">{formatClock(lastSyncedAt)}</p>
          </div>
          <NotificationCenter notifications={notifications} onOpen={onOpenNotifications} />
          <div className="flex items-center gap-2 rounded-md border border-surface-border bg-surface-raised px-2 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-blueMuted text-[11px] font-semibold text-white">
              AS
            </div>
            <div className="hidden text-left lg:block">
              <p className="text-xs font-medium leading-tight text-ink-primary">A. Saman</p>
              <p className="text-[10px] leading-tight text-ink-muted">Coordinator</p>
            </div>
          </div>
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-surface-border px-3 py-1.5 md:hidden">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={clsx(
              'flex-shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              activeView === item.key ? 'bg-accent-blue text-white' : 'text-ink-secondary',
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
