import { ArrowDown, ArrowUp } from 'lucide-react';
import clsx from 'clsx';

export function TrendIndicator({ value, invert = false }: { value: number; invert?: boolean }) {
  const isUp = value >= 0;
  const isGood = invert ? !isUp : isUp;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-0.5 text-xs font-medium tabular',
        isGood ? 'text-accent-green' : 'text-accent-red',
      )}
    >
      {isUp ? <ArrowUp size={12} strokeWidth={2.5} /> : <ArrowDown size={12} strokeWidth={2.5} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}
