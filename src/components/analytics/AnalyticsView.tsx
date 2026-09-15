import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertOctagon, Clock3, PackageCheck, TrendingUp } from 'lucide-react';
import type { Carrier, ExceptionRecord, Region, Shipment } from '@/types';
import { Panel, PanelHeader } from '@/components/common/Panel';
import { StatCard } from './StatCard';
import { ChartTooltip } from './ChartTooltip';
import { formatNumber } from '@/utils/format';

const REGIONS: Region[] = ['Nairobi', 'Coast', 'Western', 'Rift Valley'];
const AXIS_COLOR = '#6b7488';
const GRID_COLOR = '#1a2233';

function useTrendData(baseRate: number) {
  return useMemo(() => {
    const points: Array<{ day: string; rate: number }> = [];
    let rate = baseRate - (Math.random() * 4 + 2);
    for (let i = 29; i >= 0; i -= 1) {
      rate = Math.min(99, Math.max(84, rate + (Math.random() * 2.4 - 1)));
      const value = i === 0 ? baseRate : rate;
      points.push({ day: i === 0 ? 'Today' : `D-${i}`, rate: Math.round(value * 10) / 10 });
    }
    return points;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function AnalyticsView({
  shipments,
  carriers,
  exceptions,
}: {
  shipments: Shipment[];
  carriers: Carrier[];
  exceptions: ExceptionRecord[];
}) {
  const avgOnTime = carriers.reduce((sum, c) => sum + c.onTimeRate, 0) / carriers.length;
  const trend = useTrendData(avgOnTime);

  const flaggedShipments = shipments.filter((s) => s.status === 'delayed' || s.status === 'at_risk');
  const avgDelay =
    flaggedShipments.length > 0
      ? Math.round(flaggedShipments.reduce((sum, s) => sum + Math.max(0, s.delayMinutes), 0) / flaggedShipments.length)
      : 0;

  const totalShipmentsSeed = 18492;
  const exceptionRate = shipments.length > 0 ? (exceptions.length / shipments.length) * 100 : 0;

  const delayByRegion = useMemo(
    () =>
      REGIONS.map((region) => {
        const inRegion = shipments.filter((s) => s.region === region && s.status !== 'delivered');
        const avg =
          inRegion.length > 0
            ? Math.round(inRegion.reduce((sum, s) => sum + Math.max(0, s.delayMinutes), 0) / inRegion.length)
            : 0;
        return { region, delay: avg };
      }),
    [shipments],
  );

  const carrierComparison = useMemo(
    () => carriers.map((c) => ({ name: c.name.split(' ')[0], onTime: Math.round(c.onTimeRate * 10) / 10 })),
    [carriers],
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="On-Time Delivery Rate"
          value={`${avgOnTime.toFixed(1)}%`}
          subtext="30-day performance trend"
          icon={<TrendingUp size={14} />}
        />
        <StatCard label="Average Delivery Delay" value={`${avgDelay} min`} subtext="Across flagged shipments" icon={<Clock3 size={14} />} />
        <StatCard
          label="Total Shipments"
          value={formatNumber(totalShipmentsSeed)}
          subtext="Cumulative network volume"
          icon={<PackageCheck size={14} />}
        />
        <StatCard
          label="Exception Rate"
          value={`${exceptionRate.toFixed(1)}%`}
          subtext="Of currently tracked shipments"
          icon={<AlertOctagon size={14} />}
        />
      </div>

      <Panel>
        <PanelHeader title="On-Time Delivery Rate" subtitle="30-day trend across all carriers" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="day" stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={false} interval={4} />
              <YAxis
                stroke={AXIS_COLOR}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[80, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="rate"
                name="On-Time Rate"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Average Delay by Region" subtitle="Minutes of delay across active shipments" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayByRegion} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="region" stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="delay" name="Avg Delay (min)" radius={[4, 4, 0, 0]}>
                  {delayByRegion.map((entry) => (
                    <Cell key={entry.region} fill={entry.delay > 30 ? '#ef4444' : entry.delay > 12 ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="On-Time Rate by Carrier" subtitle="Live carrier reliability comparison" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carrierComparison} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="name" stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={false} domain={[75, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="onTime" name="On-Time %" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
