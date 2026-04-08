import { z } from 'zod';

const envSchema = z.object({
  // Required — no sensible defaults
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_PRIVY_APP_ID: z.string().min(1),
  // Bybit public endpoints — defaults to production URLs
  NEXT_PUBLIC_BYBIT_WS_URL: z.string().url().default('wss://stream.bybit.com/v5/public/linear'),
  NEXT_PUBLIC_BYBIT_REST_URL: z.string().url().default('https://api.bybit.com'),
  // Timing config — sensible defaults for most environments
  NEXT_PUBLIC_SSE_RECONNECT_DELAY: z.string().default('3000').transform(Number),
  NEXT_PUBLIC_WS_PING_INTERVAL: z.string().default('20000').transform(Number),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:8000'),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  NEXT_PUBLIC_BYBIT_WS_URL: process.env.NEXT_PUBLIC_BYBIT_WS_URL,
  NEXT_PUBLIC_BYBIT_REST_URL: process.env.NEXT_PUBLIC_BYBIT_REST_URL,
  NEXT_PUBLIC_SSE_RECONNECT_DELAY: process.env.NEXT_PUBLIC_SSE_RECONNECT_DELAY,
  NEXT_PUBLIC_WS_PING_INTERVAL: process.env.NEXT_PUBLIC_WS_PING_INTERVAL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
