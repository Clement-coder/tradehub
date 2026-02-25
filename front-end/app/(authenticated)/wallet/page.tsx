'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Wallet, DollarSign, UserPlus, Mail, CheckCircle, History } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { useBTCPrice } from '@/lib/hooks/useBTCPrice';
import { CurrencyDisplay } from '@/components/currency-display';
import { usePrivy } from '@privy-io/react-auth';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function WalletPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { user, updateBalance } = useTradingContext();
  const { data: btcPrice, isLoading: btcPriceLoading } = useBTCPrice();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/auth');
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return <div className="min-h-screen bg-background p-6">Loading...</div>;
  }

  if (!authenticated) {
    return null;
  }

  if (!user) {
    return <div className="min-h-screen bg-background p-6">Loading account...</div>;
  }

  if (!ready || !authenticated || !user) {
    return null;
  }

  const btcEquivalent = btcPrice ? (user?.balance || 0) / btcPrice : 0;
  const usdBalance = user?.balance || 0;
  const eurEquivalent = usdBalance * 0.92;
  const gbpEquivalent = usdBalance * 0.79;
  const usdcEquivalent = usdBalance;
  const usdtEquivalent = usdBalance;
  const parsedWithdrawAmount = Number(withdrawAmount);
  const isWithdrawAmountValid = Number.isFinite(parsedWithdrawAmount) && parsedWithdrawAmount > 0;
  const exceedsBalance = isWithdrawAmountValid && parsedWithdrawAmount > user.balance;
  const canSubmitWithdraw = isWithdrawAmountValid && !exceedsBalance && !isWithdrawing;

  const resetAmounts = () => {
    setWithdrawAmount('');
    setWithdrawError('');
  };

  const handleWithdraw = async () => {
    setWithdrawError('');
    if (!withdrawAmount) return;
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('Enter a valid amount.');
      return;
    }

    setIsWithdrawing(true);

    if (user && user.balance >= amount) {
      const success = await updateBalance(-amount);
      if (!success) {
        setWithdrawError('Withdrawal failed. Please try again.');
        setIsWithdrawing(false);
        return;
      }
    } else {
      setWithdrawError('Insufficient balance for withdrawal.');
      setIsWithdrawing(false);
      return;
    }
    resetAmounts();
    setShowWithdrawModal(false);
    setIsWithdrawing(false);
    console.log(`Withdrew: ${amount}`);
  };

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
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        {/* Balance Card */}
        <div className="group relative mb-6">
          <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s'}}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.65_0.15_260)]/60 to-transparent"></div>
            <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.72_0.12_140)]/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
            <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
          </div>
          <div className="relative bg-gradient-to-br from-[oklch(0.65_0.15_260)]/20 to-[oklch(0.72_0.12_140)]/20 border border-[oklch(0.65_0.15_260)]/30 rounded-xl p-6 sm:p-8 m-px overflow-hidden group-hover:scale-[1.01] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.65_0.15_260)]/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Image src="/usdc-logo.svg" alt="USDC" width={32} height={32} className="w-8 h-8" />
                <p className="text-muted-foreground text-sm">Total Balance</p>
              </div>
              <p className="text-4xl sm:text-5xl font-bold mb-4"><CurrencyDisplay amount={user?.balance || 0} logoSize={0} /></p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Image src="/usdc-logo.svg" alt="USDC" width={16} height={16} className="w-4 h-4" />
                USDC Balance
              </p>

              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Image src="/btc-logo.svg" alt="BTC" width={20} height={20} className="w-5 h-5" />
                  <p className="text-muted-foreground text-sm">BTC Equivalent</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {btcPriceLoading ? 'Loading...' : `${btcEquivalent.toFixed(6)} BTC`}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Image src="/usdc-logo.svg" alt="USD" width={20} height={20} className="w-5 h-5" />
                  <p className="text-muted-foreground text-sm">USD Equivalent</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground"><CurrencyDisplay amount={user?.balance || 0} logoSize={0} /></p>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-muted-foreground text-sm mb-2">Display Conversions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-3 py-2">
                    <div className="flex items-center gap-2 text-foreground">
                      <Image src="/eur-logo.svg" alt="EUR" width={20} height={20} className="w-5 h-5" />
                      <span className="font-semibold">EUR</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-foreground">{formatCurrency(eurEquivalent).replace('$', 'EUR ')}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-3 py-2">
                    <div className="flex items-center gap-2 text-foreground">
                      <Image src="/gbp-logo.svg" alt="GBP" width={20} height={20} className="w-5 h-5" />
                      <span className="font-semibold">GBP</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-foreground">{formatCurrency(gbpEquivalent).replace('$', 'GBP ')}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-3 py-2">
                    <div className="flex items-center gap-2 text-foreground">
                      <Image src="/usdc-logo.svg" alt="USDC" width={20} height={20} className="w-5 h-5" />
                      <span className="font-semibold">USDC</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-foreground">{usdcEquivalent.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-3 py-2">
                    <div className="flex items-center gap-2 text-foreground">
                      <Image src="/usdt-logo.svg" alt="USDT" width={20} height={20} className="w-5 h-5" />
                      <span className="font-semibold">USDT</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-foreground">{usdtEquivalent.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
          <button
            disabled
            className="relative py-3 sm:py-4 px-6 rounded-xl font-semibold text-[oklch(0.68_0.11_40)] bg-[oklch(0.68_0.11_40)]/10 border border-[oklch(0.68_0.11_40)]/30 flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <span>Deposit</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[oklch(0.68_0.11_40)]/20 border border-[oklch(0.68_0.11_40)]/30">
              Agents Only
            </span>
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="group relative overflow-hidden py-3 sm:py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full transition-transform duration-1000"></div>
            <span className="relative z-10">Withdraw</span>
          </button>
        </div>

        {/* Wallet Info */}
        <div className="group relative mb-8">
          <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s', animationDelay: '0.5s'}}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.15_260)]/60 to-transparent"></div>
            <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.65_0.12_140)]/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
            <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
          </div>
          <div className="relative bg-card/95 backdrop-blur-sm border border-border/40 rounded-xl p-4 sm:p-6 space-y-6 m-px overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.55_0.15_260)]/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
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
          </div>
        </div>

        {/* Transaction History */}
        <div className="group relative">
          <div className="absolute inset-0 rounded-xl overflow-hidden animate-pulse" style={{animationDuration: '3s', animationDelay: '1s'}}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.65_0.15_260)]/60 to-transparent"></div>
            <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.72_0.12_140)]/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.6_0.14_180)]/60 to-transparent"></div>
            <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[oklch(0.5_0.13_320)]/60 to-transparent"></div>
          </div>
          <div className="relative bg-card/95 backdrop-blur-sm border border-[oklch(0.65_0.15_260)]/30 rounded-xl p-4 sm:p-6 m-px overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.65_0.15_260)]/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
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

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card/95 backdrop-blur-xl p-6 rounded-lg shadow-lg w-full max-w-md border border-border">
              <h2 className="text-xl font-bold mb-4">Withdraw Funds</h2>
              <div className="mb-4 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
                <p className="font-semibold text-foreground mb-2">Withdrawal Requirements</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>1. Enter a valid amount greater than 0.</li>
                  <li>2. Amount must be less than or equal to your available balance.</li>
                  <li>3. Withdrawal updates your Supabase balance immediately.</li>
                  <li>4. If you need funding, deposits are handled by agents only.</li>
                </ul>
              </div>
              <input
                type="number"
                placeholder="Amount to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full p-3 rounded-md bg-background border border-border mb-4 text-foreground"
              />
              <p className="text-xs text-muted-foreground mb-2">
                Available: {formatCurrency(user.balance)}
              </p>
              {exceedsBalance && (
                <p className="text-sm text-destructive mb-3">Amount exceeds your available balance.</p>
              )}
              {withdrawError && (
                <p className="text-sm text-destructive mb-3">{withdrawError}</p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 rounded-md border border-border text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={!canSubmitWithdraw}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isWithdrawing ? 'Processing...' : 'Confirm Withdraw'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
