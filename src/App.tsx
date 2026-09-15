import { useMemo, useState } from 'react';
import { Truck } from 'lucide-react';
import { Header, type ViewKey } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { OverviewMetrics } from '@/components/overview/OverviewMetrics';
import { LiveShipmentNetwork } from '@/components/map/LiveShipmentNetwork';
import { ExceptionCenter } from '@/components/exceptions/ExceptionCenter';
import { ShipmentsView } from '@/components/shipments/ShipmentsView';
import { ShipmentDetailPanel } from '@/components/shipments/ShipmentDetailPanel';
import { CarrierPerformance } from '@/components/carriers/CarrierPerformance';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { useRealtimeShipments } from '@/hooks/useRealtimeShipments';

function App() {
  const [view, setView] = useState<ViewKey>('overview');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    ready,
    shipments,
    exceptions,
    overview,
    carriers,
    notifications,
    lastSyncedAt,
    acknowledgeException,
    markNotificationsRead,
  } = useRealtimeShipments();

  const carrierMap = useMemo(() => new Map(carriers.map((c) => [c.id, c])), [carriers]);
  const selectedShipment = shipments.find((s) => s.id === selectedId) ?? null;
  const criticalExceptionCount = exceptions.filter((e) => e.severity === 'critical' && !e.acknowledged).length;

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-base">
        <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-lg bg-accent-blue">
          <Truck size={22} className="text-white" strokeWidth={2.25} />
        </div>
        <p className="text-sm text-ink-secondary">Connecting to live network…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-base">
      <Header
        activeView={view}
        onNavigate={setView}
        lastSyncedAt={lastSyncedAt}
        notifications={notifications}
        onOpenNotifications={markNotificationsRead}
        exceptionCount={criticalExceptionCount}
      />

      <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-5 px-6 py-6">
        {view === 'overview' && (
          <>
            <OverviewMetrics metrics={overview} />
            <LiveShipmentNetwork shipments={shipments} carriers={carriers} onViewShipment={setSelectedId} />
            <ExceptionCenter
              exceptions={exceptions}
              onView={setSelectedId}
              onAcknowledge={acknowledgeException}
              limit={4}
            />
          </>
        )}

        {view === 'shipments' && (
          <ShipmentsView shipments={shipments} carriers={carriers} onSelect={setSelectedId} />
        )}

        {view === 'exceptions' && (
          <ExceptionCenter exceptions={exceptions} onView={setSelectedId} onAcknowledge={acknowledgeException} />
        )}

        {view === 'carriers' && <CarrierPerformance carriers={carriers} />}

        {view === 'analytics' && (
          <AnalyticsView shipments={shipments} carriers={carriers} exceptions={exceptions} />
        )}
      </main>

      <Footer />

      <ShipmentDetailPanel
        shipment={selectedShipment}
        carrier={selectedShipment ? carrierMap.get(selectedShipment.carrierId) : undefined}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

export default App;
