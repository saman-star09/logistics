import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NotificationItem, OverviewMetrics, Shipment } from '@/types';
import { createShipment, respawnShipment } from '@/data/shipmentFactory';
import { advanceShipment } from '@/utils/simulation';
import { deriveExceptions } from '@/utils/exceptions';
import { CARRIERS } from '@/data/carriers';
import { uid } from '@/utils/random';

const POOL_SIZE = 96;
const TICK_MS = 3000;
const MAX_NOTIFICATIONS = 30;

const METRIC_SEEDS = {
  active: 1284,
  inTransit: 847,
  delivered: 401,
  delayed: 36,
  atRisk: 18,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function useRealtimeShipments() {
  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const now = new Date();
    return Array.from({ length: POOL_SIZE }, () => createShipment({ now }));
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const [lastSyncedAt, setLastSyncedAt] = useState(new Date());
  const [carriers, setCarriers] = useState(CARRIERS);

  const metricsRef = useRef({
    inTransit: METRIC_SEEDS.inTransit,
    delayed: METRIC_SEEDS.delayed,
    atRisk: METRIC_SEEDS.atRisk,
    delivered: METRIC_SEEDS.delivered,
    pendingBuffer: METRIC_SEEDS.active - METRIC_SEEDS.inTransit - METRIC_SEEDS.delayed - METRIC_SEEDS.atRisk,
  });
  const yesterdayRef = useRef({
    active: METRIC_SEEDS.active * (0.93 + Math.random() * 0.1),
    inTransit: METRIC_SEEDS.inTransit * (0.93 + Math.random() * 0.1),
    delivered: METRIC_SEEDS.delivered * (0.88 + Math.random() * 0.12),
    delayed: METRIC_SEEDS.delayed * (0.85 + Math.random() * 0.2),
    atRisk: METRIC_SEEDS.atRisk * (0.8 + Math.random() * 0.25),
  });

  const [metricsSnapshot, setMetricsSnapshot] = useState(() => ({ ...metricsRef.current }));
  const tickCountRef = useRef(0);

  const pushNotification = useCallback((message: string, tone: NotificationItem['tone']) => {
    setNotifications((prev) => {
      const next: NotificationItem = { id: uid('ntf'), message, timestamp: new Date().toISOString(), read: false, tone };
      return [next, ...prev].slice(0, MAX_NOTIFICATIONS);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tickCountRef.current += 1;
      const tickSeconds = TICK_MS / 1000;

      setShipments((prev) => {
        let deliveredCount = 0;
        let newDelayed = 0;
        let newAtRisk = 0;
        let recovered = 0;
        let respawned = 0;

        const next = prev.map((shipment) => {
          const wasStatus = shipment.status;
          const advanced = advanceShipment(shipment, now, tickSeconds);

          if (advanced.status === 'delivered' && wasStatus !== 'delivered') {
            deliveredCount += 1;
            pushNotification(`Shipment ${advanced.id} delivered to ${advanced.currentLocationLabel}`, 'success');
          }
          if (advanced.status === 'delayed' && wasStatus !== 'delayed') {
            newDelayed += 1;
            pushNotification(`Shipment ${advanced.id} flagged: delivery delay on ${advanced.route}`, 'critical');
          }
          if (advanced.status === 'at_risk' && wasStatus !== 'at_risk') {
            newAtRisk += 1;
            pushNotification(`Shipment ${advanced.id} at risk of missing scheduled ETA`, 'warning');
          }
          if ((wasStatus === 'delayed' || wasStatus === 'at_risk') && advanced.status === 'in_transit') {
            recovered += 1;
          }

          if (advanced.status === 'delivered' && wasStatus === 'delivered') {
            const deliveredForTicks = tickCountRef.current;
            if (deliveredForTicks % 1 === 0 && Math.random() > 0.7) {
              respawned += 1;
              return respawnShipment(now);
            }
          }

          return advanced;
        });

        const m = metricsRef.current;
        m.delivered += deliveredCount + (Math.random() > 0.55 ? 1 : 0);
        m.inTransit = clamp(
          m.inTransit - deliveredCount - newDelayed - newAtRisk + recovered + respawned + Math.round(Math.random() * 2 - 1),
          METRIC_SEEDS.inTransit * 0.85,
          METRIC_SEEDS.inTransit * 1.15,
        );
        m.delayed = clamp(m.delayed + newDelayed - Math.round(recovered * 0.5) + Math.round(Math.random() * 2 - 1), 20, 70);
        m.atRisk = clamp(m.atRisk + newAtRisk - Math.round(recovered * 0.5) + Math.round(Math.random() * 2 - 1), 8, 40);
        m.pendingBuffer = clamp(m.pendingBuffer + Math.round(Math.random() * 4 - 2), METRIC_SEEDS.active * 0.25, METRIC_SEEDS.active * 0.4);
        setMetricsSnapshot({ ...m });

        return next;
      });

      setLastSyncedAt(now);

      setCarriers((prev) =>
        prev.map((c) => ({
          ...c,
          onTimeRate: clamp(c.onTimeRate + (Math.random() * 0.4 - 0.2), c.onTimeRate - 2, c.onTimeRate + 2),
          activeShipments: Math.max(0, c.activeShipments + Math.round(Math.random() * 4 - 2)),
        })),
      );
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [pushNotification]);

  const overview: OverviewMetrics = useMemo(() => {
    const m = metricsSnapshot;
    const active = Math.round(m.inTransit + m.delayed + m.atRisk + m.pendingBuffer);
    const y = yesterdayRef.current;
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
  }, [metricsSnapshot]);

  const exceptions = useMemo(() => deriveExceptions(shipments, acknowledged), [shipments, acknowledged]);

  const acknowledgeException = useCallback(
    (shipmentId: string, actionLabel: string) => {
      setAcknowledged((prev) => new Set(prev).add(shipmentId));
      pushNotification(`${actionLabel} — ${shipmentId}`, 'info');
    },
    [pushNotification],
  );

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return {
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
