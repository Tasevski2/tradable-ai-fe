# TradableAI Frontend

**AI-powered trading platform that turns natural language into executable trading strategies.**

Build strategies through conversation with AI, backtest against historical data, visualize strategy logic as flow diagrams, and execute live trades on Bybit — all from a single interface.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)

> **Note:** This project was built under a tight deadline. Active refactoring and improvements are in progress.

---

## Demo

[**Watch the full demo video**](https://drive.google.com/file/d/13YHMCBVg5gYImXzRA9JZily7zC4tvuoo/view?usp=sharing)

---

## Features

### AI Strategy Builder

Chat with AI to describe your trading strategy in plain English. The AI translates your intent into a structured, executable strategy configuration — no coding required.

### Real-Time Trading Charts

Professional candlestick charts powered by KlineCharts with a custom Bybit datafeed adapter. Live market data streams via WebSocket with automatic reconnection and heartbeat management.

### Strategy Flow Visualization

Every strategy is rendered as an interactive node-based flow diagram using ReactFlow with Dagre auto-layout. Visualize indicator nodes, condition nodes, logical gates, and signal outputs.

### Backtesting Engine

Run historical performance analysis with detailed metrics — PnL, win rate, profit factor, max drawdown, equity curves, and individual trade breakdowns. Equity curves rendered with Lightweight Charts.

### Live Trading Execution

Deploy strategies to trade Bybit perpetual markets (BTCUSDT, DOGEUSDT, and more). Monitor open positions, view order history, and close positions with a press-and-hold confirmation button.

### Real-Time Streaming

- **SSE (Server-Sent Events)** for position updates, backtest completion, and AI chat token streaming
- **WebSocket** for live Bybit kline data feeding the trading chart

---

## Tech Stack

| Category               | Technologies                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------- |
| **Core**               | Next.js 16.1 (App Router), React 19, TypeScript 5 (strict mode), Tailwind CSS v4        |
| **State Management**   | Zustand 5 (auth state), React Query 5 (server state with centralized query key factory) |
| **Authentication**     | Privy (email-only auth, JWT tokens)                                                     |
| **Charts**             | KlineCharts 9 / @klinecharts/pro (candlesticks), Lightweight Charts 4 (equity curves)   |
| **Visualization**      | ReactFlow 11 + Dagre (strategy flow diagrams)                                           |
| **Real-Time**          | SSE via `fetch` + `ReadableStream`, WebSocket (Bybit market data)                       |
| **Forms & Validation** | React Hook Form + Zod                                                                   |
| **Financial Math**     | Decimal.js (precise calculations, no floating-point errors)                             |
| **UI Primitives**      | Radix UI (select, tooltip, menubar), Lucide React (icons)                               |

---

## Architecture Highlights

### SSE with `fetch` instead of `EventSource`

The browser's native `EventSource` API does not support custom headers. Since both the events stream and chat stream require JWT authentication, SSE is implemented using `fetch` with `Authorization` headers and manual `ReadableStream` parsing. This enables authenticated real-time streaming with exponential backoff reconnection.

### Decimal.js for All Financial Calculations

JavaScript floating-point arithmetic is unsuitable for financial data. All monetary values — prices, PnL, quantities — use `Decimal.js` to match the backend's Prisma Decimal type and eliminate rounding errors.

### React Query with Factory Pattern Query Keys

All query keys are centralized in a single `queryKeys` factory. This prevents cache invalidation bugs and enables precise cache management — e.g., invalidating all pages of a paginated query with a single prefix key.

### Dynamic Imports for Client-Heavy Libraries

KlineCharts, ReactFlow, and Lightweight Charts don't support SSR. All are loaded via `next/dynamic` with `{ ssr: false }` to prevent hydration mismatches while keeping the rest of the app server-rendered.

### Strict Provider Chain Ordering

The root layout wraps the app in a specific provider order where each layer depends on the previous:

```text
ReactQueryProvider → PrivyProvider → AuthProvider → EventsStreamProvider
```

### Zod-Validated Environment Variables

All environment variables are validated at build time through a Zod schema, providing type-safe access and immediate failure if any required variable is missing or malformed.

---

## Project Structure

```text
src/
├── app/                          # Next.js App Router pages
│   ├── (dashboard)/              # Route group: home page (landing or auth'd)
│   ├── dashboard/strategies/     # Protected: strategy list & detail pages
│   └── strategies/[strategyId]/  # Public: strategy builder (AI chat + chart)
│
├── components/
│   ├── ui/                       # Base UI (Modal, Skeleton, Spinner, HoldButton)
│   ├── charts/                   # TradingChart, EquityCurveChart
│   ├── home/                     # Landing page, prompt input, recent strategies
│   ├── strategy-builder/         # Chat panel, backtest panel, chart/diagram toggle
│   ├── strategy-details/         # Detail page: positions, backtests, deploy, orders
│   ├── strategy-flow/            # ReactFlow diagram with custom nodes + Dagre layout
│   ├── layout/                   # Sidebar, MainLayout, AccountSummary
│   └── providers/                # ReactQuery, Privy, Auth, EventsStream providers
│
├── lib/
│   ├── api/                      # Fetch client, endpoints, query keys, queries, mutations
│   ├── sse/                      # useEventsStream (global), useChatStream (per-strategy)
│   ├── auth/                     # useAuth, useLogin, useLogout
│   ├── bybit/                    # Datafeed adapter, WebSocket, chart preferences
│   ├── validations/              # Zod schemas for forms
│   └── utils/                    # cn, format, errors, status, timeframe helpers
│
├── hooks/                        # useDebounce, usePaginationInfo
├── stores/                       # Zustand auth store
└── types/                        # API response types, strategy types, common enums
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- The [TradableAI Backend](https://github.com/Tasevski2/tradable-ai-be) running on port `3000`

### Installation

```bash
# Clone the repository
git clone https://github.com/Tasevski2/tradable-ai-fe.git
cd tradable-ai-fe

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables below)

# Start the development server
npm run dev
```

The app runs on [http://localhost:8000](http://localhost:8000).

---

## Related Repositories

| Repository                                                    | Description                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [tradable-ai-be](https://github.com/Tasevski2/tradable-ai-be) | Backend API — NestJS, Prisma, PostgreSQL, Bybit integration, AI strategy engine |

---

## Environment Variables

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:8000
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_BYBIT_WS_URL=wss://stream.bybit.com/v5/public/linear
NEXT_PUBLIC_BYBIT_REST_URL=https://api.bybit.com
NEXT_PUBLIC_SSE_RECONNECT_DELAY=1000
NEXT_PUBLIC_WS_PING_INTERVAL=20000
```
