'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { History, ArrowUpRight, ArrowDownLeft, CreditCard, Wallet } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { CurrencyDisplay } from '@/components/currency-display';
import { usePrivy } from '@privy-io/react-auth';
import { FuturisticLoader } from '@/components/futuristic-loader';
import { OfflineDetector } from '@/components/offline-detector';
import { getTransactionHistory } from '@/lib/supabase-service';
import { Transaction } from '@/lib/supabase';

// Helper functions to format currency and price
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export default function HistoryPage() {
  const router = useRouter();
  const { ready, authenticated, user: privyUser } = usePrivy();
  const { user } = useTradingContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'trade_open' | 'trade_close'>('all');

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/auth');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user && privyUser) {
        setLoading(true);
        try {
          const txHistory = await getTransactionHistory(user.id, privyUser.id);
          setTransactions(txHistory);
        } catch (error) {
          console.error('Error fetching transactions:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTransactions();
  }, [user, privyUser]);

  if (!ready || loading) {
    return <FuturisticLoader />;
  }

  if (!authenticated) {
    return null;
  }

  if (!user) {
    return <FuturisticLoader />;
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const totalTransactions = transactions.length;
  const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + Number(t.amount), 0);
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />;
      case 'trade_open':
      case 'trade_close':
        return <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />;
      default:
        return <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-accent/20';
      case 'withdrawal':
        return 'bg-destructive/20';
      case 'trade_open':
      case 'trade_close':
        return 'bg-primary/20';
      default:
        return 'bg-muted/20';
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Bank Transfer';
      case 'trade_open':
        return 'Trade Open';
      case 'trade_close':
        return 'Trade Close';
      default:
        return type;
    }
  };

  const getBankDetails = (metadata: Record<string, unknown> | null) => {
    if (!metadata) return null;
    return {
      bankName: metadata.bank_name as string,
      accountNumber: metadata.account_number as string,
      routingNumber: metadata.routing_number as string,
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <OfflineDetector />
      {/* Page Header */}
      <div className="border-b border-border bg-gradient-to-r from-[oklch(0.68_0.14_180)]/10 to-[oklch(0.62_0.13_320)]/10">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3 mb-2">
            <History className="w-6 h-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold">Transaction History</h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">View all your deposits, withdrawals, and trading transactions</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Transactions */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.15_260)]/60 to-transparent"></div>
              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.65_0.12_140)]/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
              <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.55_0.15_260)]/30 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.55_0.15_260)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <p className="text-muted-foreground text-xs sm:text-sm mb-2">Total Transactions</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalTransactions}</p>
              </div>
            </div>
          </div>

          {/* Total Deposits */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s', animationDelay: '0.5s'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.65_0.12_140)]/60 to-transparent"></div>
              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
              <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.55_0.15_260)]/60 to-transparent"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.65_0.12_140)]/30 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.65_0.12_140)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <p className="text-muted-foreground text-xs sm:text-sm mb-2">Total Deposits</p>
                <p className="text-2xl sm:text-3xl font-bold text-accent">
                  <CurrencyDisplay amount={totalDeposits} logoSize={0} />
                </p>
              </div>
            </div>
          </div>

          {/* Total Withdrawals */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s', animationDelay: '1s'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.15_260)]/60 to-transparent"></div>
              <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.65_0.12_140)]/60 to-transparent"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.6_0.14_180)]/30 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.6_0.14_180)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <p className="text-muted-foreground text-xs sm:text-sm mb-2">Total Withdrawals</p>
                <p className="text-2xl sm:text-3xl font-bold text-destructive">
                  <CurrencyDisplay amount={totalWithdrawals} logoSize={0} />
                </p>
              </div>
            </div>
          </div>

          {/* Pending Transactions */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s', animationDelay: '1.5s'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.55_0.15_260)]/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.65_0.12_140)]/60 to-transparent"></div>
              <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
            </div>
            <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.5_0.13_320)]/30 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 m-px overflow-hidden group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.5_0.13_320)]/15 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <p className="text-muted-foreground text-xs sm:text-sm mb-2">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{pendingTransactions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card/95 backdrop-blur-sm border border-border/40 rounded-xl p-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`transition-all duration-200 ${
              filter === 'all'
                ? 'group relative inline-flex items-center justify-center gap-2 md:gap-3 px-6 sm:px-8 lg:px-10 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base text-primary-foreground bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden'
                : 'flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-primary/25 to-primary/15 border border-primary/40'
            }`}
          >
            {filter === 'all' && <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>}
            <span className={filter === 'all' ? '' : 'text-primary'}>All Transactions</span>
          </button>
          <button
            onClick={() => setFilter('deposit')}
            className={`transition-all duration-200 ${
              filter === 'deposit'
                ? 'group relative inline-flex items-center justify-center gap-2 md:gap-3 px-6 sm:px-8 lg:px-10 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base text-primary-foreground bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden'
                : 'flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-primary/25 to-primary/15 border border-primary/40'
            }`}
          >
            {filter === 'deposit' && <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>}
            <ArrowDownLeft className="w-4 md:w-5 h-4 md:h-5" />
            <span className={filter === 'deposit' ? '' : 'text-primary'}>Deposits</span>
          </button>
          <button
            onClick={() => setFilter('withdrawal')}
            className={`transition-all duration-200 ${
              filter === 'withdrawal'
                ? 'group relative inline-flex items-center justify-center gap-2 md:gap-3 px-6 sm:px-8 lg:px-10 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base text-primary-foreground bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden'
                : 'flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-primary/25 to-primary/15 border border-primary/40'
            }`}
          >
            {filter === 'withdrawal' && <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>}
            <ArrowUpRight className="w-4 md:w-5 h-4 md:h-5" />
            <span className={filter === 'withdrawal' ? '' : 'text-primary'}>Bank Transfers</span>
          </button>
          <button
            onClick={() => setFilter('trade_open')}
            className={`transition-all duration-200 ${
              filter === 'trade_open'
                ? 'group relative inline-flex items-center justify-center gap-2 md:gap-3 px-6 sm:px-8 lg:px-10 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base text-primary-foreground bg-gradient-to-r from-blue-500 to-blue-500/80 hover:from-blue-500/90 hover:to-blue-500/70 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden'
                : 'flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-primary/25 to-primary/15 border border-primary/40'
            }`}
          >
            {filter === 'trade_open' && <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>}
            <CreditCard className="w-4 md:w-5 h-4 md:h-5" />
            <span className={filter === 'trade_open' ? '' : 'text-primary'}>Trades</span>
          </button>
        </div>

        {/* Transaction List */}
        <div className="bg-card/95 backdrop-blur-sm border border-border/40 rounded-xl overflow-hidden">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-border/50">
              {filteredTransactions.map((transaction) => {
                const bankDetails = getBankDetails(transaction.metadata);
                return (
                  <div key={transaction.id} className="p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {formatTransactionType(transaction.type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()} {new Date(transaction.created_at).toLocaleTimeString()}
                          </p>
                          {transaction.type === 'withdrawal' && bankDetails && (
                            <p className="text-xs text-muted-foreground mt-1">
                              To: {bankDetails.bankName} ****{bankDetails.accountNumber?.slice(-4)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:flex lg:items-center lg:gap-4">
                        <div className="text-center lg:text-left">
                          <p className="text-xs text-muted-foreground">Transaction Type</p>
                          <p className="font-semibold text-foreground text-sm capitalize">{transaction.type.replace('_', ' ')}</p>
                        </div>
                        <div className="text-center lg:text-left">
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="font-semibold text-foreground text-sm">
                            <CurrencyDisplay amount={Number(transaction.amount)} logoSize={16} />
                          </p>
                        </div>
                        <div className="text-center lg:text-right">
                          <p className="text-xs text-muted-foreground">Status</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'completed' ? 'bg-accent/20 text-accent' :
                            transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' :
                            'bg-destructive/20 text-destructive'
                          }`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bank Transfer Details */}
                    {transaction.type === 'withdrawal' && bankDetails && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Bank: </span>
                            <span className="text-foreground font-medium">{bankDetails.bankName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Account: </span>
                            <span className="text-foreground font-medium">****{bankDetails.accountNumber?.slice(-4)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Routing: </span>
                            <span className="text-foreground font-medium">{bankDetails.routingNumber}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <History className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-sm sm:text-base">No transactions found</p>
              <p className="text-muted-foreground text-xs sm:text-sm mt-2">Your transaction history will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
