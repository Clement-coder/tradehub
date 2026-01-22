'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import TradingChart from '@/components/trading-chart';
import TradingInterface from '@/components/trading-interface';
import PositionsTable from '@/components/positions-table';
import TradeHistory from '@/components/trade-history';

export default function TradingPage() {
  const router = useRouter();
  const { user } = useTradingContext();
  const [mounted, setMounted] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Spot Trading</h1>
          </div>
          <p className="text-muted-foreground text-sm">Trade cryptocurrencies on our testnet platform</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Trading Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart and Interface */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">BTC/USD</h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded">1H</span>
                  <button className="text-muted-foreground hover:text-foreground p-1">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <TradingChart />
            </div>
          </div>

          {/* Trading Panel */}
          <TradingInterface />
        </div>

        {/* Positions and History */}
        <div className="grid lg:grid-cols-2 gap-6">
          <PositionsTable />
          <TradeHistory limit={5} />
        </div>
      </div>
    </div>
  );
}
