export function formatClock(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour12: false });
}

export function formatEta(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatRelativeSeconds(totalSeconds: number): string {
  if (totalSeconds < 60) return `${Math.max(1, Math.round(totalSeconds))} sec`;
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem ? `${hours}h ${rem}m` : `${hours}h`;
}

export function formatDelay(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '';
  if (Math.abs(minutes) < 60) return `${sign}${minutes} min`;
  const h = Math.trunc(minutes / 60);
  const m = Math.abs(minutes % 60);
  return `${sign}${h}h ${m}m`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatSignedPercent(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}
