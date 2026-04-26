# BDS OS V2 — Frontend

Next.js 16 frontend for BDS OS, a continuous evidence-based operating system for mid-market companies ($1M-$100M).

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Auth & Database:** Supabase (SSR client via `@supabase/ssr`)
- **Data Fetching:** TanStack React Query v5
- **UI Primitives:** Radix UI (Accordion, Slider, Progress, Tooltip, etc.)
- **Styling:** Tailwind CSS v4
- **Types:** Shared with backend via `@bds/types/*` path aliases

## Getting Started

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

## Project Structure

```
web/
  app/
    (protected)/          # Auth-gated routes
      assess/             # 82-practice assessment with dual sliders
      opi/                # Operational Priority Index
      portfolio/          # Focus portfolio (WIP-limited)
      execute/            # 7-column Kanban board
      govern/             # Governance reports (3 views)
      settings/           # Organization profile
    auth/                 # Login, signup, OAuth callback
  lib/
    hooks/                # React Query hooks for all data domains
    supabase/             # Supabase client (browser, server, middleware)
    edge-functions.ts     # Typed wrappers for Supabase edge functions
    providers.tsx         # React Query provider
    utils.ts              # cn(), formatNumber(), formatDate()
  types/                  # Re-exports from @bds/types/*
  components/             # Shared components (sidebar)
```

## Deployment

Deploy to Vercel with the Supabase environment variables configured. The `web/` directory is the build root.
