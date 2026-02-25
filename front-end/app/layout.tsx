import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { TradingProvider } from '@/app/context/trading-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'TradeHub - Bitcoin Trading Platform',
  description: 'Trade Bitcoin with real-time market data. Professional BTC/USD trading platform with advanced charts and instant order execution.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: '/tradeHub_logo.PNG',
    apple: '/tradeHub_logo.PNG',
  },
}

import { Providers } from '@/app/providers'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Providers>
          <TradingProvider>
            {children}
          </TradingProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
