import { X } from 'lucide-react';
import type { Carrier, Shipment } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDelay, formatEta, formatRelativeSeconds } from '@/utils/format';

export function ShipmentQuickInfo({
  shipment,
  carrier,
  onClose,
  onViewDetails,
}: {
  shipment: Shipment;
  carrier: Carrier | undefined;
  onClose: () => void;
  onViewDetails: () => void;
}) {
  return (
    <div className="absolute right-3 top-3 w-64 animate-fadeUp rounded-lg border border-surface-borderStrong bg-surface-overlay/95 p-4 shadow-floating backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-ink-primary">Shipment #{shipment.id}</p>
        <button onClick={onClose} className="text-ink-muted hover:text-ink-primary">
          <X size={14} />
        </button>
      </div>
      <div className="mt-2">
        <StatusBadge status={shipment.status} />
      </div>
      <dl className="mt-3 space-y-1.5 text-xs">
        <Row label="Route" value={shipment.route} />
        <Row label="Carrier" value={carrier?.name ?? '—'} />
        <Row label="Current Location" value={shipment.currentLocationLabel} />
        <Row label="Scheduled ETA" value={formatEta(new Date(shipment.scheduledEta))} />
        <Row label="Predicted ETA" value={formatEta(new Date(shipment.predictedEta))} />
        {shipment.delayMinutes > 5 && (
          <Row label="Delay" value={formatDelay(shipment.delayMinutes)} valueClass="text-accent-red" />
        )}
        <Row label="Last Update" value={`${formatRelativeSeconds(shipment.lastUpdateSeconds)} ago`} />
      </dl>
      <button
        onClick={onViewDetails}
        className="mt-3 w-full rounded-md bg-accent-blue py-1.5 text-xs font-medium text-white transition hover:bg-accent-blueMuted"
      >
        View Full Details
      </button>
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={`font-medium text-ink-secondary ${valueClass ?? ''}`}>{value}</dd>
    </div>
  );
}
