# TradableAI Frontend

## Project Overview

**TradableAI** is a premium AI-powered trading platform that enables users to build trading strategies through natural language conversations with AI, backtest them against historical data, and execute live trades on Bybit exchange.

### Core Features

- 🤖 AI Strategy Builder - Natural language strategy creation via chat interface
- 📊 Advanced Charting - Real-time Bybit market data with Lightweight Charts
- ⚡ Live Trading - Execute strategies on BTCUSDT, DOGEUSDT, and other markets
- 🔄 Real-time Updates - SSE streams for position updates and backtest results
- 📈 Backtesting - Historical performance analysis before live trading

---

## Tech Stack

### Core Framework

- **Next.js 16** (App Router, React 19, TypeScript)
- **Tailwind CSS v4** - CSS-based configuration with luxury/premium dark theme
- **Shadcn latest version** - UI components
- **Lucide** - For UI icons
- **TypeScript 5.x** - Strict mode, zero `any` types

### State & Data Management

- **Zustand 5.x** - Lightweight state management (auth, real-time data)
- **React Query 5.x** - Server state caching, optimistic updates
- **React Hook Form + Zod** - Type-safe form validation

### Authentication & Charts

- **Privy** - Email-only authentication with JWT
- **Lightweight Charts 4.x** - TradingView charts for market data

### Real-Time Communication

- **SSE (Server-Sent Events)** - Position updates, backtest results, AI streaming
- **WebSocket** - Bybit kline data for real-time chart updates

---

## Key Architectural Decisions

### 1. Next.js 16 with App Router

**Rationale:** Latest stable version with React Server Components, improved data fetching, better performance, and type-safe routing.

### 2. Tailwind CSS v4

**Rationale:** New CSS-based configuration approach, better performance, native CSS variables support.

### 3. Zustand for State Management

**Rationale:** Lightweight (3KB), no providers needed, perfect for real-time trading data that updates frequently from SSE/WebSocket.

### 4. React Query for Server State

**Rationale:** Handles caching, deduplication, optimistic updates critical for trading UX. Excellent App Router support in v5.

### 5. Privy for Authentication

**Rationale:** Email-only auth as required, JWT token management, Web3-ready for future expansion.

### 6. SSE + WebSocket Hybrid

**Rationale:** SSE for backend notifications (unidirectional), WebSocket for Bybit chart data (bidirectional). Best of both worlds.

### 7. Decimal.js for Financial Calculations

**Rationale:** No floating-point errors, matches backend Prisma Decimal type, critical for trading accuracy.

### 7. Use best practices for developing a NextJs applications and best web design guidelines for designing the UI. For this you can search inside the .agents folder which has skills for this.

### 8. If something is not clear to you 1000%, do a research first, search the web, and again if you are in doubt, ASK ME!

### 9. The code should be of the highest quality, a senior grade code, we must respect and use the best practices for development

### 10. If you need some guidles

## For UI/UI check ".agents/skills/web-design-guidelines/SKILL.md"

## For react best practices check ".agents/skills/vercel-react-best-practices"

## For composition patterns check ".agents/skills/vercel-composition-patterns"

---

## Project Structure

