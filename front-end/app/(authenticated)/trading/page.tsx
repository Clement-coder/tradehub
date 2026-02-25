'use client';

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

export default function TradingPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { user, currentPrice, positions } = useTradingContext();
  const [mounted, setMounted] = useState(false);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && ready && !authenticated) {
      router.push('/auth');
    }
  }, [mounted, ready, authenticated, router]);

  useEffect(() => {
    const change = (Math.random() - 0.5) * 1000;
    const percent = (change / currentPrice) * 100;
    setPriceChange(change);
    setPriceChangePercent(percent);
  }, [currentPrice]);

  if (!mounted || !ready || !authenticated || !user) {
    return null;
  }

  const totalPositionsValue = positions.reduce((sum, pos) => sum + (pos.quantity * currentPrice), 0);
  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header with Market Stats */}
      <div className="border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Spot Trading</h1>
                <p className="text-muted-foreground text-xs sm:text-sm">BTC/USD Market</p>
              </div>
            </div>

            {/* Market Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
                <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-bold truncate">${currentPrice.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
                <TrendingUp className={`w-4 h-4 flex-shrink-0 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">24h Change</p>
                  <p className={`font-bold truncate ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">24h Volume</p>
                  <p className="font-bold truncate">$2.4B</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
                <Activity className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Open Positions</p>
                  <p className="font-bold truncate">{positions.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.15_260)]/60 to-transparent"></div>
              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.65_0.12_140)]/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
              <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.55_0.15_260)]/30 rounded-xl p-4 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.55_0.15_260)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Image src="/usdc-logo.svg" alt="USDC" width={24} height={24} className="w-6 h-6" />
                  <p className="text-xs text-muted-foreground">Balance</p>
                </div>
                <p className="text-lg font-bold">${user.balance.toFixed(2)}</p>
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
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.65_0.12_140)]/30 rounded-xl p-4 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.65_0.12_140)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[oklch(0.65_0.12_140)]/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[oklch(0.65_0.12_140)]" />
                  </div>
                  <p className="text-xs text-muted-foreground">Positions Value</p>
                </div>
                <p className="text-lg font-bold">${totalPositionsValue.toFixed(2)}</p>
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
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.6_0.14_180)]/30 rounded-xl p-4 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.6_0.14_180)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[oklch(0.6_0.14_180)]/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-[oklch(0.6_0.14_180)]" />
                  </div>
                  <p className="text-xs text-muted-foreground">24h High</p>
                </div>
                <p className="text-lg font-bold">${(currentPrice + 1200).toLocaleString()}</p>
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
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.5_0.13_320)]/30 rounded-xl p-4 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.5_0.13_320)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[oklch(0.5_0.13_320)]/20 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-[oklch(0.5_0.13_320)]" />
                  </div>
                  <p className="text-xs text-muted-foreground">24h Low</p>
                </div>
                <p className="text-lg font-bold">${(currentPrice - 800).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:px-6 space-y-4 sm:space-y-6">
        {/* Trading Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Chart */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <span className="text-orange-500 font-bold text-sm">₿</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">BTC/USD</h2>
                      <p className="text-xs text-muted-foreground">Bitcoin</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="text-xs font-semibold">{isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                    <Clock className="w-3 h-3 inline mr-1" />
                    1H
                  </button>
                  <button className="px-3 py-1.5 rounded-lg hover:bg-muted text-xs font-medium transition-colors">4H</button>
                  <button className="px-3 py-1.5 rounded-lg hover:bg-muted text-xs font-medium transition-colors">1D</button>
                  <button className="px-3 py-1.5 rounded-lg hover:bg-muted text-xs font-medium transition-colors">1W</button>
                </div>
              </div>
              <TradingChart />
            </div>
          </div>

          {/* Trading Panel */}
          <div className="order-1 xl:order-2">
            <TradingInterface />
          </div>
        </div>

        {/* Positions and History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <PositionsTable />
          <TradeHistory limit={5} />
        </div>
      </div>
    </div>
  );
}
