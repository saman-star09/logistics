import { useMemo, useState } from 'react';
import type { PriorityFilter, RegionFilter, Shipment, StatusFilter, TimeFilter } from '@/types';
import { CARRIER_BY_ID } from '@/data/carriers';

export function useShipmentFilters(shipments: Shipment[]) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [carrierId, setCarrierId] = useState<string>('all');
  const [region, setRegion] = useState<RegionFilter>('all');
  const [priority, setPriority] = useState<PriorityFilter>('all');
  const [time, setTime] = useState<TimeFilter>('today');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shipments.filter((s) => {
      if (status !== 'all' && s.status !== status) return false;
      if (carrierId !== 'all' && s.carrierId !== carrierId) return false;
      if (region !== 'all' && s.region !== region) return false;
      if (priority !== 'all' && s.priority !== priority) return false;
      if (q) {
        const carrierName = CARRIER_BY_ID.get(s.carrierId)?.name.toLowerCase() ?? '';
        const haystack = `${s.id} ${carrierName} ${s.route}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [shipments, query, status, carrierId, region, priority]);

  return {
    filtered,
    query,
    setQuery,
    status,
    setStatus,
    carrierId,
    setCarrierId,
    region,
    setRegion,
    priority,
    setPriority,
    time,
    setTime,
  };
}
