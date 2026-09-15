# DHL Supply Chain — Real-Time Logistics Operations Center

A high-fidelity logistics operations dashboard concept built as a portfolio piece, inspired by real-world third-party logistics (3PL) workflows. It gives coordinators, dispatchers, and operations managers a single command center to monitor shipments, spot delivery risk, and act on transportation exceptions.

> Portfolio concept/prototype inspired by 3PL operations workflows. Not an official DHL product.

## What it does

- **Overview** — network-wide KPIs (active shipments, in transit, delivered today, delayed, at risk) with day-over-day trend indicators.
- **Live Shipment Network** — a stylized map of the Kenyan road network with animated shipment markers, color-coded by status, that move and update live.
- **Exception Management Center** — shipments are automatically classified into exceptions (delivery delay, ETA risk, signal lost) based on live telemetry, ranked by severity, with recommended actions and acknowledgeable interventions.
- **Shipment Management** — a searchable, filterable, paginated table of every tracked shipment (status, carrier, region, priority, time).
- **Shipment Detail Panel** — a drawer with delivery progress steps, current location/ETA/delay, and a full activity timeline.
- **Carrier Performance** — on-time rate, average delay, transit time, volume, and exception rate per carrier.
- **Analytics** — 30-day on-time trend, delay-by-region, and carrier comparison charts.

## Real-time simulation engine

There's no live GPS or carrier feed behind this prototype, so the "real-time" layer is a self-contained simulation engine (`src/hooks/useRealtimeShipments.ts`) built to behave like one:

- A pool of ~100 shipments is generated across real Kenyan trade lanes (Nairobi ↔ Mombasa, Nairobi ↔ Kisumu, Nakuru ↔ Eldoret, etc.) with realistic transit times derived from great-circle distance.
- Every tick (`src/utils/simulation.ts`), each shipment advances along its route, occasionally stalls (simulating traffic/breakdowns) or drops GPS signal, and its predicted ETA drifts accordingly.
- Exceptions are *derived*, not scripted: a shipment becomes `delayed` when it's been stationary too long, `at_risk` when its predicted delay crosses a threshold, and flagged as signal-lost when GPS pings stop (`src/utils/exceptions.ts`). The Exception Center, table, and map all read from the same live shipment state, so the numbers never disagree with each other.
- Delivered shipments cycle back into new shipments so the network stays busy indefinitely, and network-wide KPIs random-walk around realistic seed values while reacting to real events in the pool (a delivery bumps "Delivered Today", a stall creates a new exception, etc.).

This architecture is intentionally the same shape a real integration would take — swap `useRealtimeShipments` for a hook backed by Supabase Realtime subscriptions over a PostgreSQL `shipments` table, and the rest of the UI (map, table, exception center, detail drawer) needs no changes.

## Tech stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** for the enterprise control-center visual language (deep navy/charcoal, blue/green/amber/red status colors, thin borders, subtle motion)
- **Recharts** for analytics visualizations
- **lucide-react** for icons

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
```

## Project structure

```
src/
  types/            Shared domain types (Shipment, Carrier, ExceptionRecord, ...)
  data/             City/route/carrier reference data + shipment factory
  utils/            Formatting, exception detection, and the tick-based simulation step
  hooks/            useRealtimeShipments (the simulation engine), useShipmentFilters
  components/
    layout/         Header, nav, notification center
    overview/       KPI metric cards
    map/            Live shipment map + quick-info overlay
    exceptions/     Exception center + cards
    shipments/       Table, filters, detail drawer, activity timeline
    carriers/       Carrier performance cards
    analytics/      Charts and summary stats
    common/         Status/priority badges, live indicator, panel primitives
```
