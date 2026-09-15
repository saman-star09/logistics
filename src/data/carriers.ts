import type { Carrier } from '@/types';

export const CARRIERS: Carrier[] = [
  {
    id: 'swifthaul',
    name: 'SwiftHaul Logistics',
    onTimeRate: 96.4,
    avgDelayMinutes: 9,
    avgTransitHours: 5.4,
    activeShipments: 214,
    delayedShipments: 6,
    deliveryVolume: 4820,
    exceptionRate: 2.1,
  },
  {
    id: 'transeast',
    name: 'TransEast',
    onTimeRate: 94.1,
    avgDelayMinutes: 14,
    avgTransitHours: 6.1,
    activeShipments: 187,
    delayedShipments: 9,
    deliveryVolume: 3960,
    exceptionRate: 3.0,
  },
  {
    id: 'cargolink',
    name: 'CargoLink',
    onTimeRate: 91.7,
    avgDelayMinutes: 21,
    avgTransitHours: 6.8,
    activeShipments: 165,
    delayedShipments: 12,
    deliveryVolume: 3410,
    exceptionRate: 4.2,
  },
  {
    id: 'rapidfreight',
    name: 'RapidFreight',
    onTimeRate: 87.3,
    avgDelayMinutes: 33,
    avgTransitHours: 7.5,
    activeShipments: 142,
    delayedShipments: 17,
    deliveryVolume: 2890,
    exceptionRate: 6.5,
  },
];

export const CARRIER_BY_ID = new Map(CARRIERS.map((c) => [c.id, c]));
