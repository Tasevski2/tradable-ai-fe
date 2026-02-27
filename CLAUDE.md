# TradableAI Frontend

## Project Overview

**TradableAI** is a premium AI-powered trading platform that enables users to build trading strategies through natural language conversations with AI, backtest them against historical data, and execute live trades on Bybit exchange.

### Core Features

- AI Strategy Builder - Natural language strategy creation via chat interface
- Advanced Charting - Real-time Bybit market data with KlineCharts
- Live Trading - Execute strategies on BTCUSDT, DOGEUSDT, and other markets
- Real-time Updates - SSE streams for position updates, backtest results, and AI chat
- Backtesting - Historical performance analysis with equity curves and trade history
- Strategy Flow Diagrams - Visual ReactFlow diagrams of strategy logic

---

## Tech Stack

### Core Framework

- **Next.js 16.1** (App Router, React 19, TypeScript 5)
- **Tailwind CSS v4** - CSS-based configuration with luxury/premium dark theme
- **Radix UI** - Headless primitives (select, tooltip, menubar)
- **Lucide React** - UI icons
- **TypeScript 5.x** - Strict mode, zero `any` types

### State & Data Management

- **Zustand 5.x** - Lightweight state management (auth store)
- **React Query 5.x** - Server state caching, optimistic updates
- **Immer** - Immutable state updates
- **React Hook Form + Zod** - Type-safe form validation

### Authentication & Charts

- **Privy** - Email-only authentication with JWT
- **KlineCharts 9.x** / **@klinecharts/pro** - Candlestick charting with Bybit datafeed
- **Lightweight Charts 4.x** - Equity curve visualization

### Visualization & Content

- **ReactFlow 11.x** - Strategy flow diagrams (node-based)
- **Dagre** - Automatic graph layout for flow diagrams
- **React Markdown + remark-gfm** - Rendering AI chat responses

### Utilities

- **Decimal.js** - Precise financial calculations
- **date-fns** - Date formatting
- **Sonner** - Toast notifications
- **class-variance-authority + clsx + tailwind-merge** - Styling utilities
- **react-intersection-observer** - Scroll-based triggers

### Real-Time Communication

- **SSE (Server-Sent Events)** - Position updates, backtest results, AI chat streaming (via `fetch` + `ReadableStream`)
- **WebSocket** - Bybit kline data for real-time chart updates

---

## Key Architectural Decisions

### 1. Next.js 16 with App Router

**Rationale:** Latest stable version with React Server Components, improved data fetching, better performance, and type-safe routing.

### 2. Tailwind CSS v4

**Rationale:** New CSS-based configuration approach, better performance, native CSS variables support.

### 3. Zustand for State Management

**Rationale:** Lightweight (3KB), no providers needed, perfect for auth state synced from Privy.

### 4. React Query for Server State

**Rationale:** Handles caching, deduplication, optimistic updates critical for trading UX. Centralized `queryKeys` factory for consistent cache invalidation.

### 5. Privy for Authentication

**Rationale:** Email-only auth as required, JWT token management, Web3-ready for future expansion.

### 6. SSE via fetch + ReadableStream

**Rationale:** Unlike `EventSource`, `fetch` supports `Authorization` headers. Both the events stream and chat stream use this pattern with manual SSE parsing.

### 7. Decimal.js for Financial Calculations

**Rationale:** No floating-point errors, matches backend Prisma Decimal type, critical for trading accuracy.

### 8. Use best practices for developing a Next.js application and best web design guidelines for designing the UI. For this you can search inside the `.agents` folder which has skills for this.

### 9. If something is not clear to you 1000%, do a research first, search the web, and again if you are in doubt, ASK ME!

### 10. The code should be of the highest quality, a senior grade code, we must respect and use the best practices for development.

## For UI/UX check ".agents/skills/web-design-guidelines/SKILL.md"

## For React best practices check ".agents/skills/vercel-react-best-practices"

## For composition patterns check ".agents/skills/vercel-composition-patterns"

---

