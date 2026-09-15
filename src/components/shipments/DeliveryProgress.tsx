import { useMemo } from 'react';
import clsx from 'clsx';
import type { Shipment } from '@/types';
import { CITY_BY_ID } from '@/data/cities';

type StepState = 'done' | 'current' | 'warning' | 'pending';

export function DeliveryProgress({ shipment }: { shipment: Shipment }) {
  const steps = useMemo(() => {
    const origin = CITY_BY_ID.get(shipment.originCityId)!;
    const dest = CITY_BY_ID.get(shipment.destinationCityId)!;
    const delivered = shipment.status === 'delivered';
    const flagged = shipment.status === 'delayed' || shipment.status === 'at_risk';

    const list: Array<{ label: string; state: StepState }> = [
      { label: 'Pickup', state: 'done' },
      { label: origin.name, state: 'done' },
    ];

    if (!delivered && shipment.currentLocationLabel !== `${origin.name} Depot` && shipment.currentLocationLabel !== dest.name) {
      list.push({ label: shipment.currentLocationLabel, state: flagged ? 'warning' : 'current' });
    }

    list.push({ label: dest.name, state: delivered ? 'done' : 'pending' });
    return list;
  }, [shipment]);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {steps.map((step, i) => (
        <div key={`${step.label}-${i}`} className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 rounded-md border border-surface-border bg-surface-raised px-2.5 py-1.5">
            <StepIcon state={step.state} />
            <span
              className={clsx(
                'text-xs font-medium',
                step.state === 'pending' ? 'text-ink-muted' : 'text-ink-secondary',
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && <span className="text-ink-muted">→</span>}
        </div>
      ))}
    </div>
  );
}

function StepIcon({ state }: { state: StepState }) {
  if (state === 'done') return <span className="text-accent-green">✓</span>;
  if (state === 'warning') return <span className="text-accent-amber">⚠</span>;
  if (state === 'current') return <span className="h-2 w-2 rounded-full bg-accent-blue animate-pulseDot" />;
  return <span className="text-ink-muted">○</span>;
}
