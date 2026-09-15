import type { ReactNode } from 'react';

export function StatCard({ label, value, subtext, icon }: { label: string; value: string; subtext: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-panel p-4 shadow-panel">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-ink-secondary">{label}</p>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-blue/10 text-accent-blue">
          {icon}
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold tabular text-ink-primary">{value}</p>
      <p className="mt-1 text-[11px] text-ink-muted">{subtext}</p>
    </div>
  );
}
