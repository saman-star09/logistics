interface TooltipPayloadItem {
  name: string;
  value: number | string;
  color?: string;
}

export function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-md border border-surface-borderStrong bg-surface-overlay px-3 py-2 text-xs shadow-floating">
      {label && <p className="mb-1 font-medium text-ink-primary">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="text-ink-secondary">
          <span style={{ color: p.color }}>●</span> {p.name}: <span className="font-semibold text-ink-primary">{p.value}</span>
        </p>
      ))}
    </div>
  );
}
