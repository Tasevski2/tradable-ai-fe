import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { PrivyProvider } from "@/components/providers/PrivyProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { EventsStreamProvider } from "@/components/providers/EventsStreamProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TradableAI - AI-Powered Trading Strategies",
  description:
    "Build, backtest, and deploy trading strategies with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ReactQueryProvider>
          <PrivyProvider>
            <AuthProvider>
              <EventsStreamProvider>{children}</EventsStreamProvider>
              <Toaster theme="dark" position="bottom-right" richColors />
            </AuthProvider>
          </PrivyProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
