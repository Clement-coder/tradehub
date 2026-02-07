'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Copy, DollarSign, TrendingUp, UserPlus, Mail, CheckCircle, History } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { useBTCPrice } from '@/lib/hooks/useBTCPrice';

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
      <div className="border-b border-border bg-gradient-to-r from-[oklch(0.65_0.15_260)]/10 to-[oklch(0.72_0.12_140)]/10">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[oklch(0.65_0.15_260)]/20 to-[oklch(0.65_0.15_260)]/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[oklch(0.65_0.15_260)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Wallet</h1>
              <p className="text-muted-foreground text-sm">Manage your account funds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-2xl">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[oklch(0.65_0.15_260)]/20 to-[oklch(0.72_0.12_140)]/20 border border-[oklch(0.65_0.15_260)]/30 rounded-xl p-8 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-[oklch(0.65_0.15_260)]" />
            <p className="text-muted-foreground text-sm">Total Balance</p>
          </div>
          <p className="text-5xl font-bold mb-4">{formatCurrency(user?.balance || 0)}</p>
          <p className="text-xs text-muted-foreground">USDC Balance</p>

          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[oklch(0.72_0.12_140)]" />
              <p className="text-muted-foreground text-sm">BTC Equivalent</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {btcPriceLoading ? 'Loading...' : `${btcEquivalent.toFixed(6)} BTC`}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-muted-foreground text-sm mb-1">USD Equivalent</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(user?.balance || 0)}</p>
          </div>
        </div>

        {/* Action Buttons - Disabled */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            disabled
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-white bg-[oklch(0.72_0.12_140)] opacity-50 cursor-not-allowed"
          >
            Deposit (Agent Only)
          </button>
          <button
            disabled
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-white bg-[oklch(0.62_0.13_320)] opacity-50 cursor-not-allowed"
          >
            Withdraw (Agent Only)
          </button>
        </div>

        {/* Wallet Info */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6 mb-8">
          <div>
            <h3 className="font-semibold text-foreground mb-4">Network</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[oklch(0.72_0.12_140)]" />
              <span className="text-sm text-foreground">Network</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">How to Fund Your Wallet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[oklch(0.65_0.15_260)]/10 rounded-lg p-4 flex items-start gap-3 border border-[oklch(0.65_0.15_260)]/30">
                <div className="w-8 h-8 rounded-full bg-[oklch(0.65_0.15_260)]/20 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-5 h-5 text-[oklch(0.65_0.15_260)]" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Step 1: Contact an Agent</p>
                  <p className="text-sm text-muted-foreground">Reach out to our support team to connect with an agent for funding assistance.</p>
                </div>
              </div>
              <div className="bg-[oklch(0.72_0.12_140)]/10 rounded-lg p-4 flex items-start gap-3 border border-[oklch(0.72_0.12_140)]/30">
                <div className="w-8 h-8 rounded-full bg-[oklch(0.72_0.12_140)]/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[oklch(0.72_0.12_140)]" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Step 2: Provide Your Email</p>
                  <p className="text-sm text-muted-foreground">Share your registered email address with the agent for verification.</p>
                </div>
              </div>
              <div className="bg-[oklch(0.68_0.14_180)]/10 rounded-lg p-4 flex items-start gap-3 border border-[oklch(0.68_0.14_180)]/30">
                <div className="w-8 h-8 rounded-full bg-[oklch(0.68_0.14_180)]/20 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-[oklch(0.68_0.14_180)]" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Step 3: Specify Amount</p>
                  <p className="text-sm text-muted-foreground">Clearly state the amount you wish to deposit to your account.</p>
                </div>
              </div>
              <div className="bg-[oklch(0.62_0.13_320)]/10 rounded-lg p-4 flex items-start gap-3 border border-[oklch(0.62_0.13_320)]/30">
                <div className="w-8 h-8 rounded-full bg-[oklch(0.62_0.13_320)]/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-[oklch(0.62_0.13_320)]" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Step 4: Confirm & Fund</p>
                  <p className="text-sm text-muted-foreground">The agent will confirm and process the transaction to credit your wallet.</p>
                </div>
              </div>
            </div>
            <p className="text-[oklch(0.68_0.11_40)] font-semibold text-sm mt-4 bg-[oklch(0.68_0.11_40)]/10 p-3 rounded-lg border border-[oklch(0.68_0.11_40)]/30">
              ⚠️ Funds can only be credited to your wallet through our agents.
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-card border border-[oklch(0.65_0.15_260)]/30 rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-[oklch(0.65_0.15_260)]" />
            Recent Transactions
          </h3>
          <div className="space-y-3">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <History className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No recent transactions</p>
              <p className="text-sm text-muted-foreground mt-2">Your transaction history will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
