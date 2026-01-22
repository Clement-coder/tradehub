'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { useTradingContext } from '@/app/context/trading-context';
import { calculatePnL, formatCurrency } from '@/lib/mock-data';

export default function PositionsTable() {
  const { positions, currentPrice, closePosition } = useTradingContext();
  const [closingId, setClosingId] = useState<string | null>(null);
  const [closedPositions, setClosedPositions] = useState<string[]>([]);

  const handleClosePosition = (id: string) => {
    setClosingId(id);
    setTimeout(() => {
      closePosition(id, currentPrice);
      setClosedPositions((prev) => [...prev, id]);
      setClosingId(null);
    }, 600);
  };

  if (positions.length === 0) {
    return (
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Open Positions</h2>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No open positions yet</p>
          <p className="text-sm text-muted-foreground mt-2">Start trading to open a position</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Open Positions</h2>
      <div className="space-y-4">
        {positions.map((position) => {
          const { pnl, pnlPercent } = calculatePnL(position.entryPrice, currentPrice, position.quantity);
          const isClosing = closingId === position.id;

          return (
            <div
              key={position.id}
              className={`p-4 rounded-lg bg-muted/30 dark:bg-white/5 border border-white/10 transition-all ${
                isClosing ? 'opacity-50' : 'opacity-100'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {position.type === 'long' ? 'Long' : 'Short'} {position.quantity.toFixed(6)} BTC
                  </p>
                  <p className="text-xs text-muted-foreground">Entry: ${position.entryPrice.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                  </p>
                  <p className={`text-xs ${pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-muted-foreground mb-3 pb-3 border-b border-white/10">
                <span>Current: ${currentPrice.toLocaleString()}</span>
                <span>{position.quantity.toFixed(6)} BTC</span>
              </div>

              <button
                onClick={() => handleClosePosition(position.id)}
                disabled={isClosing}
                className="w-full py-2 px-3 rounded-lg text-sm font-medium text-white bg-primary/80 hover:bg-primary disabled:bg-primary/50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isClosing ? (
                  <>
                    <Check className="w-4 h-4" />
                    Closing...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Close Position
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
