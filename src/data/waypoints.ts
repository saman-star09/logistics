const WAYPOINTS: Record<string, string[]> = {
  'nairobi-mombasa': ['Mlolongo', 'Sultan Hamud', 'Emali', 'Mtito Andei', 'Voi', 'Mariakani'],
  'mombasa-nairobi': ['Mariakani', 'Voi', 'Mtito Andei', 'Emali', 'Sultan Hamud', 'Mlolongo'],
  'nairobi-kisumu': ['Nakuru', 'Kericho', 'Muhoroni'],
  'kisumu-nairobi': ['Muhoroni', 'Kericho', 'Nakuru'],
  'nairobi-eldoret': ['Naivasha', 'Nakuru', 'Timboroa'],
  'eldoret-nairobi': ['Timboroa', 'Nakuru', 'Naivasha'],
  'nakuru-nairobi': ['Naivasha', 'Limuru'],
  'nairobi-nakuru': ['Limuru', 'Naivasha'],
  'nairobi-voi': ['Mlolongo', 'Emali', 'Mtito Andei'],
  'mombasa-voi': ['Mariakani', 'Mackinnon Road'],
  'nairobi-naivasha': ['Kikuyu', 'Limuru'],
  'naivasha-nakuru': ['Gilgil'],
  'kericho-kisumu': ['Kapsoit', 'Ahero'],
  'nairobi-kericho': ['Naivasha', 'Nakuru', 'Kedowa'],
  'eldoret-kakamega': ['Turbo', 'Webuye'],
  'nairobi-machakos': ['Athi River'],
  'thika-nairobi': ['Ruiru'],
  'nairobi-malindi': ['Mlolongo', 'Voi', 'Mariakani', 'Kilifi'],
};

export function waypointsFor(originId: string, destId: string): string[] {
  return WAYPOINTS[`${originId}-${destId}`] ?? [];
}

export function currentLocationLabel(
  originName: string,
  destName: string,
  progress: number,
  originId: string,
  destId: string,
): string {
  if (progress <= 0.06) return `${originName} Depot`;
  if (progress >= 0.94) return `Approaching ${destName}`;
  const stops = waypointsFor(originId, destId);
  if (stops.length === 0) return 'En route';
  const idx = Math.min(stops.length - 1, Math.floor(progress * stops.length));
  return stops[idx];
}
