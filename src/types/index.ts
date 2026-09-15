export type ShipmentStatus = 'in_transit' | 'delayed' | 'at_risk' | 'delivered';

export type Priority = 'critical' | 'high' | 'normal';

export type Region = 'Nairobi' | 'Coast' | 'Western' | 'Rift Valley';

export type ExceptionType = 'delivery_delay' | 'eta_risk' | 'signal_lost';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface City {
  id: string;
  name: string;
  region: Region;
  position: GeoPoint;
}

export interface Carrier {
  id: string;
  name: string;
  onTimeRate: number;
  avgDelayMinutes: number;
  avgTransitHours: number;
  activeShipments: number;
  delayedShipments: number;
  deliveryVolume: number;
  exceptionRate: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  label: string;
  kind: 'created' | 'pickup' | 'departed' | 'checkpoint' | 'updated' | 'delivered' | 'exception';
}

export interface Shipment {
  id: string;
  originCityId: string;
  destinationCityId: string;
  route: string;
  region: Region;
  carrierId: string;
  status: ShipmentStatus;
  priority: Priority;
  progress: number;
  position: GeoPoint;
  scheduledEta: string;
  predictedEta: string;
  delayMinutes: number;
  lastUpdateSeconds: number;
  currentLocationLabel: string;
  createdAt: string;
  pickedUpAt: string;
  departedAt: string;
  updatedAt: string;
  stationarySeconds: number;
  signalLostSeconds: number;
}

export interface ExceptionRecord {
  id: string;
  shipmentId: string;
  type: ExceptionType;
  severity: 'critical' | 'high';
  title: string;
  description: string;
  recommendedAction: string;
  route: string;
  carrierName: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface NotificationItem {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  tone: 'info' | 'warning' | 'critical' | 'success';
}

export interface OverviewMetrics {
  activeShipments: number;
  activeTrend: number;
  inTransit: number;
  inTransitTrend: number;
  deliveredToday: number;
  deliveredTrend: number;
  delayed: number;
  delayedTrend: number;
  atRisk: number;
  atRiskTrend: number;
}

export type StatusFilter = 'all' | ShipmentStatus;
export type PriorityFilter = 'all' | Priority;
export type RegionFilter = 'all' | Region;
export type TimeFilter = 'today' | '7days' | 'custom';
