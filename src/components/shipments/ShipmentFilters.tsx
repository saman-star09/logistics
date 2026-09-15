import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import clsx from 'clsx';
import type { Carrier, PriorityFilter, RegionFilter, StatusFilter, TimeFilter } from '@/types';

const STATUS_OPTIONS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delayed', label: 'Delayed' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'at_risk', label: 'At Risk' },
];

const REGION_OPTIONS: Array<{ key: RegionFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'Nairobi', label: 'Nairobi' },
  { key: 'Coast', label: 'Coast' },
  { key: 'Western', label: 'Western' },
  { key: 'Rift Valley', label: 'Rift Valley' },
];

const PRIORITY_OPTIONS: Array<{ key: PriorityFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'high', label: 'High' },
  { key: 'normal', label: 'Normal' },
];

const TIME_OPTIONS: Array<{ key: TimeFilter; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: '7days', label: 'Last 7 Days' },
  { key: 'custom', label: 'Custom' },
];

function Pills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ key: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={clsx(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            value === opt.key
              ? 'bg-accent-blue text-white'
              : 'bg-surface-raised text-ink-secondary hover:text-ink-primary',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function ShipmentFilters({
  carriers,
  query,
  onQuery,
  status,
  onStatus,
  carrierId,
  onCarrier,
  region,
  onRegion,
  priority,
  onPriority,
  time,
  onTime,
}: {
  carriers: Carrier[];
  query: string;
  onQuery: (v: string) => void;
  status: StatusFilter;
  onStatus: (v: StatusFilter) => void;
  carrierId: string;
  onCarrier: (v: string) => void;
  region: RegionFilter;
  onRegion: (v: RegionFilter) => void;
  priority: PriorityFilter;
  onPriority: (v: PriorityFilter) => void;
  time: TimeFilter;
  onTime: (v: TimeFilter) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search shipment ID, carrier, route or destination..."
          className="w-full rounded-md border border-surface-border bg-surface-raised py-2 pl-9 pr-3 text-sm text-ink-primary placeholder:text-ink-muted focus:border-accent-blue focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:gap-6">
        <FilterGroup label="Status">
          <Pills options={STATUS_OPTIONS} value={status} onChange={onStatus} />
        </FilterGroup>
        <FilterGroup label="Carrier">
          <select
            value={carrierId}
            onChange={(e) => onCarrier(e.target.value)}
            className="rounded-md border border-surface-border bg-surface-raised px-2.5 py-1 text-xs font-medium text-ink-secondary focus:border-accent-blue focus:outline-none"
          >
            <option value="all">All Carriers</option>
            {carriers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FilterGroup>
        <FilterGroup label="Region">
          <Pills options={REGION_OPTIONS} value={region} onChange={onRegion} />
        </FilterGroup>
        <FilterGroup label="Priority">
          <Pills options={PRIORITY_OPTIONS} value={priority} onChange={onPriority} />
        </FilterGroup>
        <FilterGroup label="Time">
          <Pills options={TIME_OPTIONS} value={time} onChange={onTime} />
        </FilterGroup>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      {children}
    </div>
  );
}
