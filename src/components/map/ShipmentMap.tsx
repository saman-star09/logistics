import { useMemo } from 'react';
import type { Shipment } from '@/types';
import { CITIES, project, TRADE_LANES, CITY_BY_ID } from '@/data/cities';

const WIDTH = 760;
const HEIGHT = 630;

const MAJOR_CITIES = new Set(['nairobi', 'mombasa', 'kisumu', 'eldoret', 'nakuru']);

const MARKER_STYLE: Record<Shipment['status'], { fill: string; r: number; pulse: boolean }> = {
  in_transit: { fill: '#3b82f6', r: 3.2, pulse: false },
  at_risk: { fill: '#f59e0b', r: 5, pulse: true },
  delayed: { fill: '#ef4444', r: 5.5, pulse: true },
  delivered: { fill: '#22c55e', r: 4, pulse: false },
};

export function ShipmentMap({
  shipments,
  selectedId,
  onSelect,
}: {
  shipments: Shipment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const grid = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let x = 0; x <= WIDTH; x += 76) lines.push({ x1: x, y1: 0, x2: x, y2: HEIGHT });
    for (let y = 0; y <= HEIGHT; y += 70) lines.push({ x1: 0, y1: y, x2: WIDTH, y2: y });
    return lines;
  }, []);

  const laneLines = useMemo(() => {
    const seen = new Set<string>();
    const lines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (const [originId, destId] of TRADE_LANES) {
      const key = [originId, destId].sort().join('-');
      if (seen.has(key)) continue;
      seen.add(key);
      const origin = CITY_BY_ID.get(originId)!;
      const dest = CITY_BY_ID.get(destId)!;
      const p1 = project(origin.position.lat, origin.position.lng, WIDTH, HEIGHT);
      const p2 = project(dest.position.lat, dest.position.lng, WIDTH, HEIGHT);
      lines.push({ key, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
    }
    return lines;
  }, []);

  const sortedShipments = useMemo(
    () =>
      [...shipments].sort((a, b) => {
        const rank = (s: Shipment) => (s.status === 'delayed' ? 3 : s.status === 'at_risk' ? 2 : s.status === 'delivered' ? 0 : 1);
        return rank(a) - rank(b);
      }),
    [shipments],
  );

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" role="img" aria-label="Live shipment map of Kenya">
      <defs>
        <radialGradient id="mapGlow" cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#132038" />
          <stop offset="100%" stopColor="#0a0e17" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="url(#mapGlow)" rx={12} />
      <g stroke="#1a2233" strokeWidth={1}>
        {grid.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
        ))}
      </g>

      <g stroke="#2a3450" strokeWidth={1.25} strokeDasharray="1 5" strokeLinecap="round">
        {laneLines.map((l) => (
          <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
        ))}
      </g>

      <g>
        {CITIES.map((city) => {
          const p = project(city.position.lat, city.position.lng, WIDTH, HEIGHT);
          const major = MAJOR_CITIES.has(city.id);
          return (
            <g key={city.id} transform={`translate(${p.x}, ${p.y})`}>
              <circle r={major ? 3 : 2} fill="#4b5670" />
              {major && (
                <text x={7} y={4} fontSize={11} fontWeight={600} fill="#a3aec4" className="select-none">
                  {city.name}
                </text>
              )}
            </g>
          );
        })}
      </g>

      <g>
        {sortedShipments.map((shipment) => {
          const p = project(shipment.position.lat, shipment.position.lng, WIDTH, HEIGHT);
          const style = MARKER_STYLE[shipment.status];
          const isSelected = shipment.id === selectedId;
          return (
            <g
              key={shipment.id}
              transform={`translate(${p.x}, ${p.y})`}
              onClick={() => onSelect(shipment.id)}
              className="cursor-pointer"
            >
              <title>{`${shipment.id} · ${shipment.route} · ${shipment.currentLocationLabel}`}</title>
              <circle r={12} fill="transparent" />
              {style.pulse && (
                <circle r={style.r} fill={style.fill} opacity={0.5} className="origin-center animate-markerPing" />
              )}
              {isSelected && (
                <circle r={style.r + 5} fill="none" stroke={style.fill} strokeWidth={1.5} opacity={0.9} />
              )}
              <circle r={style.r} fill={style.fill} stroke="#0a0e17" strokeWidth={1.2} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
