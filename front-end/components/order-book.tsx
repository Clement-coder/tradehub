'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/glass-card';
import { useTradingContext } from '@/app/context/trading-context';

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export default function OrderBook() {
  const { currentPrice } = useTradingContext();
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);

  useEffect(() => {
    const generateOrders = () => {
      const newBids: OrderBookEntry[] = [];
      const newAsks: OrderBookEntry[] = [];
      
      for (let i = 0; i < 8; i++) {
        const bidPrice = currentPrice - (i + 1) * (Math.random() * 50 + 10);
        const bidAmount = Math.random() * 2 + 0.1;
        newBids.push({
          price: bidPrice,
          amount: bidAmount,
          total: bidPrice * bidAmount,
        });

        const askPrice = currentPrice + (i + 1) * (Math.random() * 50 + 10);
        const askAmount = Math.random() * 2 + 0.1;
        newAsks.push({
          price: askPrice,
          amount: askAmount,
          total: askPrice * askAmount,
        });
      }

      setBids(newBids);
      setAsks(newAsks);
    };

    generateOrders();
    const interval = setInterval(generateOrders, 3000);
    return () => clearInterval(interval);
  }, [currentPrice]);

  const maxTotal = Math.max(
    ...asks.map(a => a.total),
    ...bids.map(b => b.total)
  );

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-semibold mb-3">Order Book</h3>
      
      <div className="space-y-0.5 text-xs font-mono">
        <div className="grid grid-cols-3 gap-2 text-muted-foreground font-sans pb-2 border-b border-border">
          <div>Price</div>
          <div className="text-right">Size</div>
          <div className="text-right">Total</div>
        </div>

        {asks.slice(0, 4).reverse().map((ask, i) => (
          <div key={`ask-${i}`} className="relative grid grid-cols-3 gap-2 py-1">
            <div 
              className="absolute right-0 top-0 bottom-0 bg-red-500/10" 
              style={{ width: `${(ask.total / maxTotal) * 100}%` }}
            />
            <div className="relative text-red-500">${ask.price.toFixed(0)}</div>
            <div className="relative text-right">{ask.amount.toFixed(3)}</div>
            <div className="relative text-right text-muted-foreground">${(ask.total/1000).toFixed(1)}k</div>
          </div>
        ))}

        <div className="py-2 text-center font-bold text-base border-y border-border my-1">
          ${currentPrice.toLocaleString()}
        </div>

        {bids.slice(0, 4).map((bid, i) => (
          <div key={`bid-${i}`} className="relative grid grid-cols-3 gap-2 py-1">
            <div 
              className="absolute right-0 top-0 bottom-0 bg-green-500/10" 
              style={{ width: `${(bid.total / maxTotal) * 100}%` }}
            />
            <div className="relative text-green-500">${bid.price.toFixed(0)}</div>
            <div className="relative text-right">{bid.amount.toFixed(3)}</div>
            <div className="relative text-right text-muted-foreground">${(bid.total/1000).toFixed(1)}k</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
