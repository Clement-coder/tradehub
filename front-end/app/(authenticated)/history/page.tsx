'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { History, TrendingUp, TrendingDown } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';

// Helper functions to format currency and price
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export default function HistoryPage() {
  const router = useRouter();
  const { user, trades } = useTradingContext();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'long' | 'short'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push('/auth');
    }
  }, [mounted, user, router]);

  if (!mounted || !user) {
    return null;
  }

  const filteredTrades = trades.filter((trade) => {
    if (filter === 'all') return true;
    return trade.type === filter;
  });

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winRate = trades.length > 0
    ? ((trades.filter((t) => t.pnl > 0).length / trades.length) * 100).toFixed(1)
    : '0';
  const averageProfit = trades.length > 0
    ? trades.reduce((sum, trade) => sum + trade.pnl, 0) / trades.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-gradient-to-r from-[oklch(0.68_0.14_180)]/10 to-[oklch(0.62_0.13_320)]/10">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3 mb-2">
            <Image src="/btc-logo.svg" alt="BTC" width={24} height={24} className="w-6 h-6" />
            <h1 className="text-xl sm:text-2xl font-bold">Trade History</h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">View all your completed BTC trades and performance</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Trades */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.15_260)]/60 to-transparent"></div>
              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.65_0.12_140)]/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
              <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.55_0.15_260)]/30 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.55_0.15_260)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <p className="text-muted-foreground text-xs sm:text-sm mb-2">Total Trades</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{trades.length}</p>
              </div>
            </div>
          </div>

          {/* Total P&L */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s', animationDelay: '0.5s'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.65_0.12_140)]/60 to-transparent"></div>
              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
              <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.55_0.15_260)]/60 to-transparent"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.65_0.12_140)]/30 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.65_0.12_140)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <p className="text-muted-foreground text-xs sm:text-sm mb-2">Total P&L</p>
                <p className={`text-2xl sm:text-3xl font-bold ${totalPnL >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {formatCurrency(totalPnL)}
                </p>
              </div>
            </div>
          </div>

          {/* Win Rate */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s', animationDelay: '1s'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.15_260)]/60 to-transparent"></div>
              <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.65_0.12_140)]/60 to-transparent"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.6_0.14_180)]/30 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.6_0.14_180)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <p className="text-muted-foreground text-xs sm:text-sm mb-2">Win Rate</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{winRate}%</p>
              </div>
            </div>
          </div>

          {/* Average Trade */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s', animationDelay: '1.5s'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.55_0.15_260)]/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.65_0.12_140)]/60 to-transparent"></div>
              <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.5_0.13_320)]/30 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.5_0.13_320)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <p className="text-muted-foreground text-xs sm:text-sm mb-2">Avg. Trade</p>
                <p className={`text-2xl sm:text-3xl font-bold ${averageProfit >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {formatCurrency(averageProfit)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card/95 backdrop-blur-sm border border-border/40 rounded-xl p-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`transition-all duration-200 ${
              filter === 'all'
                ? 'group relative inline-flex items-center justify-center gap-2 md:gap-3 px-6 sm:px-8 lg:px-10 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base text-primary-foreground bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden'
                : 'flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-primary/25 to-primary/15 border border-primary/40'
            }`}
          >
            {filter === 'all' && <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>}
            <span className={filter === 'all' ? '' : 'text-primary'}>All Trades</span>
          </button>
          <button
            onClick={() => setFilter('long')}
            className={`transition-all duration-200 ${
              filter === 'long'
                ? 'group relative inline-flex items-center justify-center gap-2 md:gap-3 px-6 sm:px-8 lg:px-10 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base text-primary-foreground bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden'
                : 'flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-primary/25 to-primary/15 border border-primary/40'
            }`}
          >
            {filter === 'long' && <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>}
            <TrendingUp className="w-4 md:w-5 h-4 md:h-5" />
            <span className={filter === 'long' ? '' : 'text-primary'}>Long</span>
          </button>
          <button
            onClick={() => setFilter('short')}
            className={`transition-all duration-200 ${
              filter === 'short'
                ? 'group relative inline-flex items-center justify-center gap-2 md:gap-3 px-6 sm:px-8 lg:px-10 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base text-primary-foreground bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden'
                : 'flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-primary/25 to-primary/15 border border-primary/40'
            }`}
          >
            {filter === 'short' && <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>}
            <TrendingDown className="w-4 md:w-5 h-4 md:h-5" />
            <span className={filter === 'short' ? '' : 'text-primary'}>Short</span>
          </button>
        </div>

        {/* Trade List */}
        <div className="bg-card/95 backdrop-blur-sm border border-border/40 rounded-xl overflow-hidden">
          {filteredTrades.length > 0 ? (
            <div className="divide-y divide-border/50">
              {filteredTrades.map((trade) => (
                <div key={trade.id} className="p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
                        trade.type === 'long' ? 'bg-accent/20' : 'bg-destructive/20'
                      }`}>
                        {trade.type === 'long' ? (
                          <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${trade.pnl >= 0 ? 'text-accent' : 'text-destructive'}`} />
                        ) : (
                          <TrendingDown className={`w-4 h-4 sm:w-5 sm:h-5 ${trade.pnl >= 0 ? 'text-accent' : 'text-destructive'}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground capitalize text-sm">
                          {trade.type === 'long' ? 'Long' : 'Short'} Trade
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(trade.timestamp).toLocaleDateString()} {new Date(trade.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:flex lg:items-center lg:gap-4">
                      <div className="text-center lg:text-left">
                        <p className="text-xs text-muted-foreground">Entry</p>
                        <p className="font-semibold text-foreground text-sm">${formatPrice(trade.entryPrice)}</p>
                      </div>
                      <div className="text-center lg:text-left">
                        <p className="text-xs text-muted-foreground">Exit</p>
                        <p className="font-semibold text-foreground text-sm">${formatPrice(trade.exitPrice)}</p>
                      </div>
                      <div className="text-center lg:text-left">
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="font-semibold text-foreground text-sm flex items-center justify-center lg:justify-start gap-1">
                          <Image src="/btc-logo.svg" alt="BTC" width={16} height={16} className="w-4 h-4" />
                          {trade.quantity.toFixed(6)} BTC
                        </p>
                      </div>
                      <div className="text-center lg:text-right">
                        <p className="text-xs text-muted-foreground">P&L</p>
                        <p className={`font-bold text-base sm:text-lg ${trade.pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                          {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                        </p>
                        <p className={`text-xs ${trade.pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                          {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <History className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-sm sm:text-base">No trades found</p>
              <p className="text-muted-foreground text-xs sm:text-sm mt-2">Start trading to see your history here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
