'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { History, TrendingUp, TrendingDown } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { formatCurrency, formatPrice } from '@/lib/mock-data';

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
      <div className="border-b border-border bg-card">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3 mb-2">
            <History className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold">Trade History</h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">View all your completed trades and performance</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Trades */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '2s'}}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
              <div className="absolute top-0 right-0 bottom-0 w-1 bg-accent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-chart-2"></div>
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-chart-4"></div>
              <div className="absolute top-0 left-0 w-2 h-2 bg-primary rounded-full"></div>
              <div className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-chart-2 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-chart-4 rounded-full"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm rounded-xl p-4 sm:p-6 transition-all duration-300 z-10 m-1 group-hover:bg-card/90">
              <p className="text-muted-foreground text-xs sm:text-sm mb-2">Total Trades</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{trades.length}</p>
            </div>
          </div>

          {/* Total P&L */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '2.2s', animationDelay: '0.3s'}}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent"></div>
              <div className="absolute top-0 right-0 bottom-0 w-1 bg-chart-2"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-chart-4"></div>
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary"></div>
              <div className="absolute top-0 left-0 w-2 h-2 bg-accent rounded-full"></div>
              <div className="absolute top-0 right-0 w-2 h-2 bg-chart-2 rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-chart-4 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-primary rounded-full"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm rounded-xl p-4 sm:p-6 transition-all duration-300 z-10 m-1 group-hover:bg-card/90">
              <p className="text-muted-foreground text-xs sm:text-sm mb-2">Total P&L</p>
              <p className={`text-2xl sm:text-3xl font-bold ${totalPnL >= 0 ? 'text-accent' : 'text-destructive'}`}>
                {formatCurrency(totalPnL)}
              </p>
            </div>
          </div>

          {/* Win Rate */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '2.4s', animationDelay: '0.6s'}}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-chart-2"></div>
              <div className="absolute top-0 right-0 bottom-0 w-1 bg-chart-4"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-accent"></div>
              <div className="absolute top-0 left-0 w-2 h-2 bg-chart-2 rounded-full"></div>
              <div className="absolute top-0 right-0 w-2 h-2 bg-chart-4 rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-accent rounded-full"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm rounded-xl p-4 sm:p-6 transition-all duration-300 z-10 m-1 group-hover:bg-card/90">
              <p className="text-muted-foreground text-xs sm:text-sm mb-2">Win Rate</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{winRate}%</p>
            </div>
          </div>

          {/* Average Trade */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '2.6s', animationDelay: '0.9s'}}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-chart-4"></div>
              <div className="absolute top-0 right-0 bottom-0 w-1 bg-primary"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent"></div>
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-chart-2"></div>
              <div className="absolute top-0 left-0 w-2 h-2 bg-chart-4 rounded-full"></div>
              <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-accent rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-chart-2 rounded-full"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm rounded-xl p-4 sm:p-6 transition-all duration-300 z-10 m-1 group-hover:bg-card/90">
              <p className="text-muted-foreground text-xs sm:text-sm mb-2">Avg. Trade</p>
              <p className={`text-2xl sm:text-3xl font-bold ${averageProfit >= 0 ? 'text-accent' : 'text-destructive'}`}>
                {formatCurrency(averageProfit)}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card/95 backdrop-blur-sm border border-border/40 rounded-xl p-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            All Trades
          </button>
          <button
            onClick={() => setFilter('long')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              filter === 'long'
                ? 'bg-accent text-white shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Long
          </button>
          <button
            onClick={() => setFilter('short')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              filter === 'short'
                ? 'bg-destructive text-white shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Short
          </button>
        </div>

        {/* Trade List */}
        <div className="bg-card/95 backdrop-blur-sm border border-border/40 rounded-xl overflow-hidden">
          {filteredTrades.length > 0 ? (
            <div className="divide-y divide-border/50">
              {filteredTrades.map((trade) => (
                <div key={trade.id} className="p-4 sm:p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                        trade.type === 'long' ? 'bg-accent/20' : 'bg-destructive/20'
                      }`}>
                        {trade.type === 'long' ? (
                          <TrendingUp className={`w-5 h-5 sm:w-6 sm:h-6 ${trade.pnl >= 0 ? 'text-accent' : 'text-destructive'}`} />
                        ) : (
                          <TrendingDown className={`w-5 h-5 sm:w-6 sm:h-6 ${trade.pnl >= 0 ? 'text-accent' : 'text-destructive'}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground capitalize text-sm sm:text-base">
                          {trade.type === 'long' ? 'Long' : 'Short'} Trade
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(trade.timestamp).toLocaleDateString()} {new Date(trade.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:flex lg:items-center lg:gap-6">
                      <div className="text-center lg:text-left">
                        <p className="text-xs sm:text-sm text-muted-foreground">Entry</p>
                        <p className="font-semibold text-foreground text-sm sm:text-base">${formatPrice(trade.entryPrice)}</p>
                      </div>
                      <div className="text-center lg:text-left">
                        <p className="text-xs sm:text-sm text-muted-foreground">Exit</p>
                        <p className="font-semibold text-foreground text-sm sm:text-base">${formatPrice(trade.exitPrice)}</p>
                      </div>
                      <div className="text-center lg:text-left">
                        <p className="text-xs sm:text-sm text-muted-foreground">Amount</p>
                        <p className="font-semibold text-foreground text-sm sm:text-base">{trade.quantity.toFixed(6)} BTC</p>
                      </div>
                      <div className="text-center lg:text-right">
                        <p className="text-xs sm:text-sm text-muted-foreground">P&L</p>
                        <p className={`font-bold text-lg sm:text-xl ${trade.pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                          {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                        </p>
                        <p className={`text-xs sm:text-sm ${trade.pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
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