\`\`\`
src/
├── app/ # Next.js App Router
│ ├── layout.tsx # Root layout with providers
│ ├── page.tsx # Landing/home page
│ ├── error.tsx # Global error boundary
│ ├── loading.tsx # Global loading UI
│ │
│ ├── strategies/ # Public strategy routes
│ │ └── [strategyId]/
│ │
│ └── dashboard/ # Protected dashboard routes
│ └── strategies/
│ ├── page.tsx # Strategies list
│ └── [strategyId]/ # Strategy detail
│
├── components/
│ ├── ui/ # Base UI components (button, input, card)
│ ├── charts/ # Trading chart components
│ ├── strategy/ # Strategy-specific components
│ ├── positions/ # Position management components
│ ├── layout/ # Layout components (header, sidebar)
│ └── providers/ # React context providers
│
├── lib/
│ ├── api/ # API client & React Query hooks
│ │ ├── client.ts # Base fetch wrapper
│ │ ├── endpoints.ts # API endpoint constants
│ │ ├── queries/ # React Query hooks (useUser, useStrategies)
│ │ └── mutations/ # React Query mutations
│ ├── sse/ # Server-Sent Events utilities
│ │ ├── SSEManager.ts # SSE connection manager
│ │ └── useSSE.ts # React hook for SSE
│ ├── websocket/ # WebSocket utilities
│ │ ├── BybitWSManager.ts # Bybit WebSocket client
│ │ └── useWebSocket.ts # React hook for WS
│ ├── auth/ # Authentication utilities
│ │ └── useAuth.ts # Auth hook with Privy + /user/me
│ └── utils/ # General utilities
│ ├── cn.ts # className merger
│ ├── format.ts # Number/date formatting
│ └── constants.ts # App constants
│
├── hooks/ # Custom React hooks
├── stores/ # Zustand stores
│ ├── useAuthStore.ts # Auth state
│ └── useRealtimeStore.ts # Real-time position updates
├── types/ # TypeScript types (match backend schema)
└── styles/ # Global styles
\`\`\`

---

## Backend Integration

### Base Configuration

- **Backend URL:** \`http://localhost:3000\`
- **Frontend Port:** \`8000\`
- **API Prefix:** All endpoints prefixed with \`/api/\`

### Critical Authentication Flow

**MUST call \`/api/user/me\` FIRST** on authentication:

\`\`\`typescript
// This endpoint creates the user on backend if not exists
const { data: userData } = useUser(); // Calls /api/user/me

useEffect(() => {
if (authenticated && userData) {
setUser(userData); // Store in Zustand
}
}, [authenticated, userData]);
\`\`\`

**Why?** Backend middleware checks JWT and creates user if doesn't exist. Without waiting for this call, subsequent requests may fail.

### API Endpoints Structure

- \`/api/users/me\` - Get current user (MUST BE CALLED FIRST)
- \`/api/strategies\` - List strategies
- \`/api/strategies/:id\` - Get/update strategy
- \`/api/backtest\` - Run backtest
- \`/api/positions\` - List positions
- \`/api/trades\` - List trades
- (More endpoints TBD as frontend develops)

---

## Development Guidelines

### TypeScript Rules (STRICT ENFORCEMENT)

1. **Zero \`any\` types** - All types must be explicit
2. **No hardcoded strings** - Use constants, enums, or env vars
3. **Strict null checks** - Handle undefined/null explicitly
4. **Type imports** - Use \`import type\` for types

### Code Quality Standards

1. **Senior-level patterns** - Use composition, HOCs, custom hooks
2. **Error boundaries** - Wrap risky components
3. **Loading states** - Always show loading UI
4. **Optimistic updates** - Update UI before server confirms
5. **Retry logic** - Auto-retry failed requests (exponential backoff)

### Financial Data Handling

**NEVER use \`parseFloat()\` or JavaScript numbers for money/prices:**

\`\`\`typescript
// ❌ BAD
const profit = parseFloat(exitPrice) - parseFloat(entryPrice);

// ✅ GOOD
import Decimal from 'decimal.js';
const profit = new Decimal(exitPrice).minus(entryPrice);
\`\`\`

### Component Patterns

1. **Server Components by default** - Use \`'use client'\` only when needed
2. **Colocate loading/error** - Create \`loading.tsx\` and \`error.tsx\` next to \`page.tsx\`
3. **Dynamic imports for client-heavy** - Lightweight Charts, charts libraries

---

## Color Palette (Luxury/Premium Dark Theme)

Colors defined in \`src/app/globals.css\` using Tailwind v4 CSS-based configuration:

- **Background**: Deep black (\`hsl(0, 0%, 8%)\`) for luxury feel
- **Text**: Soft white (\`hsl(0, 0%, 95%)\`) for readability
- **Primary (Gold)**: \`hsl(45, 100%, 51%)\` for premium touch
- **Bullish**: Rich green \`hsl(142, 71%, 45%)\` for positive trading data
- **Bearish**: Rich red \`hsl(0, 72%, 51%)\` for negative trading data
- **Borders**: Subtle dark with gold hover effects

---

## Critical Implementation Notes

### 1. Tailwind CSS v4 Configuration

Tailwind v4 uses CSS-based configuration instead of \`tailwind.config.ts\`. Configure colors and theme in \`src/app/globals.css\` using \`@theme inline\` directive.

### 2. Lightweight Charts SSR Issue

Lightweight Charts doesn't support SSR. Must use dynamic import:

\`\`\`typescript
import dynamic from 'next/dynamic';

const TradingChart = dynamic(() => import('./TradingChartImpl'), {
ssr: false,
loading: () => <ChartSkeleton />,
});
\`\`\`

### 3. SSE Token Authentication

EventSource API doesn't support custom headers. Use URL parameter:

\`\`\`typescript
const token = await getAccessToken();
const url = \`\${API_URL}/events/stream?token=\${token}\`;
const eventSource = new EventSource(url);
\`\`\`

### 4. Environment Variables

Type-safe env vars using Zod validation in \`src/lib/env.ts\`.

---

## Pages Routing Structure

### Public Pages

- **\`/\`** - Landing page (if not authenticated) or Home (if authenticated)
- **\`/strategies/:strategyId\`** - Public strategy view (shareable)

### Protected Pages (Dashboard)

- **\`/dashboard/strategies\`** - User's strategies list
- **\`/dashboard/strategies/:strategyId\`** - Strategy detail with AI chat

### Auth Pages (Handled by Privy Modal)

- No dedicated auth pages - Privy handles in modal overlay

---

## Next Steps After Setup

1. **Set up Privy account** - Get app ID and credentials
2. **Test architecture** - Verify all core utilities work
3. **Begin page-by-page development** - Develop features iteratively

**Note:** Specific page implementations (landing, dashboard, strategies, etc.) will be developed separately in future iterations.

---

**Created:** January 2026
**Last Updated:** January 2026
**Version:** 1.0.0
**Framework:** Next.js 16, Tailwind CSS v4
