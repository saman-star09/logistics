import type { ReactNode } from 'react';
import clsx from 'clsx';
import { TrendIndicator } from '@/components/common/TrendIndicator';
import { formatNumber } from '@/utils/format';

export function MetricCard({
  label,
  value,
  trend,
  invertTrend,
  description,
  icon,
  tone = 'default',
}: {
  label: string;
  value: number;
  trend: number;
  invertTrend?: boolean;
  description: string;
  icon: ReactNode;
  tone?: 'default' | 'amber' | 'red' | 'green';
}) {
  const toneRing: Record<string, string> = {
    default: 'bg-accent-blue/10 text-accent-blue',
    amber: 'bg-accent-amber/10 text-accent-amber',
    red: 'bg-accent-red/10 text-accent-red',
    green: 'bg-accent-green/10 text-accent-green',
  };

  return (
    <div className="rounded-xl border border-surface-border bg-surface-panel p-4 shadow-panel transition-colors hover:border-surface-borderStrong">
      <div className="flex items-center justify-between">
        <div className={clsx('flex h-8 w-8 items-center justify-center rounded-md', toneRing[tone])}>{icon}</div>
        <TrendIndicator value={trend} invert={invertTrend} />
      </div>
      <p className="mt-3 text-2xl font-bold tabular text-ink-primary">{formatNumber(value)}</p>
      <p className="mt-0.5 text-xs font-medium text-ink-secondary">{label}</p>
      <p className="mt-1 text-[11px] text-ink-muted">{description}</p>
    </div>
  );
}
