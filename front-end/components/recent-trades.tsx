'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/glass-card';
import { useTradingContext } from '@/app/context/trading-context';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RecentTrade {
  price: number;
  amount: number;
  time: string;
  type: 'buy' | 'sell';
}

export default function RecentTrades() {
  const { currentPrice } = useTradingContext();
  const [trades, setTrades] = useState<RecentTrade[]>([]);

  useEffect(() => {
    const addTrade = () => {
      const type = Math.random() > 0.5 ? 'buy' : 'sell';
      const priceVariation = (Math.random() - 0.5) * 100;
      const now = new Date();
      const newTrade: RecentTrade = {
        price: currentPrice + priceVariation,
        amount: Math.random() * 1 + 0.01,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
        type,
      };

      setTrades(prev => [newTrade, ...prev].slice(0, 12));
    };

    addTrade();
    const interval = setInterval(addTrade, 2000);
    return () => clearInterval(interval);
  }, [currentPrice]);

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-semibold mb-3">Recent Trades</h3>
      
      <div className="space-y-0.5 text-xs font-mono">
        <div className="grid grid-cols-3 gap-2 text-muted-foreground font-sans pb-2 border-b border-border">
          <div>Price</div>
          <div className="text-right">Size</div>
          <div className="text-right">Time</div>
        </div>

        {trades.map((trade, i) => (
          <div 
            key={i} 
            className={`grid grid-cols-3 gap-2 py-1 ${trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}
          >
            <div className="flex items-center gap-1">
              {trade.type === 'buy' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              ${trade.price.toFixed(0)}
            </div>
            <div className="text-right">{trade.amount.toFixed(3)}</div>
            <div className="text-right text-muted-foreground">{trade.time}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
