'use client';

import { PrivyProvider as PrivySDKProvider } from '@privy-io/react-auth';
import { env } from '@/lib/env';

interface PrivyProviderProps {
  children: React.ReactNode;
}

/**
 * Privy Authentication Provider
 *
 * Wraps the application with Privy authentication.
 * Configured for email-only authentication as per project requirements.
 *
 * @example
 * ```tsx
 * <PrivyProvider>
 *   <App />
 * </PrivyProvider>
 * ```
 */
export function PrivyProvider({ children }: PrivyProviderProps) {
  return (
    <PrivySDKProvider
      appId={env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        // Email-only authentication (no wallet, no social)
        loginMethods: ['email'],

        // Appearance customization for luxury dark theme
        appearance: {
          theme: 'dark',
          accentColor: '#FFA500', // Gold accent to match our theme
          logo: undefined, // Optional: Add your logo URL here
        },

        // Embedded wallet disabled (trading platform, not crypto wallet)
        embeddedWallets: {
          createOnLogin: 'off',
        },
      }}
    >
      {children}
    </PrivySDKProvider>
  );
}
