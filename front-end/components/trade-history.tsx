'use client';

import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { useTradingContext } from '@/app/context/trading-context';
import { formatCurrency } from '@/lib/mock-data';

interface TradeHistoryProps {
  limit?: number;
}

export default function TradeHistory({ limit }: TradeHistoryProps = {}) {
  const { trades } = useTradingContext();
  const displayTrades = limit ? trades.slice(0, limit) : trades;

  if (trades.length === 0) {
    return (
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Trade History</h2>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No trades yet</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Trade History</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {displayTrades.map((trade) => (
          <div
            key={trade.id}
            className="p-4 rounded-lg bg-muted/30 dark:bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-lg ${trade.type === 'long' ? 'bg-accent/20' : 'bg-destructive/20'}`}>
                  {trade.type === 'long' ? (
                    <ArrowUpRight className="w-4 h-4 text-accent" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {trade.type === 'long' ? 'Long' : 'Short'} {trade.quantity.toFixed(6)} BTC
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Entry: ${trade.entryPrice.toLocaleString()} → Exit: ${trade.exitPrice.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${trade.pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                </p>
                <p className={`text-xs ${trade.pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {trade.pnl >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
