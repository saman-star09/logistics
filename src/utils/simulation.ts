import type { Shipment, ShipmentStatus } from '@/types';
import { CITY_BY_ID, interpolate } from '@/data/cities';
import { currentLocationLabel } from '@/data/waypoints';
import { uid } from './random';

function statusFromSignals(stationarySeconds: number, signalLostSeconds: number, delayMinutes: number): ShipmentStatus {
  if (stationarySeconds > 20 * 60 || signalLostSeconds > 25 * 60) return 'delayed';
  if (delayMinutes > 40) return 'at_risk';
  return 'in_transit';
}

export function advanceShipment(shipment: Shipment, now: Date, tickSeconds: number): Shipment {
  if (shipment.status === 'delivered') {
    return { ...shipment, lastUpdateSeconds: shipment.lastUpdateSeconds + tickSeconds };
  }

  const origin = CITY_BY_ID.get(shipment.originCityId)!;
  const dest = CITY_BY_ID.get(shipment.destinationCityId)!;

  const gpsSilentRoll = Math.random();
  const wentSilent = shipment.signalLostSeconds > 0 ? gpsSilentRoll > 0.35 : gpsSilentRoll > 0.985;
  const signalLostSeconds = wentSilent ? shipment.signalLostSeconds + tickSeconds : 0;
  const lastUpdateSeconds = wentSilent ? shipment.lastUpdateSeconds + tickSeconds : Math.random() * 8;

  const stallRoll = Math.random();
  const isStalling = shipment.stationarySeconds > 0 ? stallRoll > 0.3 : stallRoll > 0.985;

  let progress = shipment.progress;
  let stationarySeconds = shipment.stationarySeconds;

  if (isStalling && !wentSilent) {
    stationarySeconds += tickSeconds;
  } else {
    stationarySeconds = Math.max(0, stationarySeconds - tickSeconds * 2);
    const speedFactor = 0.00028 + Math.random() * 0.00022;
    progress = Math.min(1, progress + speedFactor * tickSeconds);
  }

  const delivered = progress >= 1;
  const position = interpolate(origin.position, dest.position, delivered ? 1 : progress);
  const label = delivered ? dest.name : currentLocationLabel(origin.name, dest.name, progress, shipment.originCityId, shipment.destinationCityId);

  const scheduled = new Date(shipment.scheduledEta);
  let predictedEta = new Date(shipment.predictedEta);
  const drift = stationarySeconds > 15 * 60 ? 45 : stationarySeconds > 0 ? 15 : -10;
  predictedEta = new Date(predictedEta.getTime() + drift * 1000);
  if (predictedEta.getTime() < scheduled.getTime() && stationarySeconds === 0 && !wentSilent) {
    predictedEta = new Date(scheduled.getTime() + Math.max(0, Math.random() * 4 - 2) * 60000);
  }
  const delayMinutes = Math.round((predictedEta.getTime() - scheduled.getTime()) / 60000);

  const status: ShipmentStatus = delivered ? 'delivered' : statusFromSignals(stationarySeconds, signalLostSeconds, delayMinutes);
  const priority = delivered ? 'normal' : status === 'delayed' ? 'critical' : status === 'at_risk' ? 'high' : 'normal';

  const timeline = shipment.timeline;
  const shouldLogCheckpoint =
    !delivered && label !== shipment.currentLocationLabel && label !== `${origin.name} Depot` && timeline.length < 8;
  const shouldLogDelivered = delivered;

  const nextTimeline = shouldLogDelivered
    ? [
        ...timeline,
        { id: uid('evt'), timestamp: now.toISOString(), label: `Delivered to ${dest.name}`, kind: 'delivered' as const },
      ]
    : shouldLogCheckpoint
      ? [...timeline, { id: uid('evt'), timestamp: now.toISOString(), label: `Vehicle entered ${label}`, kind: 'checkpoint' as const }]
      : timeline;

  return {
    ...shipment,
    progress: delivered ? 1 : progress,
    position,
    currentLocationLabel: label,
    status,
    priority,
    delayMinutes,
    scheduledEta: shipment.scheduledEta,
    predictedEta: predictedEta.toISOString(),
    lastUpdateSeconds,
    signalLostSeconds,
    stationarySeconds,
    timeline: nextTimeline,
  };
}
