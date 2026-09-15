import { AlertTriangle, CheckCircle2, MapPin, Package, PlusCircle, Truck } from 'lucide-react';
import type { TimelineEvent } from '@/types';

const ICON: Record<TimelineEvent['kind'], typeof Package> = {
  created: PlusCircle,
  pickup: Package,
  departed: Truck,
  checkpoint: MapPin,
  updated: MapPin,
  delivered: CheckCircle2,
  exception: AlertTriangle,
};

const COLOR: Record<TimelineEvent['kind'], string> = {
  created: 'text-ink-muted',
  pickup: 'text-accent-blue',
  departed: 'text-accent-blue',
  checkpoint: 'text-ink-secondary',
  updated: 'text-ink-secondary',
  delivered: 'text-accent-green',
  exception: 'text-accent-red',
};

export function ActivityTimeline({ events }: { events: TimelineEvent[] }) {
  const sorted = [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div className="space-y-0">
      {sorted.map((event, i) => {
        const Icon = ICON[event.kind];
        const date = new Date(event.timestamp);
        return (
          <div key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            {i < sorted.length - 1 && (
              <span className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-surface-border" />
            )}
            <div
              className={`relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface-raised ${COLOR[event.kind]}`}
            >
              <Icon size={13} />
            </div>
            <div className="pt-0.5">
              <p className="text-xs font-mono tabular text-ink-muted">
                {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
              <p className="text-sm text-ink-secondary">{event.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
