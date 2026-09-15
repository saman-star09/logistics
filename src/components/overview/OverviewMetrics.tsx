import { Activity, AlertTriangle, CheckCircle2, Clock, Truck } from 'lucide-react';
import type { OverviewMetrics as OverviewMetricsType } from '@/types';
import { MetricCard } from './MetricCard';

export function OverviewMetrics({ metrics }: { metrics: OverviewMetricsType }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <MetricCard
        label="Active Shipments"
        value={metrics.activeShipments}
        trend={metrics.activeTrend}
        description="Currently moving through the network"
        icon={<Activity size={16} />}
      />
      <MetricCard
        label="In Transit"
        value={metrics.inTransit}
        trend={metrics.inTransitTrend}
        description="Shipments currently being transported"
        icon={<Truck size={16} />}
      />
      <MetricCard
        label="Delivered Today"
        value={metrics.deliveredToday}
        trend={metrics.deliveredTrend}
        description="Successfully completed deliveries"
        icon={<CheckCircle2 size={16} />}
        tone="green"
      />
      <MetricCard
        label="Delayed"
        value={metrics.delayed}
        trend={metrics.delayedTrend}
        invertTrend
        description="Outside expected delivery window"
        icon={<Clock size={16} />}
        tone="red"
      />
      <MetricCard
        label="At Risk"
        value={metrics.atRisk}
        trend={metrics.atRiskTrend}
        invertTrend
        description="Predicted to miss scheduled ETA"
        icon={<AlertTriangle size={16} />}
        tone="amber"
      />
    </div>
  );
}
