'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Copy } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { useBTCPrice } from '@/lib/hooks/useBTCPrice';

// Helper function to format currency
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function WalletPage() {
  const router = useRouter();
  const { user } = useTradingContext();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: btcPrice, isLoading: btcPriceLoading } = useBTCPrice();

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

  const copyAddress = () => {
    navigator.clipboard.writeText(user.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const btcEquivalent = btcPrice ? (user?.balance || 0) / btcPrice : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Wallet</h1>
          </div>
          <p className="text-muted-foreground text-sm">Manage your account funds</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-2xl">
        {/* Balance Card */}
        <div className="bg-card border border-border rounded-lg p-8 mb-6">
          <p className="text-muted-foreground text-sm mb-2">Total Balance</p>
          <p className="text-5xl font-bold mb-4">{formatCurrency(user?.balance || 0)}</p>
          <p className="text-xs text-muted-foreground">USDC Balance</p>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-muted-foreground text-sm mb-1">BTC Equivalent</p>
            <p className="text-2xl font-bold text-foreground">
              {btcPriceLoading ? 'Loading...' : `${btcEquivalent.toFixed(6)} BTC`}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-muted-foreground text-sm mb-1">USD Equivalent</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(user?.balance || 0)}</p>
          </div>
        </div>

        {/* Action Buttons - Disabled */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            disabled
            className="group relative inline-flex items-center justify-center gap-2 md:gap-3 px-6 sm:px-8 lg:px-10 py-3 md:py-4 rounded-xl font-semibold text-xs sm:text-sm md:text-base text-primary-foreground bg-gradient-to-r from-primary to-primary/80 shadow-xl transition-all duration-300 transform overflow-hidden opacity-50 cursor-not-allowed"
          >
            Deposit (Agent Only)
          </button>
          <button
            disabled
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-primary/25 to-primary/15 border border-primary/40 opacity-50 cursor-not-allowed"
          >
            <span className="text-primary text-xs sm:text-sm md:text-base">Withdraw (Agent Only)</span>
          </button>
        </div>

        {/* Wallet Info */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6 mb-8">
          {/* Removed Wallet Address section */}

          <div>
            <h3 className="font-semibold text-foreground mb-4">Network</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-sm text-foreground">Network</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">How to Fund Your Wallet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-plus text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Step 1: Contact an Agent</p>
                  <p className="text-sm text-muted-foreground">Reach out to our support team to connect with an agent for funding assistance.</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail text-primary"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Step 2: Provide Your Email</p>
                  <p className="text-sm text-muted-foreground">Share your registered email address with the agent for verification.</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 0 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign text-primary"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Step 3: Specify Amount</p>
                  <p className="text-sm text-muted-foreground">Clearly state the amount you wish to deposit to your account.</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle text-primary"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Step 4: Confirm & Fund</p>
                  <p className="text-sm text-muted-foreground">The agent will confirm and process the transaction to credit your wallet.</p>
                </div>
              </div>
            </div>
            <p className="text-yellow-500 font-semibold text-sm mt-4">
              ⚠️ Funds can only be credited to your wallet through our agents.
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {/* Assuming trades are available from useTradingContext, otherwise display a message */}
            {/* For now, we'll display a placeholder for no transactions */}
            <div className="text-center py-4 text-muted-foreground">
              No recent transactions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
