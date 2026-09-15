import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { ShipmentEventRow } from '@/lib/database.types';
import { timelineEventFromRow } from '@/lib/mappers';
import type { TimelineEvent } from '@/types';

export function useShipmentTimeline(shipmentId: string | null) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    if (!shipmentId) {
      setEvents([]);
      return;
    }

    let active = true;
    supabase
      .from('shipment_events')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('event_timestamp', { ascending: true })
      .then(({ data }) => {
        if (!active || !data) return;
        setEvents((data as ShipmentEventRow[]).map(timelineEventFromRow));
      });

    const channel = supabase
      .channel(`shipment-events-${shipmentId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'shipment_events', filter: `shipment_id=eq.${shipmentId}` },
        (payload) => {
          const event = timelineEventFromRow(payload.new as ShipmentEventRow);
          setEvents((prev) => (prev.some((e) => e.id === event.id) ? prev : [...prev, event]));
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [shipmentId]);

  return events;
}
