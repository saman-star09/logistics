# Meridian Freight Network — Real-Time Logistics Operations Center

A high-fidelity logistics operations dashboard concept built as a portfolio piece, inspired by real-world third-party logistics (3PL) workflows. It gives coordinators, dispatchers, and operations managers a single command center to monitor shipments, spot delivery risk, and act on transportation exceptions.

> Independent concept inspired by real-world 3PL operations. "Meridian Freight Network" is a fictional company invented for this project — it is not affiliated with, endorsed by, or built for any real carrier or logistics company.

## What it does

- **Overview** — network-wide KPIs (active shipments, in transit, delivered today, delayed, at risk) with day-over-day trend indicators.
- **Live Shipment Network** — a stylized map of the Kenyan road network with animated shipment markers, color-coded by status, that move and update live.
- **Exception Management Center** — shipments are automatically classified into exceptions (delivery delay, ETA risk, signal lost) based on live telemetry, ranked by severity, with recommended actions and acknowledgeable interventions.
- **Shipment Management** — a searchable, filterable, paginated table of every tracked shipment (status, carrier, region, priority, time).
- **Shipment Detail Panel** — a drawer with delivery progress steps, current location/ETA/delay, and a full activity timeline.
- **Carrier Performance** — on-time rate, average delay, transit time, volume, and exception rate per carrier.
- **Analytics** — 30-day on-time trend, delay-by-region, and carrier comparison charts.

## Real-time architecture (backed by Supabase)

There's no live GPS or carrier feed to plug into, so this prototype's browser tab plays the role of the "Carrier/GPS Data" source in the spec's architecture diagram — but everything downstream of that is a real Supabase project, not mock local state:

- **Postgres tables** (`carriers`, `shipments`, `shipment_events`, `notifications`, `network_metrics`, `exception_acks`) hold all operational state. Row Level Security is enabled on every table.
- **Supabase Realtime** is enabled on `shipments`, `notifications`, `network_metrics`, and `exception_acks`. The app subscribes via `postgres_changes` (`src/hooks/useRealtimeShipments.ts`), so any change — from this tab, another tab, or the Supabase SQL editor — is broadcast to every connected client and reflected live without a page refresh.
- **The simulation tick** (`src/utils/simulation.ts`) still runs client-side every 4s: it advances each shipment along its route, occasionally stalls it or drops GPS signal, drifts its predicted ETA, and derives exceptions (`src/utils/exceptions.ts`) from the result. The computed batch is written to Supabase via a single `upsert`; the UI updates optimistically and then reconciles via the Realtime echo.
- **First load seeds the database**: if `shipments`/`carriers`/`network_metrics` are empty, the app generates the initial pool (`src/data/shipmentFactory.ts`) and inserts it once. After that, state is fully persisted — refreshing the page (or opening it in a second tab) picks up exactly where the network left off.
- **Shipment history** (`shipment_events`) is fetched and subscribed to lazily, only for the shipment currently open in the detail drawer (`src/hooks/useShipmentTimeline.ts`), rather than loaded for every row in the table.
- **Exception acknowledgement** (`exception_acks`) and **notifications** are persisted rows, not local component state — so "Contact Dispatcher" actions and the notification feed are shared across every coordinator viewing the dashboard, not just your own browser tab.

### ⚠️ Security tradeoff (read before deploying anywhere public)

This is a demo with no authentication layer, so RLS policies grant the `anon` key both read **and write** access to every operational table (see the `create_logistics_schema` migration). That's what lets the browser itself act as the simulator. It's a reasonable simplification for a local/portfolio demo, but it means anyone with the anon key (which ships in the frontend bundle, as designed) could write to these tables. **Before deploying this publicly with real stakes**, move the simulation tick into a server-side Edge Function or scheduled job authenticated with the service role key, and restrict the `anon` policies to `SELECT` only.

### Environment variables

```bash
cp .env.example .env
# then fill in:
# VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
# VITE_SUPABASE_ANON_KEY=<your publishable/anon key>
```

Both values are Supabase's public/publishable credentials (safe to expose in a frontend bundle) — not secrets like a service role key.

## Tech stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** for the enterprise control-center visual language (deep navy/charcoal, blue/green/amber/red status colors, thin borders, subtle motion)
- **Supabase** (Postgres + Realtime) for persistence and live updates
- **Recharts** for analytics visualizations
- **lucide-react** for icons

## Getting started

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL + anon key
npm run dev             # start the dev server — first load seeds the database
npm run build           # type-check and build for production
```

## Deploying to GitHub Pages

A workflow at `.github/workflows/deploy.yml` builds and publishes `dist/` on every push to `main` (or via "Run workflow" in the Actions tab). One-time setup: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.

Two things that make a Vite SPA go blank on Pages if missed, both already handled here:

- **Asset paths**: `vite.config.ts` sets `base: './'` so built asset URLs are relative — Pages serves project sites from `/<repo-name>/`, and Vite's default root-relative paths (`/assets/...`) 404 there.
- **Env vars at build time**: Pages is a static host with no server-side env injection, so `VITE_*` variables must already be present when `npm run build` runs. `.env.production` is committed with the project's Supabase URL and anon/publishable key — those are meant to be public (they ship in every Supabase frontend bundle regardless), unlike a service role key, which should never be committed. If they're ever missing, the app now shows an on-screen "Supabase is not configured" message instead of a silent blank page.

## Project structure

```
src/
  types/            Shared domain types (Shipment, Carrier, ExceptionRecord, ...)
  data/             City/route/carrier reference data + shipment factory
  utils/            Formatting, exception detection, and the tick-based simulation step
  lib/              Supabase client, DB row types, and row <-> domain-type mappers
  hooks/            useRealtimeShipments (Supabase-backed live state), useShipmentTimeline, useShipmentFilters
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