## Project Structure

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (providers + Toaster)
│   ├── globals.css                   # Tailwind v4 theme config
│   │
│   ├── (dashboard)/                  # Route group (no URL segment)
│   │   ├── layout.tsx                # Auth-aware layout (sidebar for logged-in)
│   │   └── page.tsx                  # Home: LandingPage or AuthenticatedHome
│   │
│   ├── dashboard/                    # Protected dashboard routes
│   │   ├── layout.tsx                # Dashboard auth guard + MainLayout
│   │   └── strategies/
│   │       ├── page.tsx              # Strategies list
│   │       └── [strategyId]/
│   │           ├── page.tsx          # Strategy detail (backtest, positions, flow)
│   │           └── not-found.tsx     # 404 for invalid strategy
│   │
│   └── strategies/                   # Public strategy routes
│       └── [strategyId]/
│           ├── layout.tsx            # Public strategy layout
│           └── page.tsx              # Strategy builder (AI chat + chart/diagram)
│
├── components/
│   ├── ui/                           # Base UI components
│   │   ├── HoldButton.tsx            # Press-and-hold confirmation button
│   │   ├── MarkdownContent.tsx       # Markdown renderer with remark-gfm
│   │   ├── Modal.tsx                 # Reusable modal
│   │   ├── Skeleton.tsx              # Loading skeleton
│   │   ├── Spinner.tsx               # Loading spinner
│   │   ├── menubar.tsx               # Radix menubar
│   │   ├── select.tsx                # Radix select
│   │   └── tooltip.tsx               # Radix tooltip
│   │
│   ├── charts/                       # Chart components
│   │   ├── TradingChart.tsx          # KlineCharts candlestick chart
│   │   └── EquityCurveChart.tsx      # Lightweight Charts equity curve
│   │
│   ├── home/                         # Home page components
│   │   ├── AuthenticatedHome.tsx     # Logged-in home with prompt input
│   │   ├── LandingPage.tsx           # Public landing page
│   │   ├── PromptInput.tsx           # Strategy creation prompt
│   │   └── RecentStrategies.tsx      # Recent strategies list
│   │
│   ├── strategy/                     # Strategy list components
│   │   ├── NewStrategyModal.tsx      # Create new strategy modal
│   │   └── StrategyListCard.tsx      # Strategy card in list view
│   │
│   ├── strategy-builder/             # Strategy builder page (AI chat)
│   │   ├── index.ts                  # Barrel exports
│   │   ├── BuilderHeader.tsx         # Builder page header
│   │   ├── ChatPanel.tsx             # Chat panel container
│   │   ├── ChatInput.tsx             # Chat input with send button
│   │   ├── ChatMessage.tsx           # Individual chat message
│   │   ├── ChatActionButtons.tsx     # AI-suggested action buttons
│   │   ├── ChartDiagramPanel.tsx     # Chart/diagram toggle panel
│   │   ├── BacktestPanel.tsx         # Backtest results in builder
│   │   ├── BacktestHistoryTable.tsx  # Backtest history list
│   │   └── BacktestSettingsModal.tsx # Backtest configuration modal
│   │
│   ├── strategy-details/             # Strategy detail page
│   │   ├── index.ts                  # Barrel exports
│   │   ├── StrategyHeader.tsx        # Detail page header
│   │   ├── StrategySummary.tsx       # Strategy overview card
│   │   ├── StrategyControlsPanel.tsx # Activate/pause controls
│   │   ├── StrategyFlowPanel.tsx     # Flow diagram panel
│   │   ├── BacktestDetails.tsx       # Backtest results display
│   │   ├── BacktestHistoryPanel.tsx  # Backtest history list
│   │   ├── BacktestTradesModal.tsx   # Backtest trades modal
│   │   ├── LivePositionsPanel.tsx    # Live positions table
│   │   ├── RecentActivityPanel.tsx   # Activity feed
│   │   ├── DeployModal.tsx           # Deploy strategy modal
│   │   ├── MarketsListModal.tsx      # Markets selection modal
│   │   ├── MarketListItem.tsx        # Market list item
│   │   ├── StrategyOrdersModal.tsx   # Orders history modal
│   │   └── StrategySettingsModal.tsx # Strategy settings modal
│   │
│   ├── strategy-flow/                # ReactFlow strategy visualization
│   │   ├── index.ts                  # Barrel exports
│   │   ├── StrategyFlowDiagram.tsx   # Dynamic import wrapper (SSR-safe)
│   │   ├── StrategyFlowDiagramImpl.tsx # ReactFlow implementation
│   │   ├── nodes/                    # Custom ReactFlow nodes
│   │   │   ├── index.ts
│   │   │   ├── IndicatorNode.tsx
│   │   │   ├── ConditionNode.tsx
│   │   │   ├── LogicalNode.tsx
│   │   │   └── SignalNode.tsx
│   │   └── utils/
│   │       ├── layoutGraph.ts        # Dagre auto-layout
│   │       └── transformConfig.ts    # Strategy config → ReactFlow nodes
│   │
│   ├── layout/                       # Layout components
│   │   ├── MainLayout.tsx            # Sidebar + content layout
│   │   ├── Sidebar.tsx               # Navigation sidebar
│   │   ├── AccountSummary.tsx        # Account balance summary
│   │   ├── StrategyHeader.tsx        # Shared strategy header
│   │   ├── StrategyLayout.tsx        # Strategy page layout
│   │   ├── UserProfileModal.tsx      # User profile / API keys modal
│   │   └── MobileBlocker.tsx         # Mobile device warning
│   │
│   └── providers/                    # React context providers
│       ├── ReactQueryProvider.tsx
│       ├── PrivyProvider.tsx
│       ├── AuthProvider.tsx          # Syncs Privy → Zustand + calls /users/me
│       └── EventsStreamProvider.tsx  # Global SSE event stream
│
├── lib/
│   ├── api/                          # API layer
│   │   ├── client.ts                 # Base fetch wrapper with auth
│   │   ├── endpoints.ts              # API endpoint constants
│   │   ├── queryKeys.ts              # React Query key factory
│   │   ├── queries/                  # React Query hooks
│   │   │   ├── index.ts
│   │   │   ├── useUser.ts
│   │   │   ├── useAccountSummary.ts
│   │   │   ├── useBybitAccount.ts
│   │   │   ├── useStrategies.ts
│   │   │   ├── useStrategy.ts
│   │   │   ├── useStrategyActivities.ts
│   │   │   ├── useStrategyMarkets.ts
│   │   │   ├── useStrategyMarketsList.ts
│   │   │   ├── useMarketsWithStatus.ts
│   │   │   ├── useMarkets.ts
│   │   │   ├── useStrategyBacktests.ts
│   │   │   ├── useBacktestDetail.ts
│   │   │   ├── useBacktestTrades.ts
│   │   │   ├── useBacktestEquity.ts
│   │   │   ├── useStrategyPositions.ts
│   │   │   ├── useStrategyOrders.ts
│   │   │   └── useChatMessages.ts
│   │   └── mutations/                # React Query mutations
│   │       ├── index.ts
│   │       ├── useCreateStrategyWithPrompt.ts
│   │       ├── useUpdateStrategy.ts
│   │       ├── useDeleteStrategy.ts
│   │       ├── useActivateStrategy.ts
│   │       ├── usePauseStrategy.ts
│   │       ├── useDeployStrategy.ts
│   │       ├── useRunBacktest.ts
│   │       ├── usePostChatMessage.ts
│   │       ├── useSetApiKeys.ts
│   │       ├── useRemoveApiKeys.ts
│   │       ├── useClosePosition.ts
│   │       └── useCloseAllPositions.ts
│   │
│   ├── sse/                          # Server-Sent Events
│   │   ├── useEventsStream.ts        # Global events stream (positions, backtests)
│   │   └── useChatStream.ts          # Per-strategy AI chat stream
│   │
│   ├── auth/                         # Authentication
│   │   ├── useAuth.ts                # Auth hook (Privy + /users/me)
│   │   ├── useLogin.ts               # Login trigger
│   │   └── useLogout.ts              # Logout + cleanup
│   │
│   ├── bybit/                        # Bybit integration
│   │   ├── BybitDatafeed.ts          # KlineCharts datafeed adapter
│   │   ├── chartPreferences.ts       # Chart settings persistence
│   │   └── constants.ts              # Bybit-specific constants
│   │
│   ├── validations/                  # Zod validation schemas
│   │   ├── apiKeys.ts                # API key form validation
│   │   └── deployStrategy.ts         # Deploy form validation
│   │
│   ├── utils/                        # General utilities
│   │   ├── cn.ts                     # className merger (clsx + tailwind-merge)
│   │   ├── format.ts                 # Number/date formatting
│   │   ├── errors.ts                 # Error handling utilities
│   │   ├── status.ts                 # Strategy status helpers
│   │   └── timeframe.ts              # Timeframe conversion utilities
│   │
│   └── env.ts                        # Zod-validated environment variables
│
├── hooks/                            # Custom React hooks
│   ├── index.ts
│   ├── useDebounce.ts                # Debounced value hook
│   └── usePaginationInfo.ts          # Pagination state hook
│
├── stores/                           # Zustand stores
│   └── useAuthStore.ts               # Auth state (user, loading, authenticated)
│
└── types/                            # TypeScript types
    ├── api.ts                        # API response types, SSE event types
    ├── common.ts                     # Shared utility types
    └── strategy.ts                   # Strategy domain types
