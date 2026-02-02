'use client';

import { useBalance } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { TrendingUp, Wallet, BarChart3, DollarSign, Activity, History as HistoryIcon } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { BtcPriceChart } from '@/components/btc-price-chart';

// Helper functions to format currency and price
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatPrice = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export default function DashboardPage() {
  const router = useRouter();
  const { authenticated, ready, user: privyUser } = usePrivy();
  const { user, positions, trades, currentPrice, setUser } = useTradingContext();
  const [mounted, setMounted] = useState(false);
  const { data: balance } = useBalance({ address: privyUser?.wallet?.address as `0x${string}` });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && ready && !authenticated) {
      router.push('/auth');
    }
  }, [mounted, ready, authenticated, router]);

  useEffect(() => {
    if (mounted && ready && authenticated && privyUser && !user && balance) {
      // Determine login method
      let loginMethod = 'Unknown';
      if (privyUser.linkedAccounts) {
        const emailAccount = privyUser.linkedAccounts.find(acc => acc.type === 'email');
        const googleAccount = privyUser.linkedAccounts.find(acc => acc.type === 'google_oauth');
        const walletAccount = privyUser.linkedAccounts.find(acc => acc.type === 'wallet');

        if (googleAccount) {
          loginMethod = 'Google';
        } else if (emailAccount) {
          loginMethod = 'Email';
        } else if (walletAccount) {
          loginMethod = 'Wallet';
        }
      }

      // Initialize user with real wallet data
      setUser({
        id: privyUser.id,
        email: privyUser.email?.address || '',
        walletAddress: privyUser.wallet?.address || '',
        balance: balance ? parseFloat((Number(balance.value) / Math.pow(10, balance.decimals)).toFixed(6)) : 0,
        name: privyUser.google?.name || privyUser.email?.address?.split('@')[0] || '',
        loginMethod: loginMethod,
        createdAt: privyUser.createdAt.getTime(),
      });
    }
  }, [mounted, ready, authenticated, privyUser, user, setUser, balance]);

  if (!mounted || !ready || !authenticated) {
    return null;
  }

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const positionsValue = positions.reduce((sum, pos) => sum + (pos.quantity * currentPrice), 0);
  const portfolioValue = (user?.balance || 0) + positionsValue;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header - Responsive */}
      <div className="border-b border-border/40 bg-card/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">Your trading portfolio overview</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Portfolio Cards Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Balance */}
          <div className="group relative z-20">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '2s'}}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
              <div className="absolute top-0 right-0 bottom-0 w-1 bg-accent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-chart-2"></div>
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-chart-4"></div>
              {/* Corner dots */}
              <div className="absolute top-0 left-0 w-2 h-2 bg-primary rounded-full"></div>
              <div className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-chart-2 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-chart-4 rounded-full"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm rounded-xl p-5 sm:p-6 hover:shadow-lg transition-all duration-300 m-1 group-hover:bg-card/90">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Balance</h3>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/15 transition-all duration-300">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{formatCurrency(user?.balance || 0)}</p>
              <p className="text-xs text-muted-foreground">Available to trade</p>
            </div>
          </div>

          {/* Portfolio Value */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '2.2s', animationDelay: '0.3s'}}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent"></div>
              <div className="absolute top-0 right-0 bottom-0 w-1 bg-chart-2"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-chart-4"></div>
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary"></div>
              {/* Corner dots */}
              <div className="absolute top-0 left-0 w-2 h-2 bg-accent rounded-full"></div>
              <div className="absolute top-0 right-0 w-2 h-2 bg-chart-2 rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-chart-4 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-primary rounded-full"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm rounded-xl p-5 sm:p-6 hover:shadow-lg transition-all duration-300 z-10 m-1 group-hover:bg-card/90">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Portfolio</h3>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/15 transition-all duration-300">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-accent group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{formatCurrency(portfolioValue)}</p>
              <p className="text-xs text-muted-foreground">Total value</p>
            </div>
          </div>

          {/* Total P&L */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '2.4s', animationDelay: '0.6s'}}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-chart-2"></div>
              <div className="absolute top-0 right-0 bottom-0 w-1 bg-chart-4"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-accent"></div>
              {/* Corner dots */}
              <div className="absolute top-0 left-0 w-2 h-2 bg-chart-2 rounded-full"></div>
              <div className="absolute top-0 right-0 w-2 h-2 bg-chart-4 rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-accent rounded-full"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm rounded-xl p-5 sm:p-6 hover:shadow-lg transition-all duration-300 z-10 m-1 group-hover:bg-card/90">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total P&L</h3>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-chart-2/20 to-chart-2/10 flex items-center justify-center group-hover:from-chart-2/30 group-hover:to-chart-2/15 transition-all duration-300">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-chart-2 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-bold mb-1 ${totalPnL >= 0 ? 'text-accent' : 'text-destructive'}`}>
                {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
              </p>
              <p className="text-xs text-muted-foreground">All closed trades</p>
            </div>
          </div>

          {/* BTC Price */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '2.6s', animationDelay: '0.9s'}}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-chart-4"></div>
              <div className="absolute top-0 right-0 bottom-0 w-1 bg-primary"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent"></div>
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-chart-2"></div>
              {/* Corner dots */}
              <div className="absolute top-0 left-0 w-2 h-2 bg-chart-4 rounded-full"></div>
              <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-accent rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-chart-2 rounded-full"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm rounded-xl p-5 sm:p-6 hover:shadow-lg transition-all duration-300 z-10 m-1 group-hover:bg-card/90">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">BTC Price</h3>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-chart-4/20 to-chart-4/10 flex items-center justify-center group-hover:from-chart-4/30 group-hover:to-chart-4/15 transition-all duration-300">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-chart-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">${formatPrice(currentPrice)}</p>
              <p className="text-xs text-muted-foreground">Current price</p>
            </div>
          </div>
        </div>

        {/* BTC Price Chart */}
        <div className="bg-card/95 backdrop-blur-sm border border-border/40 rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4">BTC Price (24h)</h3>
          <BtcPriceChart />
        </div>

        {/* Quick Stats - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-card/95 backdrop-blur-sm border border-border/40 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">Open Positions</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{positions.length}</p>
          </div>
          <div className="bg-card/95 backdrop-blur-sm border border-border/40 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:border-accent/30 transition-all duration-300">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">Total Trades</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{trades.length}</p>
          </div>
          <div className="bg-card/95 backdrop-blur-sm border border-border/40 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:border-chart-2/30 transition-all duration-300">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">Winning Trades</p>
            <p className="text-xl sm:text-2xl font-bold text-accent">
              {trades.filter((t) => t.pnl > 0).length} / {trades.length}
            </p>
          </div>
        </div>

        {/* Getting Started Guide - Enhanced Responsive */}
        <div className="bg-gradient-to-br from-card/95 via-card/90 to-primary/5 backdrop-blur-sm border border-border/40 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-lg">
          {/* Background decoration - optimized opacity */}
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-tr from-accent/15 to-transparent rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 sm:w-48 h-40 sm:h-48 bg-gradient-to-br from-chart-2/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Getting Started</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Follow these steps to start trading</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Step 1 - Trading */}
              <div className="group relative">
                {/* Animated border */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-chart-2/30 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
                </div>
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden animate-pulse" style={{animationDuration: '3s'}}>
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                  <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-accent/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-chart-2/50 to-transparent"></div>
                  <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-chart-4/50 to-transparent"></div>
                </div>
                
                <div className="relative p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-card/95 backdrop-blur-sm group-hover:scale-105 transition-all duration-300 z-10 m-0.5">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/25 to-primary/15 flex items-center justify-center group-hover:from-primary/35 group-hover:to-primary/20 transition-all duration-300 shadow-lg shadow-primary/10">
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg shadow-primary/30">
                      1
                    </div>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg mb-2 text-foreground">Start Trading</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-4">
                    Visit the <span className="font-semibold text-primary">Trading</span> page to start buying and selling BTC with real-time charts
                  </p>
                  <div className="flex items-center gap-2 text-xs text-primary font-medium">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50"></div>
                    Ready to trade
                  </div>
                </div>
              </div>

              {/* Step 2 - Wallet */}
              <div className="group relative">
                {/* Animated border */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/30 via-chart-2/30 to-chart-4/30 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
                </div>
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden animate-pulse" style={{animationDuration: '3s', animationDelay: '0.5s'}}>
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
                  <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-chart-2/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-chart-4/50 to-transparent"></div>
                  <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary/50 to-transparent"></div>
                </div>
                
                <div className="relative p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-card/95 backdrop-blur-sm group-hover:scale-105 transition-all duration-300 z-10 m-0.5">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-accent/25 to-accent/15 flex items-center justify-center group-hover:from-accent/35 group-hover:to-accent/20 transition-all duration-300 shadow-lg shadow-accent/10">
                      <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-accent group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-accent to-accent/80 text-white flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg shadow-accent/30">
                      2
                    </div>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg mb-2 text-foreground">Manage Wallet</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-4">
                    Check your <span className="font-semibold text-accent">Wallet</span> to manage your balance and track your funds
                  </p>
                  <div className="flex items-center gap-2 text-xs text-accent font-medium">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-lg shadow-accent/50"></div>
                    {formatCurrency(user?.balance || 0)} available
                  </div>
                </div>
              </div>

              {/* Step 3 - History */}
              <div className="group relative">
                {/* Animated border */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-chart-2/30 via-chart-4/30 to-primary/30 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
                </div>
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden animate-pulse" style={{animationDuration: '3s', animationDelay: '1s'}}>
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-chart-2/50 to-transparent"></div>
                  <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-chart-4/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                  <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-accent/50 to-transparent"></div>
                </div>
                
                <div className="relative p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl bg-card/95 backdrop-blur-sm group-hover:scale-105 transition-all duration-300 z-10 m-0.5">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-chart-2/25 to-chart-2/15 flex items-center justify-center group-hover:from-chart-2/35 group-hover:to-chart-2/20 transition-all duration-300 shadow-lg shadow-chart-2/10">
                      <HistoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-chart-2 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-chart-2 to-chart-2/80 text-white flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg shadow-chart-2/30">
                      3
                    </div>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg mb-2 text-foreground">Track History</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-4">
                    View <span className="font-semibold text-chart-2">History</span> to track all your trades and transactions with detailed analytics
                  </p>
                  <div className="flex items-center gap-2 text-xs text-chart-2 font-medium">
                    <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse shadow-lg shadow-chart-2/50"></div>
                    {trades.length} trades completed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}