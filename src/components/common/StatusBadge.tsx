import clsx from 'clsx';
import type { ShipmentStatus } from '@/types';

const STATUS_CONFIG: Record<ShipmentStatus, { label: string; dot: string; text: string; bg: string }> = {
  in_transit: { label: 'In Transit', dot: 'bg-accent-blue', text: 'text-accent-blue', bg: 'bg-accent-blue/10' },
  delayed: { label: 'Delayed', dot: 'bg-accent-red', text: 'text-accent-red', bg: 'bg-accent-red/10' },
  at_risk: { label: 'At Risk', dot: 'bg-accent-amber', text: 'text-accent-amber', bg: 'bg-accent-amber/10' },
  delivered: { label: 'Delivered', dot: 'bg-accent-green', text: 'text-accent-green', bg: 'bg-accent-green/10' },
};

export function StatusBadge({ status, className }: { status: ShipmentStatus; className?: string }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap',
        cfg.bg,
        cfg.text,
        className,
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export function statusMeta(status: ShipmentStatus) {
  return STATUS_CONFIG[status];
}
