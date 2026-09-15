import type { City } from '@/types';

export const CITIES: City[] = [
  { id: 'nairobi', name: 'Nairobi', region: 'Nairobi', position: { lat: -1.2921, lng: 36.8219 } },
  { id: 'thika', name: 'Thika', region: 'Nairobi', position: { lat: -1.0332, lng: 37.0692 } },
  { id: 'machakos', name: 'Machakos', region: 'Nairobi', position: { lat: -1.5177, lng: 37.2634 } },
  { id: 'mombasa', name: 'Mombasa', region: 'Coast', position: { lat: -4.0435, lng: 39.6682 } },
  { id: 'mariakani', name: 'Mariakani', region: 'Coast', position: { lat: -3.8595, lng: 39.4788 } },
  { id: 'voi', name: 'Voi', region: 'Coast', position: { lat: -3.396, lng: 38.556 } },
  { id: 'malindi', name: 'Malindi', region: 'Coast', position: { lat: -3.2192, lng: 40.1169 } },
  { id: 'kisumu', name: 'Kisumu', region: 'Western', position: { lat: -0.0917, lng: 34.768 } },
  { id: 'kericho', name: 'Kericho', region: 'Western', position: { lat: -0.3676, lng: 35.2831 } },
  { id: 'kakamega', name: 'Kakamega', region: 'Western', position: { lat: 0.2827, lng: 34.7519 } },
  { id: 'nakuru', name: 'Nakuru', region: 'Rift Valley', position: { lat: -0.3031, lng: 36.08 } },
  { id: 'eldoret', name: 'Eldoret', region: 'Rift Valley', position: { lat: 0.5143, lng: 35.2698 } },
  { id: 'naivasha', name: 'Naivasha', region: 'Rift Valley', position: { lat: -0.7167, lng: 36.4333 } },
  { id: 'nyahururu', name: 'Nyahururu', region: 'Rift Valley', position: { lat: 0.037, lng: 36.3628 } },
];

export const CITY_BY_ID = new Map(CITIES.map((c) => [c.id, c]));

export const TRADE_LANES: Array<[string, string]> = [
  ['nairobi', 'mombasa'],
  ['mombasa', 'nairobi'],
  ['nakuru', 'nairobi'],
  ['nairobi', 'kisumu'],
  ['nairobi', 'eldoret'],
  ['eldoret', 'nairobi'],
  ['mombasa', 'nairobi'],
  ['nairobi', 'nakuru'],
  ['kisumu', 'nairobi'],
  ['nairobi', 'malindi'],
  ['thika', 'nairobi'],
  ['nairobi', 'machakos'],
  ['nakuru', 'kisumu'],
  ['eldoret', 'kakamega'],
  ['nairobi', 'voi'],
  ['mombasa', 'voi'],
  ['nairobi', 'naivasha'],
  ['naivasha', 'nakuru'],
  ['kericho', 'kisumu'],
  ['nairobi', 'kericho'],
];

const PADDING_DEG = 0.55;

export const MAP_BOUNDS = {
  minLat: Math.min(...CITIES.map((c) => c.position.lat)) - PADDING_DEG,
  maxLat: Math.max(...CITIES.map((c) => c.position.lat)) + PADDING_DEG,
  minLng: Math.min(...CITIES.map((c) => c.position.lng)) - PADDING_DEG,
  maxLng: Math.max(...CITIES.map((c) => c.position.lng)) + PADDING_DEG,
};

export function project(lat: number, lng: number, width: number, height: number) {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * width;
  const y = height - ((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * height;
  return { x, y };
}

export function interpolate(a: { lat: number; lng: number }, b: { lat: number; lng: number }, t: number) {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}
