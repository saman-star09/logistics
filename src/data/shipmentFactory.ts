import type { Priority, Shipment, ShipmentStatus, TimelineEvent } from '@/types';
import { CITY_BY_ID, TRADE_LANES, interpolate } from './cities';
import { CARRIERS } from './carriers';
import { currentLocationLabel } from './waypoints';
import { pick } from '@/utils/random';

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function priorityForStatus(status: ShipmentStatus): Priority {
  if (status === 'delayed') return 'critical';
  if (status === 'at_risk') return 'high';
  return 'normal';
}

let counter = 48000 + Math.floor(Math.random() * 400);

function nextShipmentId(): string {
  counter += 1;
  return `DHL-${counter}`;
}

type NewTimelineEvent = Omit<TimelineEvent, 'id'>;

function buildTimeline(createdAt: Date, pickedUpAt: Date, departedAt: Date, checkpoint?: string): NewTimelineEvent[] {
  const events: NewTimelineEvent[] = [
    { timestamp: createdAt.toISOString(), label: 'Shipment created', kind: 'created' },
    { timestamp: pickedUpAt.toISOString(), label: 'Shipment picked up', kind: 'pickup' },
    { timestamp: departedAt.toISOString(), label: 'Shipment departed origin', kind: 'departed' },
  ];
  if (checkpoint) {
    const checkpointAt = new Date(departedAt.getTime() + 30 * 60 * 1000);
    events.push({
      timestamp: checkpointAt.toISOString(),
      label: `Vehicle entered ${checkpoint}`,
      kind: 'checkpoint',
    });
  }
  return events;
}

interface CreateOptions {
  now: Date;
  status?: ShipmentStatus;
  progress?: number;
}

export interface CreatedShipment {
  shipment: Shipment;
  events: NewTimelineEvent[];
}

export function createShipment(options: CreateOptions): CreatedShipment {
  const { now } = options;
  const [originId, destId] = pick(TRADE_LANES);
  const origin = CITY_BY_ID.get(originId)!;
  const dest = CITY_BY_ID.get(destId)!;
  const carrier = pick(CARRIERS);

  const distanceKm = haversineKm(origin.position, dest.position);
  const avgSpeedKmh = 42;
  const baseTransitMinutes = Math.max(60, Math.round((distanceKm / avgSpeedKmh) * 60));
  const transitVarianceFactor = 0.9 + Math.random() * 0.3;
  const totalTransitMinutes = Math.round(baseTransitMinutes * transitVarianceFactor);

  const status: ShipmentStatus = options.status ?? weightedStatus();
  let progress = options.progress ?? Math.random() * 0.85 + 0.03;
  if (status === 'delivered') progress = 1;

  const elapsedMinutes = Math.round(totalTransitMinutes * progress);
  const departedAt = new Date(now.getTime() - elapsedMinutes * 60 * 1000);
  const pickedUpAt = new Date(departedAt.getTime() - (15 + Math.random() * 25) * 60 * 1000);
  const createdAt = new Date(pickedUpAt.getTime() - (20 + Math.random() * 40) * 60 * 1000);
  const scheduledEta = new Date(departedAt.getTime() + totalTransitMinutes * 60 * 1000);

  let delayMinutes = 0;
  if (status === 'delayed') delayMinutes = 25 + Math.floor(Math.random() * 55);
  if (status === 'at_risk') delayMinutes = 45 + Math.floor(Math.random() * 60);
  const predictedEta = new Date(scheduledEta.getTime() + delayMinutes * 60 * 1000);

  const position = interpolate(origin.position, dest.position, status === 'delivered' ? 1 : progress);
  const label = currentLocationLabel(origin.name, dest.name, progress, originId, destId);

  const stationarySeconds = status === 'delayed' ? 40 * 60 + Math.floor(Math.random() * 20 * 60) : Math.floor(Math.random() * 40);
  const signalLostSeconds = status === 'at_risk' && Math.random() > 0.5 ? 30 * 60 + Math.floor(Math.random() * 15 * 60) : 0;

  const id = nextShipmentId();

  return {
    shipment: {
      id,
      originCityId: originId,
      destinationCityId: destId,
      route: `${origin.name} → ${dest.name}`,
      region: dest.region,
      carrierId: carrier.id,
      status,
      priority: priorityForStatus(status),
      progress: status === 'delivered' ? 1 : progress,
      position,
      scheduledEta: scheduledEta.toISOString(),
      predictedEta: predictedEta.toISOString(),
      delayMinutes,
      lastUpdateSeconds: Math.floor(Math.random() * 20),
      currentLocationLabel: status === 'delivered' ? dest.name : label,
      createdAt: createdAt.toISOString(),
      pickedUpAt: pickedUpAt.toISOString(),
      departedAt: departedAt.toISOString(),
      updatedAt: now.toISOString(),
      stationarySeconds,
      signalLostSeconds,
    },
    events: buildTimeline(createdAt, pickedUpAt, departedAt, label !== `${origin.name} Depot` ? label : undefined),
  };
}

function weightedStatus(): ShipmentStatus {
  const r = Math.random();
  if (r < 0.62) return 'in_transit';
  if (r < 0.72) return 'delayed';
  if (r < 0.78) return 'at_risk';
  return 'delivered';
}

export function respawnShipment(now: Date): CreatedShipment {
  return createShipment({ now, status: weightedStatus(), progress: 0.02 + Math.random() * 0.08 });
}