```

---

## Backend Integration

### Base Configuration

- **Backend URL:** `http://localhost:3000` (via `NEXT_PUBLIC_API_URL`)
- **Frontend Port:** `8000`
- **API Prefix:** All endpoints prefixed with `/api/`

### Critical Authentication Flow

**MUST call `/api/users/me` FIRST** on authentication:

```typescript
// AuthProvider syncs Privy auth state → Zustand store
// and triggers useUser() which calls /api/users/me
// Backend creates the user record if it doesn't exist
```

**Why?** Backend middleware checks JWT and creates user if doesn't exist. Without waiting for this call, subsequent requests may fail.

### Provider Chain

Root layout wraps the app in this provider order:

```
ReactQueryProvider → PrivyProvider → AuthProvider → EventsStreamProvider
```

### API Endpoints

All endpoints defined in `src/lib/api/endpoints.ts`:

**Users:**
- `GET /api/users/me` - Get/create current user (MUST BE CALLED FIRST)

**Strategies:**
- `GET /api/strategies` - List strategies
- `POST /api/strategies/create-with-initial-prompt` - Create strategy with initial AI prompt
- `GET /api/strategies/:id` - Get strategy detail
- `PUT /api/strategies/:id` - Update strategy
- `GET /api/strategies/:id/live-config` - Get live trading configuration
- `GET /api/strategies/:id/markets/summary` - Markets summary
- `GET /api/strategies/:id/markets/all-with-status` - All markets with status
- `GET /api/strategies/:id/activities` - Strategy activity feed
- `POST /api/strategies/:id/activate` - Activate live trading
- `POST /api/strategies/:id/pause` - Pause live trading

