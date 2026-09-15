import clsx from 'clsx';
import type { Priority } from '@/types';

const PRIORITY_CONFIG: Record<Priority, { label: string; text: string; bg: string; border: string }> = {
  critical: { label: 'Critical', text: 'text-accent-red', bg: 'bg-accent-red/10', border: 'border-accent-red/30' },
  high: { label: 'High', text: 'text-accent-amber', bg: 'bg-accent-amber/10', border: 'border-accent-amber/30' },
  normal: { label: 'Normal', text: 'text-ink-secondary', bg: 'bg-surface-overlay', border: 'border-surface-border' },
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        cfg.bg,
        cfg.text,
        cfg.border,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}
