import clsx from 'clsx';
import type { Carrier } from '@/types';
import { formatNumber } from '@/utils/format';

function rateTone(rate: number) {
  if (rate >= 95) return 'text-accent-green';
  if (rate >= 90) return 'text-accent-blue';
  if (rate >= 85) return 'text-accent-amber';
  return 'text-accent-red';
}

function barColor(rate: number) {
  if (rate >= 95) return 'bg-accent-green';
  if (rate >= 90) return 'bg-accent-blue';
  if (rate >= 85) return 'bg-accent-amber';
  return 'bg-accent-red';
}

export function CarrierCard({ carrier, rank }: { carrier: Carrier; rank: number }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-overlay text-sm font-bold text-ink-secondary">
            #{rank}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-primary">{carrier.name}</p>
            <p className="text-[11px] text-ink-muted">{formatNumber(carrier.deliveryVolume)} shipments delivered</p>
          </div>
        </div>
        <p className={clsx('text-xl font-bold tabular', rateTone(carrier.onTimeRate))}>
          {carrier.onTimeRate.toFixed(1)}%
        </p>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-overlay">
        <div
          className={clsx('h-full rounded-full transition-all', barColor(carrier.onTimeRate))}
          style={{ width: `${carrier.onTimeRate}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Metric label="Avg Delay" value={`${carrier.avgDelayMinutes}m`} />
        <Metric label="Avg Transit" value={`${carrier.avgTransitHours.toFixed(1)}h`} />
        <Metric label="Active" value={formatNumber(carrier.activeShipments)} />
        <Metric label="Delayed" value={formatNumber(carrier.delayedShipments)} />
        <Metric label="Exception Rate" value={`${carrier.exceptionRate.toFixed(1)}%`} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold tabular text-ink-primary">{value}</p>
      <p className="text-[10px] text-ink-muted">{label}</p>
    </div>
  );
}
