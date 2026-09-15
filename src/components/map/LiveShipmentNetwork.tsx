import { useMemo, useState } from 'react';
import type { Carrier, Shipment } from '@/types';
import { Panel, PanelHeader } from '@/components/common/Panel';
import { ShipmentMap } from './ShipmentMap';
import { ShipmentQuickInfo } from './ShipmentQuickInfo';

const LEGEND: Array<{ label: string; color: string }> = [
  { label: 'In Transit', color: '#3b82f6' },
  { label: 'Delayed', color: '#ef4444' },
  { label: 'At Risk', color: '#f59e0b' },
  { label: 'Delivered', color: '#22c55e' },
];

export function LiveShipmentNetwork({
  shipments,
  carriers,
  onViewShipment,
}: {
  shipments: Shipment[];
  carriers: Carrier[];
  onViewShipment: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const carrierMap = useMemo(() => new Map(carriers.map((c) => [c.id, c])), [carriers]);
  const selected = shipments.find((s) => s.id === selectedId) ?? null;

  return (
    <Panel padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-surface-border p-5 pb-4">
        <PanelHeader
          title="Live Shipment Network"
          subtitle="Real-time visibility into active transportation across the Kenya network"
        />
        <div className="hidden flex-shrink-0 items-center gap-3 sm:flex">
          {LEGEND.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div className="relative h-[420px] w-full sm:h-[480px]">
        <ShipmentMap shipments={shipments} selectedId={selectedId} onSelect={setSelectedId} />
        {selected && (
          <ShipmentQuickInfo
            shipment={selected}
            carrier={carrierMap.get(selected.carrierId)}
            onClose={() => setSelectedId(null)}
            onViewDetails={() => onViewShipment(selected.id)}
          />
        )}
      </div>
    </Panel>
  );
}
