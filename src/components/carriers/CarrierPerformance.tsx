import type { Carrier } from '@/types';
import { Panel, PanelHeader } from '@/components/common/Panel';
import { CarrierCard } from './CarrierCard';

export function CarrierPerformance({ carriers }: { carriers: Carrier[] }) {
  const sorted = [...carriers].sort((a, b) => b.onTimeRate - a.onTimeRate);

  return (
    <Panel>
      <PanelHeader title="Carrier Performance" subtitle="Comparing transportation partners across the network" />
      <div className="space-y-3">
        {sorted.map((carrier, i) => (
          <CarrierCard key={carrier.id} carrier={carrier} rank={i + 1} />
        ))}
      </div>
    </Panel>
  );
}
