'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Copy, ArrowDownLeft, ArrowUpRight, Plus, Minus } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { formatCurrency } from '@/lib/mock-data';

export default function WalletPage() {
  const router = useRouter();
  const { user, updateBalance } = useTradingContext();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [processingDeposit, setProcessingDeposit] = useState(false);
  const [processingWithdraw, setProcessingWithdraw] = useState(false);

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

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0 && amount <= 100000) {
      setProcessingDeposit(true);
      setTimeout(() => {
        updateBalance(amount);
        setDepositAmount('');
        setShowDepositModal(false);
        setProcessingDeposit(false);
      }, 1500);
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= user.balance) {
      setProcessingWithdraw(true);
      setTimeout(() => {
        updateBalance(-amount);
        setWithdrawAmount('');
        setShowWithdrawModal(false);
        setProcessingWithdraw(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Wallet</h1>
          </div>
          <p className="text-muted-foreground text-sm">Manage your demo account funds</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-2xl">
        {/* Balance Card */}
        <div className="bg-card border border-border rounded-lg p-8 mb-6">
          <p className="text-muted-foreground text-sm mb-2">Total Balance</p>
          <p className="text-5xl font-bold mb-4">{formatCurrency(user.balance)}</p>
          <p className="text-xs text-muted-foreground">Demo USD Balance (Testnet)</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Deposit
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
          >
            <Minus className="w-5 h-5" />
            Withdraw
          </button>
        </div>

        {/* Wallet Info */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6 mb-8">
          <div>
            <h3 className="font-semibold text-foreground mb-4">Wallet Address</h3>
            <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
              <code className="font-mono text-sm text-foreground break-all">{user.walletAddress}</code>
              <button
                onClick={copyAddress}
                className="ml-2 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Copy className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            {copied && <p className="text-xs text-accent mt-2">Copied to clipboard</p>}
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Network</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-sm text-foreground">Testnet / Demo Network</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">About This Wallet</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>This is a demo wallet for testing purposes only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>No real cryptocurrency is involved</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>All balances are simulated for demonstration</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Initial Deposit</p>
                  <p className="text-xs text-muted-foreground">Demo Account Setup</p>
                </div>
              </div>
              <p className="font-semibold text-accent">+$10,000.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Deposit Funds</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Add demo funds to your trading account (max $100,000)
            </p>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Amount (USD)"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDepositModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={processingDeposit || !depositAmount}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {processingDeposit ? 'Processing...' : 'Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Withdraw Funds</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Withdraw demo funds from your account
            </p>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount (USD)"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={processingWithdraw || !withdrawAmount}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {processingWithdraw ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
