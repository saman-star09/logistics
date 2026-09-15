import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Carrier, Shipment } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { formatEta, formatRelativeSeconds } from '@/utils/format';

const PAGE_SIZE = 10;

export function ShipmentTable({
  shipments,
  carriers,
  onSelect,
}: {
  shipments: Shipment[];
  carriers: Carrier[];
  onSelect: (id: string) => void;
}) {
  const carrierMap = new Map(carriers.map((c) => [c.id, c]));
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(shipments.length / PAGE_SIZE));

  useEffect(() => {
    setPage(0);
  }, [shipments.length]);

  const pageItems = shipments.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-surface-border">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-raised text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 font-medium">Shipment</th>
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Carrier</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">ETA</th>
              <th className="px-4 py-3 font-medium">Last Update</th>
              <th className="px-4 py-3 font-medium">Priority</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((s) => (
              <tr
                key={s.id}
                onClick={() => onSelect(s.id)}
                className="cursor-pointer border-b border-surface-border/60 transition-colors last:border-0 hover:bg-surface-raised"
              >
                <td className="px-4 py-3 font-mono text-xs font-semibold text-ink-primary">{s.id}</td>
                <td className="px-4 py-3 text-ink-secondary">{s.route}</td>
                <td className="px-4 py-3 text-ink-secondary">{carrierMap.get(s.carrierId)?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-4 py-3 font-mono text-xs tabular text-ink-secondary">
                  {formatEta(new Date(s.status === 'delayed' || s.status === 'at_risk' ? s.predictedEta : s.scheduledEta))}
                </td>
                <td className="px-4 py-3 text-xs tabular text-ink-muted">
                  {formatRelativeSeconds(s.lastUpdateSeconds)}
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={s.priority} />
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-muted">
                  No shipments match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {shipments.length > 0 && (
        <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
          <p>
            Showing {page * PAGE_SIZE + 1}–{Math.min(shipments.length, page * PAGE_SIZE + PAGE_SIZE)} of{' '}
            {shipments.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-surface-border disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="tabular">
              {page + 1} / {pageCount}
            </span>
            <button
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-surface-border disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
