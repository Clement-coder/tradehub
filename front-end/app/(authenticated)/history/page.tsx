'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
        <div className="px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <History className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Trade History</h1>
          </div>
          <p className="text-muted-foreground text-sm">View all your completed trades</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Total Trades</p>
            <p className="text-3xl font-bold text-foreground">{trades.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Total P&L</p>
            <p className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-accent' : 'text-destructive'}`}>
              {formatCurrency(totalPnL)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Win Rate</p>
            <p className="text-3xl font-bold text-foreground">{winRate}%</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Avg. Trade</p>
            <p className={`text-3xl font-bold ${averageProfit >= 0 ? 'text-accent' : 'text-destructive'}`}>
              {formatCurrency(averageProfit)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Trades
          </button>
          <button
            onClick={() => setFilter('long')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === 'long'
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Long
          </button>
          <button
            onClick={() => setFilter('short')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === 'short'
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Short
          </button>
        </div>

        {/* Trade List */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {filteredTrades.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredTrades.map((trade) => (
                <div key={trade.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        trade.type === 'long' ? 'bg-accent/10' : 'bg-destructive/10'
                      }`}>
                        {trade.type === 'long' ? (
                          <TrendingUp className={`w-5 h-5 ${trade.pnl >= 0 ? 'text-accent' : 'text-destructive'}`} />
                        ) : (
                          <TrendingDown className={`w-5 h-5 ${trade.pnl >= 0 ? 'text-accent' : 'text-destructive'}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {trade.type === 'long' ? 'Long' : 'Short'} Trade
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(trade.timestamp).toLocaleDateString()} {new Date(trade.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Entry</p>
                          <p className="font-semibold text-foreground">${formatPrice(trade.entryPrice)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Exit</p>
                          <p className="font-semibold text-foreground">${formatPrice(trade.exitPrice)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-semibold text-foreground">{trade.quantity.toFixed(6)} BTC</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">P&L</p>
                          <p className={`font-bold text-lg ${trade.pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                            {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                          </p>
                          <p className={`text-xs ${trade.pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                            {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No trades found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
