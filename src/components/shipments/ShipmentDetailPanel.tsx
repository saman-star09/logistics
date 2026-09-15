import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Carrier, Shipment } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDelay, formatEta, formatRelativeSeconds } from '@/utils/format';
import { useShipmentTimeline } from '@/hooks/useShipmentTimeline';
import { DeliveryProgress } from './DeliveryProgress';
import { ActivityTimeline } from './ActivityTimeline';

export function ShipmentDetailPanel({
  shipment,
  carrier,
  onClose,
}: {
  shipment: Shipment | null;
  carrier: Carrier | undefined;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const timeline = useShipmentTimeline(shipment?.id ?? null);

  if (!shipment) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md animate-slideIn flex-col overflow-y-auto border-l border-surface-borderStrong bg-surface-panel shadow-floating">
        <div className="sticky top-0 z-10 border-b border-surface-border bg-surface-panel px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-bold tabular text-ink-primary">{shipment.id}</p>
              <p className="text-sm text-ink-secondary">{shipment.route}</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-ink-muted transition hover:bg-surface-raised hover:text-ink-primary"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-3">
            <StatusBadge status={shipment.status} />
          </div>
        </div>

        <div className="flex-1 space-y-6 px-5 py-5">
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Delivery Progress</h3>
            <DeliveryProgress shipment={shipment} />
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Current Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <InfoField label="Current Location" value={shipment.currentLocationLabel} />
              <InfoField label="Carrier" value={carrier?.name ?? '—'} />
              <InfoField label="Scheduled ETA" value={formatEta(new Date(shipment.scheduledEta))} />
              <InfoField label="Updated ETA" value={formatEta(new Date(shipment.predictedEta))} />
              <InfoField
                label="Current Delay"
                value={shipment.delayMinutes > 1 ? formatDelay(shipment.delayMinutes) : 'On schedule'}
                tone={shipment.delayMinutes > 40 ? 'red' : shipment.delayMinutes > 5 ? 'amber' : 'green'}
              />
              <InfoField label="Last GPS Update" value={`${formatRelativeSeconds(shipment.lastUpdateSeconds)} ago`} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Shipment Activity Timeline
            </h3>
            <ActivityTimeline events={timeline} />
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'red' | 'amber' | 'green';
}) {
  const toneClass: Record<string, string> = {
    default: 'text-ink-primary',
    red: 'text-accent-red',
    amber: 'text-accent-amber',
    green: 'text-accent-green',
  };
  return (
    <div className="rounded-md border border-surface-border bg-surface-raised px-3 py-2.5">
      <p className="text-[11px] text-ink-muted">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${toneClass[tone]}`}>{value}</p>
    </div>
  );
}