**Chat:**
- `GET /api/strategies/:id/chat/messages` - Get chat messages (paginated, `?limit=&before=`)
- `POST /api/strategies/:id/chat/messages` - Send chat message
- `GET /api/strategies/:id/chat/stream?afterMessageId=` - SSE chat stream

**Accounts:**
- `GET /api/accounts` - Get accounts
- `GET /api/accounts/summary` - Account balance summary
- `POST /api/accounts/set-api-keys` - Set Bybit API keys
- `DELETE /api/accounts/api-keys` - Remove API keys

**Positions:**
- `GET /api/positions/strategies/:id?page=&limit=` - Positions by strategy
- `POST /api/positions/strategies/:id/symbols/:symbol/close` - Close single position
- `POST /api/positions/strategies/:id/close-all` - Close all positions

**Backtests:**
- `POST /api/strategies/:id/backtests/run` - Run backtest
- `GET /api/strategies/:id/backtests?page=&limit=` - List backtests
- `GET /api/strategies/:id/backtests/latest` - Latest backtest
- `GET /api/strategies/:id/backtests/:backtestId` - Backtest detail
- `GET /api/strategies/:id/backtests/:backtestId/trades?page=&limit=` - Backtest trades
- `GET /api/strategies/:id/backtests/latest/equity` - Latest equity curve
- `GET /api/strategies/:id/backtests/:backtestId/equity` - Specific equity curve

**Orders:**
- `GET /api/strategies/:id/orders?page=&limit=` - Orders by strategy

**Markets:**
- `GET /api/markets` - List all markets
- `GET /api/strategies/:id/markets?page=&limit=&search=` - Strategy markets

### SSE Streaming

