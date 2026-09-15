import type { ExceptionRecord, ExceptionType, Shipment } from '@/types';
import { CARRIER_BY_ID } from '@/data/carriers';

const STATIONARY_THRESHOLD_SEC = 20 * 60;
const SIGNAL_LOST_THRESHOLD_SEC = 25 * 60;
const ETA_RISK_THRESHOLD_MIN = 40;

export interface DetectionResult {
  type: ExceptionType | null;
  severity: 'critical' | 'high' | null;
}

export function detectException(shipment: Pick<Shipment, 'stationarySeconds' | 'signalLostSeconds' | 'delayMinutes'>): DetectionResult {
  if (shipment.stationarySeconds > STATIONARY_THRESHOLD_SEC) {
    return { type: 'delivery_delay', severity: 'critical' };
  }
  if (shipment.signalLostSeconds > SIGNAL_LOST_THRESHOLD_SEC) {
    return { type: 'signal_lost', severity: 'critical' };
  }
  if (shipment.delayMinutes > ETA_RISK_THRESHOLD_MIN) {
    return { type: 'eta_risk', severity: 'high' };
  }
  return { type: null, severity: null };
}

const ACTION_COPY: Record<ExceptionType, string> = {
  delivery_delay: 'Investigate shipment status.',
  eta_risk: 'Review route and carrier status.',
  signal_lost: 'Contact carrier.',
};

const TITLE_COPY: Record<ExceptionType, string> = {
  delivery_delay: 'Delivery Delay',
  eta_risk: 'ETA Risk',
  signal_lost: 'Location Signal Lost',
};

function descriptionFor(shipment: Shipment, type: ExceptionType): string {
  if (type === 'delivery_delay') {
    return `Vehicle has remained stationary for approximately ${Math.round(shipment.stationarySeconds / 60)} minutes.`;
  }
  if (type === 'signal_lost') {
    return `No location update received for ${Math.round(shipment.signalLostSeconds / 60)} minutes.`;
  }
  const scheduled = new Date(shipment.scheduledEta);
  const predicted = new Date(shipment.predictedEta);
  const diffMin = Math.round((predicted.getTime() - scheduled.getTime()) / 60000);
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  const diffLabel = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return `Current predicted arrival is ${diffLabel} later than the scheduled delivery window.`;
}

export function deriveExceptions(shipments: Shipment[], acknowledged: Set<string>): ExceptionRecord[] {
  const records: ExceptionRecord[] = [];
  for (const shipment of shipments) {
    if (shipment.status === 'delivered') continue;
    const { type, severity } = detectException(shipment);
    if (!type || !severity) continue;
    const carrier = CARRIER_BY_ID.get(shipment.carrierId);
    records.push({
      id: `${shipment.id}-${type}`,
      shipmentId: shipment.id,
      type,
      severity,
      title: TITLE_COPY[type],
      description: descriptionFor(shipment, type),
      recommendedAction: ACTION_COPY[type],
      route: shipment.route,
      carrierName: carrier?.name ?? 'Unknown Carrier',
      createdAt: shipment.updatedAt,
      acknowledged: acknowledged.has(shipment.id),
    });
  }
  return records.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'critical' ? -1 : 1;
    if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}
