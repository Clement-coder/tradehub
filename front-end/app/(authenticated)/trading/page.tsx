'use client';
import { FuturisticLoader } from '@/components/futuristic-loader';
import { OfflineDetector } from '@/components/offline-detector';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Clock, Zap, Star, Bell } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { usePrivy } from '@privy-io/react-auth';
import TradingChart from '@/components/trading-chart';
import TradingInterface from '@/components/trading-interface';
import PositionsTable from '@/components/positions-table';
import TradeHistory from '@/components/trade-history';
import OrderBook from '@/components/order-book';
import RecentTrades from '@/components/recent-trades';

export default function TradingPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { user, currentPrice, positions } = useTradingContext();
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/auth');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    const change = (Math.random() - 0.5) * 1000;
    const percent = (change / currentPrice) * 100;
    setPriceChange(change);
    setPriceChangePercent(percent);
  }, [currentPrice]);

  if (!ready) {
    return <FuturisticLoader />;
  }

  if (!authenticated) {
    return null;
  }

  if (!user) {
    return <FuturisticLoader />;
  }

  if (!ready || !authenticated || !user) {
    return null;
  }

  const totalPositionsValue = positions.reduce((sum, pos) => sum + (pos.quantity * currentPrice), 0);
  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header with Market Stats */}
      <div className="border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Spot Trading</h1>
                <p className="text-muted-foreground text-xs sm:text-sm">BTC/USD Market</p>
              </div>
            </div>

            {/* Market Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-sm">
              <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2 min-w-0">
                <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-bold truncate text-xs sm:text-sm">${currentPrice.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2 min-w-0">
                <TrendingUp className={`w-4 h-4 flex-shrink-0 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">24h Change</p>
                  <p className={`font-bold truncate text-xs sm:text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2 min-w-0">
                <BarChart3 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">24h Volume</p>
                  <p className="font-bold truncate text-xs sm:text-sm">$2.4B</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2 min-w-0">
                <Activity className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Open Positions</p>
                  <p className="font-bold truncate text-xs sm:text-sm">{positions.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="px-3 sm:px-4 md:px-6 pt-4 sm:pt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.15_260)]/60 to-transparent"></div>
              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.65_0.12_140)]/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
              <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.55_0.15_260)]/30 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.55_0.15_260)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Image src="/usdc-logo.svg" alt="USDC" width={20} height={20} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground truncate">Balance</p>
                </div>
                <p className="text-base sm:text-lg font-bold truncate">${user.balance.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s', animationDelay: '0.5s'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.65_0.12_140)]/60 to-transparent"></div>
              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
              <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.55_0.15_260)]/60 to-transparent"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.65_0.12_140)]/30 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.65_0.12_140)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[oklch(0.65_0.12_140)]/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[oklch(0.65_0.12_140)]" />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">Positions Value</p>
                </div>
                <p className="text-base sm:text-lg font-bold truncate">${totalPositionsValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s', animationDelay: '1s'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.15_260)]/60 to-transparent"></div>
              <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.65_0.12_140)]/60 to-transparent"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.6_0.14_180)]/30 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.6_0.14_180)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[oklch(0.6_0.14_180)]/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-[oklch(0.6_0.14_180)]" />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">24h High</p>
                </div>
                <p className="text-base sm:text-lg font-bold truncate">${(currentPrice + 1200).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s', animationDelay: '1.5s'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.55_0.15_260)]/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.65_0.12_140)]/60 to-transparent"></div>
              <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.5_0.13_320)]/30 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.5_0.13_320)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[oklch(0.5_0.13_320)]/20 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-[oklch(0.5_0.13_320)]" />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">24h Low</p>
                </div>
                <p className="text-base sm:text-lg font-bold truncate">${(currentPrice - 800).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 md:px-6 space-y-3 sm:space-y-4 md:space-y-6">
        {/* Trading Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Chart */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <TradingChart />
          </div>

          {/* Trading Panel */}
          <div className="order-1 xl:order-2">
            <TradingInterface />
          </div>
        </div>

        {/* Market Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <OrderBook />
          <RecentTrades />
        </div>

        {/* Positions and History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <PositionsTable />
          <TradeHistory limit={5} />
        </div>
      </div>
    </div>
  );
}