Both SSE streams use `fetch` with `Authorization: Bearer ${token}` header (NOT `EventSource` which doesn't support custom headers). Manual SSE parsing via `ReadableStream`.

**Events Stream** (`useEventsStream.ts`):
- URL: `GET /api/events/stream`
- Persistent connection with exponential backoff reconnection
- Events: `POSITION_OPENED`, `POSITION_CLOSED`, `BACKTEST_COMPLETE`
- Auto-invalidates React Query caches and shows toast notifications
- Managed globally by `EventsStreamProvider`

**Chat Stream** (`useChatStream.ts`):
- URL: `GET /api/strategies/:id/chat/stream?afterMessageId=`
- Per-strategy connection, created on demand after sending a message
- Events: `token` (streaming content), `tool` (tool calls), `done` (completion with actions), `error`, `reconnected` (buffered content replay)
- Returns `{ isStreaming, streamingContent, activeTools, streamError, startStream, stopStream }`

### Query Keys Pattern

Centralized in `src/lib/api/queryKeys.ts`. Factory pattern for consistent cache keys:

```typescript
queryKeys.user.me()                           // ["user", "me"]
queryKeys.strategies.list(params)             // ["strategies", "list", params]
queryKeys.strategies.detail(id)               // ["strategies", "detail", id]
queryKeys.backtests.byStrategy(id, page)      // ["backtests", "byStrategy", id, {page, limit}]
queryKeys.positions.byStrategyPrefix(id)      // ["positions", "byStrategy", id]  (for invalidation)
queryKeys.chat.messages(strategyId)           // ["chat", "messages", strategyId]
```

Use `*Prefix` variants for broad invalidation (e.g., invalidate all pages of a paginated query).

---

## Development Guidelines

### TypeScript Rules (STRICT ENFORCEMENT)

1. **Zero `any` types** - All types must be explicit
2. **No hardcoded strings** - Use constants, enums, or env vars
3. **Strict null checks** - Handle undefined/null explicitly
4. **Type imports** - Use `import type` for types

### Code Quality Standards

1. **Senior-level patterns** - Use composition, HOCs, custom hooks
2. **Error boundaries** - Wrap risky components
3. **Loading states** - Always show loading UI
4. **Optimistic updates** - Update UI before server confirms
5. **Retry logic** - Auto-retry failed requests (exponential backoff)

### Financial Data Handling

**NEVER use `parseFloat()` or JavaScript numbers for money/prices:**

```typescript
// BAD
const profit = parseFloat(exitPrice) - parseFloat(entryPrice);

// GOOD
import Decimal from 'decimal.js';
const profit = new Decimal(exitPrice).minus(entryPrice);
```

### Component Patterns

1. **Server Components by default** - Use `'use client'` only when needed
2. **Colocate loading/error** - Create `loading.tsx` and `error.tsx` next to `page.tsx`
3. **Dynamic imports for client-heavy** - KlineCharts, ReactFlow, Lightweight Charts

---

## Color Palette (Luxury/Premium Dark Theme)

Colors defined in `src/app/globals.css` using Tailwind v4 CSS-based configuration:

- **Background**: Deep black (`hsl(0, 0%, 8%)`) for luxury feel
- **Text**: Soft white (`hsl(0, 0%, 95%)`) for readability
- **Primary (Gold)**: `hsl(45, 100%, 51%)` for premium touch
- **Bullish**: Rich green `hsl(142, 71%, 45%)` for positive trading data
- **Bearish**: Rich red `hsl(0, 72%, 51%)` for negative trading data
- **Borders**: Subtle dark with gold hover effects

---

## Critical Implementation Notes

### 1. Tailwind CSS v4 Configuration

Tailwind v4 uses CSS-based configuration instead of `tailwind.config.ts`. Configure colors and theme in `src/app/globals.css` using `@theme inline` directive.

### 2. Client-Side Only Libraries

KlineCharts, ReactFlow, and Lightweight Charts don't support SSR. Must use dynamic import:

```typescript
import dynamic from 'next/dynamic';

const StrategyFlowDiagramImpl = dynamic(
  () => import('./StrategyFlowDiagramImpl'),
  { ssr: false }
);
```

### 3. SSE Authentication

Both SSE streams use `fetch` with `Authorization` header instead of `EventSource`:

```typescript
const token = await apiClient.getAuthToken();
const response = await fetch(url, {
  headers: {
    Accept: "text/event-stream",
    Authorization: `Bearer ${token}`,
  },
});
const reader = response.body!.getReader();
// Manual SSE parsing from ReadableStream
```

### 4. Environment Variables

Type-safe env vars using Zod validation in `src/lib/env.ts`:

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_PRIVY_APP_ID` - Privy application ID
- `NEXT_PUBLIC_BYBIT_WS_URL` - Bybit WebSocket URL
- `NEXT_PUBLIC_BYBIT_REST_URL` - Bybit REST API URL
- `NEXT_PUBLIC_SSE_RECONNECT_DELAY` - SSE reconnect base delay (ms)
- `NEXT_PUBLIC_WS_PING_INTERVAL` - WebSocket ping interval (ms)
- `NEXT_PUBLIC_APP_URL` - Frontend application URL

---

## Pages Routing Structure

### Public Pages

- **`/`** - Landing page (unauthenticated) or Authenticated Home with prompt input (authenticated). Uses `(dashboard)` route group.
- **`/strategies/:strategyId`** - Strategy builder with AI chat, chart/diagram panel

### Protected Pages (Dashboard)

- **`/dashboard/strategies`** - User's strategies list
- **`/dashboard/strategies/:strategyId`** - Strategy detail with backtest, positions, flow diagram, deploy controls

### Auth Pages (Handled by Privy Modal)

- No dedicated auth pages - Privy handles login/signup in modal overlay

---

**Created:** January 2026
**Last Updated:** February 2026
**Version:** 1.1.0
**Framework:** Next.js 16.1, React 19, Tailwind CSS v4
