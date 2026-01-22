'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TrendingUp, Wallet, BarChart3, DollarSign, Activity } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { formatCurrency, formatPrice } from '@/lib/mock-data';

export default function DashboardPage() {
  const router = useRouter();
  const { user, positions, trades, currentPrice } = useTradingContext();
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

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const positionsValue = positions.reduce((sum, pos) => sum + (pos.quantity * currentPrice), 0);
  const portfolioValue = user.balance + positionsValue;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-sm">Your trading portfolio overview</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Portfolio Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Balance */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Balance</h3>
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{formatCurrency(user.balance)}</p>
            <p className="text-xs text-muted-foreground">Available to trade</p>
          </div>

          {/* Portfolio Value */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Portfolio</h3>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{formatCurrency(portfolioValue)}</p>
            <p className="text-xs text-muted-foreground">Total value</p>
          </div>

          {/* Total P&L */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total P&L</h3>
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <p className={`text-3xl font-bold mb-1 ${totalPnL >= 0 ? 'text-accent' : 'text-destructive'}`}>
              {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
            </p>
            <p className="text-xs text-muted-foreground">All closed trades</p>
          </div>

          {/* BTC Price */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">BTC Price</h3>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">${formatPrice(currentPrice)}</p>
            <p className="text-xs text-muted-foreground">Current price</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Open Positions</p>
            <p className="text-2xl font-bold text-foreground">{positions.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Total Trades</p>
            <p className="text-2xl font-bold text-foreground">{trades.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Winning Trades</p>
            <p className="text-2xl font-bold text-accent">
              {trades.filter((t) => t.pnl > 0).length} / {trades.length}
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Getting Started</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-foreground">Visit the <span className="font-medium">Trading</span> page to start buying and selling BTC</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-foreground">Check your <span className="font-medium">Wallet</span> to manage your balance and deposit funds</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-foreground">View <span className="font-medium">History</span> to track all your trades and transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
