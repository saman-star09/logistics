export interface CarrierRow {
  id: string;
  name: string;
  on_time_rate: number;
  avg_delay_minutes: number;
  avg_transit_hours: number;
  active_shipments: number;
  delayed_shipments: number;
  delivery_volume: number;
  exception_rate: number;
  updated_at: string;
}

export interface ShipmentRow {
  id: string;
  origin_city_id: string;
  destination_city_id: string;
  route: string;
  region: string;
  carrier_id: string;
  status: string;
  priority: string;
  progress: number;
  position_lat: number;
  position_lng: number;
  scheduled_eta: string;
  predicted_eta: string;
  delay_minutes: number;
  last_update_seconds: number;
  current_location_label: string;
  created_at: string;
  picked_up_at: string;
  departed_at: string;
  stationary_seconds: number;
  signal_lost_seconds: number;
  updated_at: string;
}

export interface ShipmentEventRow {
  id: string;
  shipment_id: string;
  event_timestamp: string;
  label: string;
  kind: string;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  message: string;
  tone: string;
  created_at: string;
}

export interface NetworkMetricsRow {
  id: string;
  in_transit: number;
  delayed: number;
  at_risk: number;
  delivered: number;
  pending_buffer: number;
  baseline_active: number;
  baseline_in_transit: number;
  baseline_delivered: number;
  baseline_delayed: number;
  baseline_at_risk: number;
  updated_at: string;
}

export interface ExceptionAckRow {
  shipment_id: string;
  acknowledged_at: string;
  action_label: string | null;
}
