'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Wallet, DollarSign, UserPlus, Mail, CheckCircle, History, ArrowDownCircle, ShieldCheck, Clock3, Coins, SendHorizontal, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { useBTCPrice } from '@/lib/hooks/useBTCPrice';
import { CurrencyDisplay } from '@/components/currency-display';
import { usePrivy } from '@privy-io/react-auth';
import { getTransactionHistory, type Transaction } from '@/lib/supabase-service';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function WalletPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { user, updateBalance } = useTradingContext();
  const { data: btcPrice, isLoading: btcPriceLoading } = useBTCPrice();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const NETWORKS = [
    { id: 'Base', logo: '/network-base.svg', fee: 0.25, eta: '1-3 min', description: 'Low-cost Ethereum L2' },
    { id: 'Ethereum', logo: '/network-ethereum.svg', fee: 2.5, eta: '3-10 min', description: 'Mainnet, highest liquidity' },
    { id: 'Arbitrum', logo: '/network-arbitrum.svg', fee: 0.6, eta: '1-5 min', description: 'Fast Ethereum L2' },
    { id: 'Optimism', logo: '/network-optimism.svg', fee: 0.55, eta: '1-5 min', description: 'OP Stack Ethereum L2' },
    { id: 'Polygon', logo: '/network-polygon.svg', fee: 0.35, eta: '1-4 min', description: 'Low-fee sidechain' },
    { id: 'BNB Chain', logo: '/network-bnb.svg', fee: 0.4, eta: '1-4 min', description: 'EVM network with broad support' },
    { id: 'Avalanche', logo: '/network-avalanche.svg', fee: 0.5, eta: '1-5 min', description: 'High-throughput EVM chain' },
    { id: 'zkSync Era', logo: '/network-zksync.svg', fee: 0.45, eta: '1-4 min', description: 'ZK-rollup on Ethereum' },
    { id: 'Linea', logo: '/network-linea.svg', fee: 0.4, eta: '1-4 min', description: 'Consensys zkEVM rollup' },
    { id: 'Scroll', logo: '/network-scroll.svg', fee: 0.42, eta: '1-4 min', description: 'zkEVM for Ethereum' },
  ] as const;
  type NetworkName = (typeof NETWORKS)[number]['id'];
  const [withdrawNetwork, setWithdrawNetwork] = useState<NetworkName>('Base');
  const [withdrawMemo, setWithdrawMemo] = useState('');
  const [withdrawConfirmed, setWithdrawConfirmed] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/auth');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    const loadTransactions = async () => {
      if (user) {
        const txs = await getTransactionHistory(user.id, user.privyUserId);
        setTransactions(txs);
      }
    };
    loadTransactions();
  }, [user]);

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
  const selectedNetwork = NETWORKS.find((network) => network.id === withdrawNetwork) ?? NETWORKS[0];
  const selectedFee = selectedNetwork.fee;
  const parsedWithdrawAmount = Number(withdrawAmount);
  const isWithdrawAmountValid = Number.isFinite(parsedWithdrawAmount) && parsedWithdrawAmount > 0;
  const withdrawAddressIsValid = /^0x[a-fA-F0-9]{40}$/.test(withdrawAddress.trim());
  const totalDebit = isWithdrawAmountValid ? parsedWithdrawAmount + selectedFee : 0;
  const exceedsBalance = isWithdrawAmountValid && totalDebit > user.balance;
  const receiveAmount = isWithdrawAmountValid ? Math.max(parsedWithdrawAmount - selectedFee, 0) : 0;
  const canSubmitWithdraw =
    isWithdrawAmountValid &&
    withdrawAddressIsValid &&
    !exceedsBalance &&
    withdrawConfirmed &&
    !isWithdrawing;

  const resetAmounts = () => {
    setWithdrawAmount('');
    setWithdrawAddress('');
    setWithdrawMemo('');
    setWithdrawNetwork('Base');
    setWithdrawConfirmed(false);
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
    if (!withdrawAddressIsValid) {
      setWithdrawError('Enter a valid destination wallet address.');
      return;
    }
    if (!withdrawConfirmed) {
      setWithdrawError('Please confirm the destination details before continuing.');
      return;
    }

    setIsWithdrawing(true);

    if (user && user.balance >= totalDebit) {
      const success = await updateBalance(-totalDebit, {
        destination_address: withdrawAddress.trim(),
        network: withdrawNetwork,
        memo_or_tag: withdrawMemo.trim() || null,
        requested_amount: amount,
        network_fee: selectedFee,
        net_amount: receiveAmount,
        eta: selectedNetwork.eta,
      });
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
    console.log(`Withdrew: ${amount} to ${withdrawAddress} on ${withdrawNetwork}`);
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
            <Coins className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>Deposit</span>
              <span className="text-[11px] font-medium opacity-80">Contact support agent to fund</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[oklch(0.68_0.11_40)]/20 border border-[oklch(0.68_0.11_40)]/30">
              Agents Only
            </span>
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="group relative overflow-hidden py-3 sm:py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full transition-transform duration-1000"></div>
            <SendHorizontal className="w-5 h-5 relative z-10" />
            <div className="relative z-10 flex flex-col items-start">
              <span>Withdraw</span>
              <span className="text-[11px] font-medium text-white/80">Send to external wallet</span>
            </div>
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
                  <span className="text-sm text-foreground">Base / EVM-compatible</span>
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
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <History className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">No recent transactions</p>
                    <p className="text-sm text-muted-foreground mt-2">Your transaction history will appear here</p>
                  </div>
                ) : (
                  transactions.slice(0, 10).map((tx) => {
                    const isPositive = Number(tx.amount) >= 0;
                    const txType = tx.type === 'deposit' ? 'Deposit' : 
                                   tx.type === 'withdrawal' ? 'Withdrawal' :
                                   tx.type === 'trade_open' ? 'Trade Open' :
                                   tx.type === 'trade_close' ? 'Trade Close' : 'Transaction';
                    
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            {isPositive ? (
                              <ArrowDownLeft className="w-5 h-5 text-green-500" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{txType}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? '+' : ''}<CurrencyDisplay amount={Number(tx.amount)} logoSize={14} />
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Balance: ${Number(tx.balance_after).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-bold">Withdraw</h2>
                </div>
                <button 
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-background border border-border text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Network</label>
                  <div className="grid grid-cols-2 gap-2">
                    {NETWORKS.slice(0, 6).map((network) => (
                      <button
                        key={network.id}
                        onClick={() => setWithdrawNetwork(network.id)}
                        className={`p-2 rounded-lg border text-left text-sm transition-colors ${
                          withdrawNetwork === network.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Image src={network.logo} alt={network.id} width={16} height={16} />
                          <span className="font-medium">{network.id}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Fee: ${network.fee}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-background border border-border text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {formatCurrency(user.balance)}
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee</span>
                    <span>{formatCurrency(selectedFee)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>You receive</span>
                    <span>{formatCurrency(receiveAmount)}</span>
                  </div>
                </div>

                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={withdrawConfirmed}
                    onChange={(e) => setWithdrawConfirmed(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-muted-foreground">I confirm the address and network</span>
                </label>

                {exceedsBalance && (
                  <p className="text-sm text-destructive">Insufficient balance</p>
                )}
                {!withdrawAddressIsValid && withdrawAddress.length > 0 && (
                  <p className="text-sm text-destructive">Invalid address</p>
                )}
                {withdrawError && (
                  <p className="text-sm text-destructive">{withdrawError}</p>
                )}
              </div>

              <div className="flex gap-2 p-4 border-t border-border">
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    resetAmounts();
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={!canSubmitWithdraw}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isWithdrawing ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
