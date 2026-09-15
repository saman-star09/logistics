import { ShieldAlert } from 'lucide-react';
import type { ExceptionRecord } from '@/types';
import { Panel } from '@/components/common/Panel';
import { ExceptionCard } from './ExceptionCard';

export function ExceptionCenter({
  exceptions,
  onView,
  onAcknowledge,
  limit,
}: {
  exceptions: ExceptionRecord[];
  onView: (shipmentId: string) => void;
  onAcknowledge: (shipmentId: string, action: string) => void;
  limit?: number;
}) {
  const criticalCount = exceptions.filter((e) => e.severity === 'critical' && !e.acknowledged).length;
  const visible = limit ? exceptions.slice(0, limit) : exceptions;

  return (
    <Panel>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-red/10 text-accent-red">
            <ShieldAlert size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">Exception Management Center</h2>
            <p className="text-xs text-ink-muted">
              Requires intervention ·{' '}
              <span className="font-semibold text-accent-red">{criticalCount} critical exceptions</span>
            </p>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-surface-border py-10 text-center">
          <ShieldAlert size={22} className="text-ink-muted" />
          <p className="text-sm text-ink-secondary">No active exceptions</p>
          <p className="text-xs text-ink-muted">All shipments are tracking within their expected delivery windows.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((record) => (
            <ExceptionCard key={record.id} record={record} onView={onView} onAcknowledge={onAcknowledge} />
          ))}
        </div>
      )}
    </Panel>
  );
}
