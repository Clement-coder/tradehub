'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Wallet, DollarSign, UserPlus, Mail, CheckCircle, History, ArrowDownCircle, ShieldCheck, Clock3, Coins, SendHorizontal, ArrowUpRight, ArrowDownLeft, Download, Share2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { useBTCPrice } from '@/lib/hooks/useBTCPrice';
import { CurrencyDisplay } from '@/components/currency-display';
import { usePrivy } from '@privy-io/react-auth';
import { getTransactionHistory, type Transaction } from '@/lib/supabase-service';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import { FuturisticLoader } from '@/components/futuristic-loader';
import { OfflineDetector } from '@/components/offline-detector';
import { useToast } from '@/components/toast-provider';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function WalletPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { user, updateBalance } = useTradingContext();
  const { data: btcPrice, isLoading: btcPriceLoading } = useBTCPrice();
  const toast = useToast();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const NETWORKS = [
    { id: 'Ethereum', logo: '/network-ethereum.svg', eta: '3-10 min' },
    { id: 'BNB Chain', logo: '/network-bnb.svg', eta: '1-4 min' },
    { id: 'Bitcoin', logo: '/btc-logo.svg', eta: '10-30 min' },
  ] as const;
  type NetworkName = (typeof NETWORKS)[number]['id'];
  const [withdrawNetwork, setWithdrawNetwork] = useState<NetworkName>('Ethereum');
  const [withdrawType, setWithdrawType] = useState<'wallet' | 'bank'>('wallet');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [withdrawConfirmed, setWithdrawConfirmed] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const receiptRef = useRef<HTMLDivElement | null>(null);
  const transactionReceiptRef = useRef<HTMLDivElement | null>(null);

  const generateSecurityCode = (id: string, timestamp: string) => {
    const combined = `${id}-${timestamp}-TRADEHUB-SECURE`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).toUpperCase().slice(0, 8);
  };

  const generateQRData = (id: string, amount: number, timestamp: string) => {
    return `TRADEHUB:${id}:${amount}:${timestamp}:${generateSecurityCode(id, timestamp)}`;
  };

  const downloadReceipt = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { quality: 1, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    }
  };

  const shareReceipt = async (ref: React.RefObject<HTMLDivElement | null>, title: string) => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { quality: 1, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'receipt.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title });
      } else {
        downloadReceipt(ref, 'receipt.png');
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };
  const [withdrawError, setWithdrawError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const refreshWalletData = async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const txs = await getTransactionHistory(user.id, user.privyUserId);
      setTransactions(txs);
      toast.success('Wallet refreshed', 'Your balance and transactions have been updated');
    } catch (error) {
      console.error('Failed to refresh:', error);
      toast.error('Refresh failed', 'Could not update wallet data');
    } finally {
      setIsRefreshing(false);
    }
  };

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
    return <FuturisticLoader />;
  }

  if (!authenticated) {
    return null;
  }

  if (!user) {
    return <FuturisticLoader />;
  }

  const btcEquivalent = btcPrice ? (user?.balance || 0) / btcPrice : 0;
  const usdBalance = user?.balance || 0;
  const eurEquivalent = usdBalance * 0.92;
  const gbpEquivalent = usdBalance * 0.79;
  const usdcEquivalent = usdBalance;
  const usdtEquivalent = usdBalance;
  const selectedNetwork = NETWORKS.find((network) => network.id === withdrawNetwork) ?? NETWORKS[0];
  const parsedWithdrawAmount = Number(withdrawAmount);
  const isWithdrawAmountValid = Number.isFinite(parsedWithdrawAmount) && parsedWithdrawAmount > 0;
  const withdrawAddressIsValid = withdrawType === 'bank' || /^(0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$/.test(withdrawAddress.trim());
  const bankDetailsValid = withdrawType === 'wallet' || (bankName && accountNumber && accountName);
  const exceedsBalance = isWithdrawAmountValid && parsedWithdrawAmount > user.balance;
  const canSubmitWithdraw =
    isWithdrawAmountValid &&
    withdrawAddressIsValid &&
    bankDetailsValid &&
    !exceedsBalance &&
    withdrawConfirmed &&
    !isWithdrawing;

  const resetAmounts = () => {
    setWithdrawAmount('');
    setWithdrawAddress('');
    setWithdrawNetwork('Ethereum');
    setWithdrawType('wallet');
    setBankName('');
    setAccountNumber('');
    setAccountName('');
    setRoutingNumber('');
    setSwiftCode('');
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
    if (withdrawType === 'wallet' && !withdrawAddressIsValid) {
      setWithdrawError('Enter a valid destination wallet address.');
      return;
    }
    if (withdrawType === 'bank' && !bankDetailsValid) {
      setWithdrawError('Please fill in all required bank details.');
      return;
    }
    if (!withdrawConfirmed) {
      setWithdrawError('Please confirm the destination details before continuing.');
      return;
    }

    setIsWithdrawing(true);

    if (user && user.balance >= amount) {
      const success = await updateBalance(-amount, {
        destination_address: withdrawType === 'wallet' ? withdrawAddress.trim() : null,
        network: withdrawType === 'wallet' ? withdrawNetwork : null,
        bank_name: withdrawType === 'bank' ? bankName : null,
        account_number: withdrawType === 'bank' ? accountNumber : null,
        account_name: withdrawType === 'bank' ? accountName : null,
        routing_number: withdrawType === 'bank' ? routingNumber : null,
        swift_code: withdrawType === 'bank' ? swiftCode : null,
        requested_amount: amount,
        withdrawal_type: withdrawType,
        eta: withdrawType === 'wallet' ? selectedNetwork.eta : '1-3 business days',
      });
      if (!success) {
        setWithdrawError('Withdrawal failed. Please try again.');
        toast.error('Withdrawal failed', 'Please try again or contact support');
        setIsWithdrawing(false);
        return;
      }

      toast.success('Withdrawal submitted', 'Your withdrawal request has been sent for approval');

      setReceiptData({
        id: `TXN${Date.now()}`,
        type: withdrawType,
        amount,
        network: withdrawType === 'wallet' ? withdrawNetwork : null,
        address: withdrawType === 'wallet' ? withdrawAddress : null,
        bankName: withdrawType === 'bank' ? bankName : null,
        accountNumber: withdrawType === 'bank' ? accountNumber : null,
        accountName: withdrawType === 'bank' ? accountName : null,
        timestamp: new Date().toISOString(),
        status: 'Pending Agent Approval',
        approved: false,
      });
      setShowReceipt(true);
    } else {
      setWithdrawError('Insufficient balance for withdrawal.');
      toast.error('Insufficient balance', 'You do not have enough funds for this withdrawal');
      setIsWithdrawing(false);
      return;
    }
    resetAmounts();
    setShowWithdrawModal(false);
    setIsWithdrawing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <OfflineDetector />
      {/* Page Header */}
      <div className="border-b border-border bg-gradient-to-r from-[oklch(0.65_0.15_260)]/10 to-[oklch(0.72_0.12_140)]/10">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[oklch(0.65_0.15_260)]/20 to-[oklch(0.65_0.15_260)]/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[oklch(0.65_0.15_260)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Wallet</h1>
                <p className="text-muted-foreground text-sm">Manage your account funds</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="p-3 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
                title={balanceVisible ? 'Hide balance' : 'Show balance'}
              >
                {balanceVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
              <button
                onClick={refreshWalletData}
                disabled={isRefreshing}
                className="p-3 rounded-xl bg-card border border-border hover:bg-muted transition-colors disabled:opacity-50"
                title="Refresh wallet data"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
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
              <p className="text-4xl sm:text-5xl font-bold mb-4">
                {balanceVisible ? <CurrencyDisplay amount={user?.balance || 0} logoSize={0} /> : '••••••'}
              </p>
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
                  {balanceVisible ? (btcPriceLoading ? 'Loading...' : `${btcEquivalent.toFixed(6)} BTC`) : '••••••'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Image src="/usdc-logo.svg" alt="USD" width={20} height={20} className="w-5 h-5" />
                  <p className="text-muted-foreground text-sm">USD Equivalent</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {balanceVisible ? <CurrencyDisplay amount={user?.balance || 0} logoSize={0} /> : '••••••'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-muted-foreground text-sm mb-2">Display Conversions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-3 py-2">
                    <div className="flex items-center gap-2 text-foreground">
                      <Image src="/eur-logo.svg" alt="EUR" width={20} height={20} className="w-5 h-5" />
                      <span className="font-semibold">EUR</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-foreground">
                      {balanceVisible ? formatCurrency(eurEquivalent).replace('$', 'EUR ') : '••••••'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-3 py-2">
                    <div className="flex items-center gap-2 text-foreground">
                      <Image src="/gbp-logo.svg" alt="GBP" width={20} height={20} className="w-5 h-5" />
                      <span className="font-semibold">GBP</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-foreground">
                      {balanceVisible ? formatCurrency(gbpEquivalent).replace('$', 'GBP ') : '••••••'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-3 py-2">
                    <div className="flex items-center gap-2 text-foreground">
                      <Image src="/usdc-logo.svg" alt="USDC" width={20} height={20} className="w-5 h-5" />
                      <span className="font-semibold">USDC</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-foreground">
                      {balanceVisible ? usdcEquivalent.toFixed(2) : '••••••'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-3 py-2">
                    <div className="flex items-center gap-2 text-foreground">
                      <Image src="/usdt-logo.svg" alt="USDT" width={20} height={20} className="w-5 h-5" />
                      <span className="font-semibold">USDT</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-foreground">
                      {balanceVisible ? usdtEquivalent.toFixed(2) : '••••••'}
                    </span>
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
                      <button
                        key={tx.id}
                        onClick={() => setSelectedTransaction(tx)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
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
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md my-4 sm:my-8 mx-2 sm:mx-auto">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-card z-10">
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  <h2 className="text-base sm:text-lg font-bold">Withdraw</h2>
                </div>
                <button 
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-muted-foreground hover:text-foreground text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-2 block">Withdrawal Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setWithdrawType('wallet')}
                      className={`p-2 sm:p-3 rounded-lg border text-center transition-colors ${
                        withdrawType === 'wallet'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted/40'
                      }`}
                    >
                      <Wallet className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1" />
                      <span className="text-xs sm:text-sm font-medium">Wallet</span>
                    </button>
                    <button
                      onClick={() => setWithdrawType('bank')}
                      className={`p-2 sm:p-3 rounded-lg border text-center transition-colors ${
                        withdrawType === 'bank'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted/40'
                      }`}
                    >
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1" />
                      <span className="text-xs sm:text-sm font-medium">Bank</span>
                    </button>
                  </div>
                </div>

                {withdrawType === 'wallet' ? (
                  <>
                    <div>
                      <label className="text-xs sm:text-sm font-medium mb-1.5 block">Network</label>
                      <div className="grid grid-cols-1 gap-2">
                        {NETWORKS.map((network) => (
                          <button
                            key={network.id}
                            onClick={() => setWithdrawNetwork(network.id)}
                            className={`p-2 sm:p-2.5 rounded-lg border text-left text-xs sm:text-sm transition-colors ${
                              withdrawNetwork === network.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:bg-muted/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Image src={network.logo} alt={network.id} width={16} height={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="font-medium">{network.id}</span>
                              </div>
                              <span className="text-[10px] sm:text-xs text-muted-foreground">{network.eta}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-medium mb-1.5 block">Wallet Address</label>
                      <input
                        type="text"
                        placeholder={withdrawNetwork === 'Bitcoin' ? '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' : '0x...'}
                        value={withdrawAddress}
                        onChange={(e) => setWithdrawAddress(e.target.value)}
                        className="w-full p-2 sm:p-2.5 rounded-lg bg-background border border-border text-xs sm:text-sm"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs sm:text-sm font-medium mb-1.5 block">Bank Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., Chase Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full p-2 sm:p-2.5 rounded-lg bg-background border border-border text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-medium mb-1.5 block">Account Name *</label>
                      <input
                        type="text"
                        placeholder="Full name on account"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="w-full p-2 sm:p-2.5 rounded-lg bg-background border border-border text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-medium mb-1.5 block">Account Number *</label>
                      <input
                        type="text"
                        placeholder="Account number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full p-2 sm:p-2.5 rounded-lg bg-background border border-border text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-medium mb-1.5 block">Routing Number</label>
                      <input
                        type="text"
                        placeholder="9-digit routing number"
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                        className="w-full p-2 sm:p-2.5 rounded-lg bg-background border border-border text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-medium mb-1.5 block">SWIFT/BIC Code</label>
                      <input
                        type="text"
                        placeholder="For international transfers"
                        value={swiftCode}
                        onChange={(e) => setSwiftCode(e.target.value)}
                        className="w-full p-2 sm:p-2.5 rounded-lg bg-background border border-border text-xs sm:text-sm"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1.5 block">Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full p-2 sm:p-2.5 rounded-lg bg-background border border-border text-xs sm:text-sm"
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    Available: {formatCurrency(user.balance)}
                  </p>
                </div>

                <div className="bg-[oklch(0.68_0.11_40)]/10 border border-[oklch(0.68_0.11_40)]/30 rounded-lg p-2 sm:p-3 text-xs sm:text-sm">
                  <p className="text-[oklch(0.68_0.11_40)] font-medium">⚠️ Agent Approval Required</p>
                  <p className="text-muted-foreground text-[10px] sm:text-xs mt-1">
                    Your withdrawal will be reviewed by an agent. Please share the receipt to complete payment of platform fees.
                  </p>
                </div>

                <label className="flex items-start gap-2 text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    checked={withdrawConfirmed}
                    onChange={(e) => setWithdrawConfirmed(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-muted-foreground">I confirm all details are correct</span>
                </label>

                {exceedsBalance && (
                  <p className="text-xs sm:text-sm text-destructive">Insufficient balance</p>
                )}
                {withdrawType === 'wallet' && !withdrawAddressIsValid && withdrawAddress.length > 0 && (
                  <p className="text-xs sm:text-sm text-destructive">Invalid address</p>
                )}
                {withdrawError && (
                  <p className="text-xs sm:text-sm text-destructive">{withdrawError}</p>
                )}
              </div>

              <div className="flex gap-2 p-3 sm:p-4 border-t border-border">
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    resetAmounts();
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 rounded-lg border border-border hover:bg-muted text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={!canSubmitWithdraw}
                  className="flex-1 px-3 sm:px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-xs sm:text-sm"
                >
                  {isWithdrawing ? 'Processing...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && receiptData && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md my-4 sm:my-8 mx-2 sm:mx-auto">
              <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                <div ref={receiptRef} className="space-y-3 sm:space-y-4 bg-white p-4 sm:p-6 rounded-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-gray-900">Withdrawal Submitted</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Your withdrawal request has been received</p>
                  </div>

                  <div className="border-2 border-gray-300 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 relative overflow-hidden">
                    {/* Watermark Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                      <div className="text-6xl font-bold rotate-[-45deg] text-gray-900">TRADEHUB</div>
                    </div>

                    {/* Header with Logo */}
                    <div className="flex items-center justify-between pb-2 sm:pb-3 border-b-2 border-gray-300 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#6366f1] flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                          TH
                        </div>
                        <div className="text-lg sm:text-2xl font-bold text-[#6366f1]">TradeHub</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] sm:text-[10px] font-semibold text-gray-600">OFFICIAL RECEIPT</div>
                        <div className="text-[8px] sm:text-[10px] text-gray-500">Verified Transaction</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm relative z-10">
                      {/* Security Code */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded p-2 mb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-gray-600 font-semibold">Security Code</div>
                            <div className="font-mono font-bold text-blue-700 text-sm sm:text-base">
                              {generateSecurityCode(receiptData.id, receiptData.timestamp)}
                            </div>
                          </div>
                          <div className="bg-white p-1 rounded">
                            <QRCodeSVG 
                              value={generateQRData(receiptData.id, receiptData.amount, receiptData.timestamp)}
                              size={50}
                              level="H"
                              includeMargin={false}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Transaction ID</span>
                        <span className="font-mono font-medium text-gray-900 text-right break-all">{receiptData.id}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Date & Time</span>
                        <span className="font-medium text-gray-900 text-right">{new Date(receiptData.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Type</span>
                        <span className="font-medium capitalize text-gray-900">{receiptData.type} Withdrawal</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-bold text-base sm:text-lg text-gray-900">{formatCurrency(receiptData.amount)}</span>
                      </div>
                      
                      <div className="pt-1.5 sm:pt-2 border-t border-gray-200 space-y-1.5 sm:space-y-2">
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-600">Conversions:</p>
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">BTC:</span>
                            <span className="font-medium text-gray-900">{(receiptData.amount / (btcPrice || 1)).toFixed(6)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">EUR:</span>
                            <span className="font-medium text-gray-900">€{(receiptData.amount * 0.92).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">GBP:</span>
                            <span className="font-medium text-gray-900">£{(receiptData.amount * 0.79).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">USDC:</span>
                            <span className="font-medium text-gray-900">{receiptData.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {receiptData.type === 'wallet' && (
                        <>
                          <div className="flex justify-between gap-2 pt-1.5 sm:pt-2 border-t border-gray-200">
                            <span className="text-gray-600">Network</span>
                            <span className="font-medium text-gray-900">{receiptData.network}</span>
                          </div>
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-gray-600">Address</span>
                            <span className="font-mono text-[10px] sm:text-xs text-right max-w-[60%] break-all text-gray-900">{receiptData.address}</span>
                          </div>
                        </>
                      )}
                      {receiptData.type === 'bank' && (
                        <>
                          <div className="flex justify-between gap-2 pt-1.5 sm:pt-2 border-t border-gray-200">
                            <span className="text-gray-600">Bank</span>
                            <span className="font-medium text-gray-900 text-right">{receiptData.bankName}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-gray-600">Account Name</span>
                            <span className="font-medium text-gray-900 text-right">{receiptData.accountName}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-gray-600">Account Number</span>
                            <span className="font-mono text-gray-900">****{receiptData.accountNumber.slice(-4)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between gap-2 pt-1.5 sm:pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Status</span>
                        <span className={`font-semibold ${receiptData.approved ? 'text-green-600' : 'text-orange-600'}`}>
                          {receiptData.approved ? 'Approved - Successful' : 'Pending Agent Approval'}
                        </span>
                      </div>
                    </div>

                    {/* Security Footer */}
                    <div className="border-t-2 border-gray-300 pt-2 mt-2 relative z-10">
                      <div className="text-[8px] sm:text-[10px] text-gray-500 text-center">
                        This is an official TradeHub receipt. Verify authenticity using the security code and QR code.
                      </div>
                      <div className="text-[8px] text-gray-400 text-center mt-1">
                        © 2026 TradeHub. All rights reserved. | support@tradehub.com
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3 text-[10px] sm:text-xs relative z-10">
                      <p className="text-orange-700 font-semibold mb-1">📋 Next Steps:</p>
                      <p className="text-gray-700">
                        Share this receipt with an agent to pay the platform fee. Your wallet will be credited after payment confirmation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <button
                    onClick={() => downloadReceipt(receiptRef, `withdrawal-${receiptData.id}.png`)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border hover:bg-muted flex items-center justify-center gap-1 text-[10px] sm:text-sm"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                  <button
                    onClick={() => shareReceipt(receiptRef, 'Withdrawal Receipt')}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border hover:bg-muted flex items-center justify-center gap-1 text-[10px] sm:text-sm"
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  <button
                    onClick={() => setShowReceipt(false)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] sm:text-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Receipt Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md my-4 sm:my-8 mx-2 sm:mx-auto">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
                <h2 className="text-base sm:text-lg font-bold">Transaction Receipt</h2>
                <button 
                  onClick={() => setSelectedTransaction(null)}
                  className="text-muted-foreground hover:text-foreground text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                <div ref={transactionReceiptRef} className="space-y-3 sm:space-y-4 bg-white p-4 sm:p-6 rounded-lg">
                  <div className="border-2 border-gray-300 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 relative overflow-hidden">
                    {/* Watermark Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                      <div className="text-6xl font-bold rotate-[-45deg] text-gray-900">TRADEHUB</div>
                    </div>

                    {/* Header with Logo */}
                    <div className="flex items-center justify-between pb-2 sm:pb-3 border-b-2 border-gray-300 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#6366f1] flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                          TH
                        </div>
                        <div className="text-lg sm:text-2xl font-bold text-[#6366f1]">TradeHub</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] sm:text-[10px] font-semibold text-gray-600">OFFICIAL RECEIPT</div>
                        <div className="text-[8px] sm:text-[10px] text-gray-500">Verified Transaction</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm relative z-10">
                      {/* Security Code */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded p-2 mb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-gray-600 font-semibold">Security Code</div>
                            <div className="font-mono font-bold text-blue-700 text-sm sm:text-base">
                              {generateSecurityCode(selectedTransaction.id.toString(), selectedTransaction.created_at)}
                            </div>
                          </div>
                          <div className="bg-white p-1 rounded">
                            <QRCodeSVG 
                              value={generateQRData(selectedTransaction.id.toString(), Number(selectedTransaction.amount), selectedTransaction.created_at)}
                              size={50}
                              level="H"
                              includeMargin={false}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Transaction ID</span>
                        <span className="font-mono font-medium text-gray-900 text-right break-all">{selectedTransaction.id}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Date & Time</span>
                        <span className="font-medium text-gray-900 text-right">{new Date(selectedTransaction.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Type</span>
                        <span className="font-medium capitalize text-gray-900">
                          {selectedTransaction.type === 'deposit' ? 'Deposit' : 
                           selectedTransaction.type === 'withdrawal' ? 'Withdrawal' :
                           selectedTransaction.type === 'trade_open' ? 'Trade Open' :
                           selectedTransaction.type === 'trade_close' ? 'Trade Close' : 'Transaction'}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Amount</span>
                        <span className={`font-bold text-base sm:text-lg ${Number(selectedTransaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Number(selectedTransaction.amount) >= 0 ? '+' : ''}{formatCurrency(Number(selectedTransaction.amount))}
                        </span>
                      </div>
                      
                      <div className="pt-1.5 sm:pt-2 border-t border-gray-200 space-y-1.5 sm:space-y-2">
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-600">Conversions:</p>
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">BTC:</span>
                            <span className="font-medium text-gray-900">{(Math.abs(Number(selectedTransaction.amount)) / (btcPrice || 1)).toFixed(6)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">EUR:</span>
                            <span className="font-medium text-gray-900">€{(Math.abs(Number(selectedTransaction.amount)) * 0.92).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">GBP:</span>
                            <span className="font-medium text-gray-900">£{(Math.abs(Number(selectedTransaction.amount)) * 0.79).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">USDC:</span>
                            <span className="font-medium text-gray-900">{Math.abs(Number(selectedTransaction.amount)).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between gap-2 pt-1.5 sm:pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Balance After</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(Number(selectedTransaction.balance_after))}</span>
                      </div>

                      <div className="flex justify-between gap-2 pt-1.5 sm:pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Status</span>
                        <span className={`font-semibold ${selectedTransaction.approved ? 'text-green-600' : 'text-orange-600'}`}>
                          {selectedTransaction.approved ? 'Approved - Successful' : 'Pending Approval'}
                        </span>
                      </div>
                    </div>

                    {/* Security Footer */}
                    <div className="border-t-2 border-gray-300 pt-2 mt-2 relative z-10">
                      <div className="text-[8px] sm:text-[10px] text-gray-500 text-center">
                        This is an official TradeHub receipt. Verify authenticity using the security code and QR code.
                      </div>
                      <div className="text-[8px] text-gray-400 text-center mt-1">
                        © 2026 TradeHub. All rights reserved. | support@tradehub.com
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <button
                    onClick={() => downloadReceipt(transactionReceiptRef, `transaction-${selectedTransaction.id}.png`)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border hover:bg-muted flex items-center justify-center gap-1 text-[10px] sm:text-sm"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                  <button
                    onClick={() => shareReceipt(transactionReceiptRef, 'Transaction Receipt')}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border hover:bg-muted flex items-center justify-center gap-1 text-[10px] sm:text-sm"
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
