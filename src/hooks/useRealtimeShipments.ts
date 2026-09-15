import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Carrier, NotificationItem, OverviewMetrics, Shipment, TimelineEvent } from '@/types';
import { createShipment, respawnShipment } from '@/data/shipmentFactory';
import { advanceShipment } from '@/utils/simulation';
import { deriveExceptions } from '@/utils/exceptions';
import { CARRIERS } from '@/data/carriers';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import type { CarrierRow, ExceptionAckRow, NetworkMetricsRow, NotificationRow, ShipmentRow } from '@/lib/database.types';
import { carrierFromRow, carrierToRow, shipmentFromRow, shipmentToRow } from '@/lib/mappers';

const POOL_SIZE = 60;
const TICK_MS = 4000;
const MAX_NOTIFICATIONS = 30;

const METRIC_SEEDS = {
  active: 1284,
  inTransit: 847,
  delivered: 401,
  delayed: 36,
  atRisk: 18,
};

type Metrics = {
  inTransit: number;
  delayed: number;
  atRisk: number;
  delivered: number;
  pendingBuffer: number;
};

type Baseline = {
  active: number;
  inTransit: number;
  delivered: number;
  delayed: number;
  atRisk: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

async function ensureCarriers(): Promise<Carrier[]> {
  const { data } = await supabase.from('carriers').select('*');
  if (data && data.length > 0) return (data as CarrierRow[]).map(carrierFromRow);
  await supabase.from('carriers').insert(CARRIERS.map(carrierToRow));
  return CARRIERS;
}

async function ensureShipments(now: Date): Promise<Shipment[]> {
  const { data } = await supabase.from('shipments').select('*');
  if (data && data.length > 0) return (data as ShipmentRow[]).map(shipmentFromRow);

  const created = Array.from({ length: POOL_SIZE }, () => createShipment({ now }));
  const shipments = created.map((c) => c.shipment);
  const events = created.flatMap((c) =>
    c.events.map((e) => ({ shipment_id: c.shipment.id, event_timestamp: e.timestamp, label: e.label, kind: e.kind })),
  );

  await supabase.from('shipments').insert(shipments.map(shipmentToRow));
  await supabase.from('shipment_events').insert(events);
  return shipments;
}

async function ensureNetworkMetrics(): Promise<{ metrics: Metrics; baseline: Baseline }> {
  const { data } = await supabase.from('network_metrics').select('*').eq('id', 'global').maybeSingle();
  if (data) {
    const row = data as NetworkMetricsRow;
    return {
      metrics: {
        inTransit: row.in_transit,
        delayed: row.delayed,
        atRisk: row.at_risk,
        delivered: row.delivered,
        pendingBuffer: row.pending_buffer,
      },
      baseline: {
        active: row.baseline_active,
        inTransit: row.baseline_in_transit,
        delivered: row.baseline_delivered,
        delayed: row.baseline_delayed,
        atRisk: row.baseline_at_risk,
      },
    };
  }

  const metrics: Metrics = {
    inTransit: METRIC_SEEDS.inTransit,
    delayed: METRIC_SEEDS.delayed,
    atRisk: METRIC_SEEDS.atRisk,
    delivered: METRIC_SEEDS.delivered,
    pendingBuffer: METRIC_SEEDS.active - METRIC_SEEDS.inTransit - METRIC_SEEDS.delayed - METRIC_SEEDS.atRisk,
  };
  const baseline: Baseline = {
    active: METRIC_SEEDS.active * (0.93 + Math.random() * 0.1),
    inTransit: METRIC_SEEDS.inTransit * (0.93 + Math.random() * 0.1),
    delivered: METRIC_SEEDS.delivered * (0.88 + Math.random() * 0.12),
    delayed: METRIC_SEEDS.delayed * (0.85 + Math.random() * 0.2),
    atRisk: METRIC_SEEDS.atRisk * (0.8 + Math.random() * 0.25),
  };

  await supabase.from('network_metrics').insert({
    id: 'global',
    in_transit: metrics.inTransit,
    delayed: metrics.delayed,
    at_risk: metrics.atRisk,
    delivered: metrics.delivered,
    pending_buffer: metrics.pendingBuffer,
    baseline_active: baseline.active,
    baseline_in_transit: baseline.inTransit,
    baseline_delivered: baseline.delivered,
    baseline_delayed: baseline.delayed,
    baseline_at_risk: baseline.atRisk,
  });

  return { metrics, baseline };
}

export function useRealtimeShipments() {
  const [ready, setReady] = useState(false);
  const [configError, setConfigError] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const [lastSyncedAt, setLastSyncedAt] = useState(new Date());
  const [carriers, setCarriers] = useState<Carrier[]>(CARRIERS);
  const [metricsSnapshot, setMetricsSnapshot] = useState<Metrics>({
    inTransit: METRIC_SEEDS.inTransit,
    delayed: METRIC_SEEDS.delayed,
    atRisk: METRIC_SEEDS.atRisk,
    delivered: METRIC_SEEDS.delivered,
    pendingBuffer: METRIC_SEEDS.active - METRIC_SEEDS.inTransit - METRIC_SEEDS.delayed - METRIC_SEEDS.atRisk,
  });

  const shipmentsRef = useRef<Shipment[]>([]);
  const carriersRef = useRef<Carrier[]>(CARRIERS);
  const metricsRef = useRef<Metrics>(metricsSnapshot);
  const baselineRef = useRef<Baseline>({
    active: METRIC_SEEDS.active,
    inTransit: METRIC_SEEDS.inTransit,
    delivered: METRIC_SEEDS.delivered,
    delayed: METRIC_SEEDS.delayed,
    atRisk: METRIC_SEEDS.atRisk,
  });
  const [baselineVersion, setBaselineVersion] = useState(0);

  useEffect(() => {
    shipmentsRef.current = shipments;
  }, [shipments]);

  useEffect(() => {
    carriersRef.current = carriers;
  }, [carriers]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setConfigError(true);
      return;
    }

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;

    (async () => {
      const now = new Date();
      const [carrierRows, shipmentRows, metricsResult] = await Promise.all([
        ensureCarriers(),
        ensureShipments(now),
        ensureNetworkMetrics(),
      ]);
      const [{ data: notificationRows }, { data: ackRows }] = await Promise.all([
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(MAX_NOTIFICATIONS),
        supabase.from('exception_acks').select('*'),
      ]);

      if (cancelled) return;

      setCarriers(carrierRows);
      carriersRef.current = carrierRows;
      setShipments(shipmentRows);
      shipmentsRef.current = shipmentRows;
      metricsRef.current = metricsResult.metrics;
      baselineRef.current = metricsResult.baseline;
      setMetricsSnapshot(metricsResult.metrics);
      setBaselineVersion((v) => v + 1);
      setNotifications(
        ((notificationRows as NotificationRow[] | null) ?? []).map((row) => ({
          id: row.id,
          message: row.message,
          timestamp: row.created_at,
          read: true,
          tone: row.tone as NotificationItem['tone'],
        })),
      );
      setAcknowledged(new Set(((ackRows as ExceptionAckRow[] | null) ?? []).map((row) => row.shipment_id)));
      setReady(true);

      channel = supabase
        .channel('logistics-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, (payload) => {
          if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as ShipmentRow).id;
            setShipments((prev) => prev.filter((s) => s.id !== oldId));
            return;
          }
          const incoming = shipmentFromRow(payload.new as ShipmentRow);
          setShipments((prev) => {
            const idx = prev.findIndex((s) => s.id === incoming.id);
            if (idx === -1) return [...prev, incoming];
            const next = [...prev];
            next[idx] = incoming;
            return next;
          });
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
          const row = payload.new as NotificationRow;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === row.id)) return prev;
            const item: NotificationItem = {
              id: row.id,
              message: row.message,
              timestamp: row.created_at,
              read: false,
              tone: row.tone as NotificationItem['tone'],
            };
            return [item, ...prev].slice(0, MAX_NOTIFICATIONS);
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'network_metrics' }, (payload) => {
          const row = payload.new as NetworkMetricsRow;
          const next: Metrics = {
            inTransit: row.in_transit,
            delayed: row.delayed,
            atRisk: row.at_risk,
            delivered: row.delivered,
            pendingBuffer: row.pending_buffer,
          };
          metricsRef.current = next;
          setMetricsSnapshot(next);
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'exception_acks' }, (payload) => {
          const row = payload.new as ExceptionAckRow;
          setAcknowledged((prev) => new Set(prev).add(row.shipment_id));
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'carriers' }, (payload) => {
          const incoming = carrierFromRow(payload.new as CarrierRow);
          setCarriers((prev) => prev.map((c) => (c.id === incoming.id ? incoming : c)));
        })
        .subscribe();

      interval = setInterval(() => {
        void runTick();
      }, TICK_MS);
    })();

    async function runTick() {
      const tickNow = new Date();
      const tickSeconds = TICK_MS / 1000;
      const prev = shipmentsRef.current;

      let deliveredCount = 0;
      let newDelayed = 0;
      let newAtRisk = 0;
      let recovered = 0;
      let respawned = 0;

      const newEvents: Array<{ shipment_id: string; event_timestamp: string; label: string; kind: TimelineEvent['kind'] }> = [];
      const respawnedIds: string[] = [];
      const notificationRows: Array<{ message: string; tone: NotificationItem['tone'] }> = [];

      const next = prev.map((shipment) => {
        const wasStatus = shipment.status;
        const { shipment: advanced, newEvent } = advanceShipment(shipment, tickNow, tickSeconds);

        if (newEvent) newEvents.push({ shipment_id: advanced.id, event_timestamp: newEvent.timestamp, label: newEvent.label, kind: newEvent.kind });

        if (advanced.status === 'delivered' && wasStatus !== 'delivered') {
          deliveredCount += 1;
          notificationRows.push({ message: `Shipment ${advanced.id} delivered to ${advanced.currentLocationLabel}`, tone: 'success' });
        }
        if (advanced.status === 'delayed' && wasStatus !== 'delayed') {
          newDelayed += 1;
          notificationRows.push({ message: `Shipment ${advanced.id} flagged: delivery delay on ${advanced.route}`, tone: 'critical' });
        }
        if (advanced.status === 'at_risk' && wasStatus !== 'at_risk') {
          newAtRisk += 1;
          notificationRows.push({ message: `Shipment ${advanced.id} at risk of missing scheduled ETA`, tone: 'warning' });
        }
        if ((wasStatus === 'delayed' || wasStatus === 'at_risk') && advanced.status === 'in_transit') {
          recovered += 1;
        }

        if (advanced.status === 'delivered' && wasStatus === 'delivered' && Math.random() > 0.7) {
          respawned += 1;
          const { shipment: fresh, events } = respawnShipment(tickNow);
          const reused: Shipment = { ...fresh, id: shipment.id };
          respawnedIds.push(shipment.id);
          events.forEach((e) => newEvents.push({ shipment_id: shipment.id, event_timestamp: e.timestamp, label: e.label, kind: e.kind }));
          return reused;
        }

        return advanced;
      });

      const m = { ...metricsRef.current };
      m.delivered += deliveredCount + (Math.random() > 0.55 ? 1 : 0);
      m.inTransit = clamp(
        m.inTransit - deliveredCount - newDelayed - newAtRisk + recovered + respawned + Math.round(Math.random() * 2 - 1),
        METRIC_SEEDS.inTransit * 0.85,
        METRIC_SEEDS.inTransit * 1.15,
      );
      m.delayed = clamp(m.delayed + newDelayed - Math.round(recovered * 0.5) + Math.round(Math.random() * 2 - 1), 20, 70);
      m.atRisk = clamp(m.atRisk + newAtRisk - Math.round(recovered * 0.5) + Math.round(Math.random() * 2 - 1), 8, 40);
      m.pendingBuffer = clamp(
        m.pendingBuffer + Math.round(Math.random() * 4 - 2),
        METRIC_SEEDS.active * 0.25,
        METRIC_SEEDS.active * 0.4,
      );
      metricsRef.current = m;

      setShipments(next);
      setMetricsSnapshot(m);
      setLastSyncedAt(tickNow);

      const jitteredCarriers = carriersRef.current.map((c) => ({
        ...c,
        onTimeRate: clamp(c.onTimeRate + (Math.random() * 0.4 - 0.2), c.onTimeRate - 2, c.onTimeRate + 2),
        activeShipments: Math.max(0, c.activeShipments + Math.round(Math.random() * 4 - 2)),
      }));
      setCarriers(jitteredCarriers);

      await Promise.all([
        supabase.from('shipments').upsert(next.map(shipmentToRow)),
        newEvents.length > 0 ? supabase.from('shipment_events').insert(newEvents) : Promise.resolve(),
        respawnedIds.length > 0
          ? supabase.from('shipment_events').delete().in('shipment_id', respawnedIds).lt('created_at', tickNow.toISOString())
          : Promise.resolve(),
        notificationRows.length > 0 ? supabase.from('notifications').insert(notificationRows.map((n) => ({ message: n.message, tone: n.tone }))) : Promise.resolve(),
        supabase.from('network_metrics').upsert({
          id: 'global',
          in_transit: m.inTransit,
          delayed: m.delayed,
          at_risk: m.atRisk,
          delivered: m.delivered,
          pending_buffer: m.pendingBuffer,
          baseline_active: baselineRef.current.active,
          baseline_in_transit: baselineRef.current.inTransit,
          baseline_delivered: baselineRef.current.delivered,
          baseline_delayed: baselineRef.current.delayed,
          baseline_at_risk: baselineRef.current.atRisk,
        }),
        supabase.from('carriers').upsert(jitteredCarriers.map(carrierToRow)),
      ]);
    }

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const overview: OverviewMetrics = useMemo(() => {
    const m = metricsSnapshot;
    const active = Math.round(m.inTransit + m.delayed + m.atRisk + m.pendingBuffer);
    const y = baselineRef.current;
    const pct = (current: number, base: number) => ((current - base) / base) * 100;
    return {
      activeShipments: active,
      activeTrend: pct(active, y.active),
      inTransit: Math.round(m.inTransit),
      inTransitTrend: pct(m.inTransit, y.inTransit),
      deliveredToday: Math.round(m.delivered),
      deliveredTrend: pct(m.delivered, y.delivered),
      delayed: Math.round(m.delayed),
      delayedTrend: pct(m.delayed, y.delayed),
      atRisk: Math.round(m.atRisk),
      atRiskTrend: pct(m.atRisk, y.atRisk),
    };
    // baselineVersion forces a recompute once baselineRef.current is populated from Supabase;
    // eslint can't see the ref read above, so it misflags this as unnecessary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metricsSnapshot, baselineVersion]);

  const exceptions = useMemo(() => deriveExceptions(shipments, acknowledged), [shipments, acknowledged]);

  const acknowledgeException = useCallback((shipmentId: string, actionLabel: string) => {
    setAcknowledged((prev) => new Set(prev).add(shipmentId));
    void supabase.from('exception_acks').upsert({ shipment_id: shipmentId, action_label: actionLabel });
    void supabase.from('notifications').insert({ message: `${actionLabel} — ${shipmentId}`, tone: 'info' });
  }, []);

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return {
    ready,
    configError,
    shipments,
    exceptions,
    overview,
    carriers,
    notifications,
    lastSyncedAt,
    acknowledgeException,
    markNotificationsRead,
  };
}
