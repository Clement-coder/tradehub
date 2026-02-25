# TradeHub

TradeHub is a modern BTC/USD trading simulator built with Next.js.
It combines Privy authentication, live BTC pricing, and a polished trading UI for practicing spot trading workflows.

## What It Does

- Auth with Privy (Google or email) and embedded wallet support
- Live BTC price feed via CoinGecko (polled every 10 seconds)
- Simulated BTC buy/sell flow with open positions and close actions
- Portfolio, trade history, wallet, profile, and settings pages
- Optional Supabase persistence for users, positions, trades, and transactions
- Notification center for account and price-alert events

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Privy (`@privy-io/react-auth`, `@privy-io/wagmi`)
- Wagmi (Base + Base Sepolia chain config)
- React Query
- Supabase JS
- Recharts + Framer Motion

## Project Structure

- `front-end/app` - routes, layouts, and providers
- `front-end/app/context` - trading and notifications state
- `front-end/components` - trading UI components and shared UI
- `front-end/lib` - Supabase client/service layer and BTC price hook
- `front-end/public` - logos and static assets

## Prerequisites

- Node.js 18+
- npm

## Quick Start

```bash
cd front-end
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Set these in `front-end/.env`:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Notes:
- Privy auth requires `NEXT_PUBLIC_PRIVY_APP_ID`.
- Supabase is optional; when not configured, the app falls back to local/in-memory behavior for core trading state.

## Available Scripts

Run from `front-end/`:

- `npm run dev` - start development server
- `npm run build` - create production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Current Scope

- The app is currently a **simulation/training interface** for BTC trading flows.
- UI and state management are production-style, but trade execution is simulated.