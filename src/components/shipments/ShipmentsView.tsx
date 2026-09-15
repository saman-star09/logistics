import type { Carrier, Shipment } from '@/types';
import { Panel, PanelHeader } from '@/components/common/Panel';
import { useShipmentFilters } from '@/hooks/useShipmentFilters';
import { ShipmentFilters } from './ShipmentFilters';
import { ShipmentTable } from './ShipmentTable';

export function ShipmentsView({
  shipments,
  carriers,
  onSelect,
}: {
  shipments: Shipment[];
  carriers: Carrier[];
  onSelect: (id: string) => void;
}) {
  const f = useShipmentFilters(shipments);

  return (
    <Panel>
      <PanelHeader
        title="Shipment Management"
        subtitle={`${f.filtered.length} of ${shipments.length} shipments matching current filters`}
      />
      <div className="mb-5">
        <ShipmentFilters
          carriers={carriers}
          query={f.query}
          onQuery={f.setQuery}
          status={f.status}
          onStatus={f.setStatus}
          carrierId={f.carrierId}
          onCarrier={f.setCarrierId}
          region={f.region}
          onRegion={f.setRegion}
          priority={f.priority}
          onPriority={f.setPriority}
          time={f.time}
          onTime={f.setTime}
        />
      </div>
      <ShipmentTable shipments={f.filtered} carriers={carriers} onSelect={onSelect} />
    </Panel>
  );
}
