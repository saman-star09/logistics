import type { Carrier, Priority, Region, Shipment, ShipmentStatus, TimelineEvent } from '@/types';
import type { CarrierRow, ShipmentEventRow, ShipmentRow } from './database.types';

export function carrierFromRow(row: CarrierRow): Carrier {
  return {
    id: row.id,
    name: row.name,
    onTimeRate: row.on_time_rate,
    avgDelayMinutes: row.avg_delay_minutes,
    avgTransitHours: row.avg_transit_hours,
    activeShipments: row.active_shipments,
    delayedShipments: row.delayed_shipments,
    deliveryVolume: row.delivery_volume,
    exceptionRate: row.exception_rate,
  };
}

export function carrierToRow(carrier: Carrier): CarrierRow {
  return {
    id: carrier.id,
    name: carrier.name,
    on_time_rate: carrier.onTimeRate,
    avg_delay_minutes: carrier.avgDelayMinutes,
    avg_transit_hours: carrier.avgTransitHours,
    active_shipments: carrier.activeShipments,
    delayed_shipments: carrier.delayedShipments,
    delivery_volume: carrier.deliveryVolume,
    exception_rate: carrier.exceptionRate,
    updated_at: new Date().toISOString(),
  };
}

export function shipmentFromRow(row: ShipmentRow): Shipment {
  return {
    id: row.id,
    originCityId: row.origin_city_id,
    destinationCityId: row.destination_city_id,
    route: row.route,
    region: row.region as Region,
    carrierId: row.carrier_id,
    status: row.status as ShipmentStatus,
    priority: row.priority as Priority,
    progress: row.progress,
    position: { lat: row.position_lat, lng: row.position_lng },
    scheduledEta: row.scheduled_eta,
    predictedEta: row.predicted_eta,
    delayMinutes: row.delay_minutes,
    lastUpdateSeconds: row.last_update_seconds,
    currentLocationLabel: row.current_location_label,
    createdAt: row.created_at,
    pickedUpAt: row.picked_up_at,
    departedAt: row.departed_at,
    updatedAt: row.updated_at,
    stationarySeconds: row.stationary_seconds,
    signalLostSeconds: row.signal_lost_seconds,
  };
}

export function shipmentToRow(shipment: Shipment): ShipmentRow {
  return {
    id: shipment.id,
    origin_city_id: shipment.originCityId,
    destination_city_id: shipment.destinationCityId,
    route: shipment.route,
    region: shipment.region,
    carrier_id: shipment.carrierId,
    status: shipment.status,
    priority: shipment.priority,
    progress: shipment.progress,
    position_lat: shipment.position.lat,
    position_lng: shipment.position.lng,
    scheduled_eta: shipment.scheduledEta,
    predicted_eta: shipment.predictedEta,
    delay_minutes: shipment.delayMinutes,
    last_update_seconds: Math.round(shipment.lastUpdateSeconds),
    current_location_label: shipment.currentLocationLabel,
    created_at: shipment.createdAt,
    picked_up_at: shipment.pickedUpAt,
    departed_at: shipment.departedAt,
    stationary_seconds: Math.round(shipment.stationarySeconds),
    signal_lost_seconds: Math.round(shipment.signalLostSeconds),
    updated_at: new Date().toISOString(),
  };
}

export function timelineEventFromRow(row: ShipmentEventRow): TimelineEvent {
  return {
    id: row.id,
    timestamp: row.event_timestamp,
    label: row.label,
    kind: row.kind as TimelineEvent['kind'],
  };
}
