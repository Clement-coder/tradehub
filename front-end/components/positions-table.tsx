'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { useTradingContext } from '@/app/context/trading-context';
import { CurrencyDisplay } from '@/components/currency-display';

// Helper functions to format currency and calculate PnL
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const calculatePnL = (entryPrice: number, currentPrice: number, quantity: number) => {
  const pnl = (currentPrice - entryPrice) * quantity;
  const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
  return { pnl, pnlPercent };
};

export default function PositionsTable() {
  const { positions, currentPrice, closePosition } = useTradingContext();
  const [closingId, setClosingId] = useState<string | null>(null);
  const [closedPositions, setClosedPositions] = useState<string[]>([]);

  const handleClosePosition = (id: string) => {
    setClosingId(id);
    setTimeout(async () => {
      const success = await closePosition(id, currentPrice);
      if (success) {
        setClosedPositions((prev) => [...prev, id]);
      }
      setClosingId(null);
    }, 600);
  };

  if (positions.length === 0) {
    return (
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Open Positions</h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8 text-muted-foreground">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
              <path d="M3 9h18M9 21V9" strokeWidth="2"/>
            </svg>
          </div>
          <p className="text-muted-foreground font-medium">No open positions yet</p>
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
                    {pnl >= 0 ? '+' : ''}<CurrencyDisplay amount={Math.abs(pnl)} logoSize={14} />
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
                className="group relative inline-flex items-center justify-center gap-2 md:gap-3 px-6 sm:px-8 lg:px-10 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base text-primary-foreground bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed w-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {isClosing ? (
                  <>
                    <Check className="w-4 md:w-5 h-4 md:h-5" />
                    Closing...
                  </>
                ) : (
                  <>
                    <X className="w-4 md:w-5 h-4 md:h-5" />
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
