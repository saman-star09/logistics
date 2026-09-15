import clsx from 'clsx';
import { CheckCircle2 } from 'lucide-react';
import type { ExceptionRecord } from '@/types';
import { formatClock } from '@/utils/format';

const SECONDARY_ACTION: Record<ExceptionRecord['type'], string | null> = {
  delivery_delay: 'Contact Dispatcher',
  eta_risk: null,
  signal_lost: 'Investigate',
};

export function ExceptionCard({
  record,
  onView,
  onAcknowledge,
}: {
  record: ExceptionRecord;
  onView: (shipmentId: string) => void;
  onAcknowledge: (shipmentId: string, action: string) => void;
}) {
  const secondary = SECONDARY_ACTION[record.type];
  const isCritical = record.severity === 'critical';

  return (
    <div
      className={clsx(
        'rounded-lg border p-4 transition-colors',
        record.acknowledged
          ? 'border-surface-border bg-surface-raised/40 opacity-60'
          : isCritical
            ? 'border-accent-red/25 bg-accent-red/5'
            : 'border-accent-amber/25 bg-accent-amber/5',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span
            className={clsx(
              'mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full',
              isCritical ? 'bg-accent-red' : 'bg-accent-amber',
            )}
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-ink-primary">Shipment #{record.shipmentId}</p>
              {record.acknowledged && (
                <span className="flex items-center gap-1 rounded-full bg-surface-overlay px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                  <CheckCircle2 size={10} /> Acknowledged
                </span>
              )}
            </div>
            <p className={clsx('text-xs font-medium', isCritical ? 'text-accent-red' : 'text-accent-amber')}>
              {record.title}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-ink-muted">{formatClock(new Date(record.createdAt))}</p>
      </div>

      <p className="mt-2 text-xs text-ink-secondary">
        {record.route} <span className="text-ink-muted">· Carrier: {record.carrierName}</span>
      </p>
      <p className="mt-1.5 text-xs text-ink-secondary">{record.description}</p>
      <p className="mt-1.5 text-xs text-ink-muted">
        <span className="font-medium text-ink-secondary">Recommended action:</span> {record.recommendedAction}
      </p>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onView(record.shipmentId)}
          className="rounded-md bg-accent-blue px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-blueMuted"
        >
          View Shipment
        </button>
        {secondary && !record.acknowledged && (
          <button
            onClick={() => onAcknowledge(record.shipmentId, secondary)}
            className="rounded-md border border-surface-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-secondary transition hover:border-surface-borderStrong hover:text-ink-primary"
          >
            {secondary}
          </button>
        )}
      </div>
    </div>
  );
}
