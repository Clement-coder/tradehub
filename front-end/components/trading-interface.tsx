'use client';

import React from 'react';
import { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Check } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { TradeModal } from '@/components/trade-modal';
import GlassCard from '@/components/glass-card'; // Import GlassCard

// Helper function to format currency
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function TradingInterface() {
  const { user, currentPrice, addPosition, updateBalance } = useTradingContext();
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!user) return null;

  const btcQuantity = amount ? parseFloat(amount) / currentPrice : 0;
  const totalCost = btcQuantity * currentPrice;

  const handleTradeClick = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Enter a valid amount');
      return;
    }

    if (parseFloat(amount) > user.balance && tradeType === 'buy') {
      setErrorMessage('Insufficient balance');
      return;
    }

    setShowModal(true);
  };

  const handleTradeConfirm = () => {
    setIsLoading(true);

    setTimeout(() => {
      const position = {
        id: `pos-${Date.now()}`,
        entryPrice: currentPrice,
        quantity: btcQuantity,
        timestamp: Date.now(),
        type: tradeType === 'buy' ? ('long' as const) : ('short' as const),
      };

      addPosition(position);

      if (tradeType === 'buy') {
        updateBalance(-totalCost);
      } else {
        updateBalance(totalCost);
      }

      setSuccessMessage(`${tradeType === 'buy' ? 'Buy' : 'Sell'} order executed!`);
      setAmount('');
      setShowModal(false);
      setIsLoading(false);

      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Trade BTC</h2>

      <form onSubmit={handleTradeClick} className="space-y-5">
        {/* Trade Type Toggle */}
        <div className="flex gap-2 bg-muted/50 dark:bg-white/5 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setTradeType('buy')}
            className={`flex-1 py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
              tradeType === 'buy'
                ? 'bg-accent/20 dark:bg-accent/30 text-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Buy
          </button>
          <button
            type="button"
            onClick={() => setTradeType('sell')}
            className={`flex-1 py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
              tradeType === 'sell'
                ? 'bg-accent/20 dark:bg-accent/30 text-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            Sell
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-muted-foreground">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full pl-7 pr-4 py-3 rounded-lg bg-white/70 dark:bg-white/10 border border-white/20 dark:border-white/10 placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Order Summary */}
        {amount && (
          <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">BTC Amount</span>
              <span className="font-medium text-foreground">{btcQuantity.toFixed(6)} BTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium text-foreground">${currentPrice.toLocaleString()}</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-accent">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        )}

        {/* Messages */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 text-destructive text-sm">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-lg bg-accent/10 dark:bg-accent/20 border border-accent/30 text-accent text-sm flex items-center gap-2">
            <Check className="w-4 h-4" />
            {successMessage}
          </div>
        )}

        {/* Trade Button */}
        <button
          type="submit"
          disabled={isLoading || !amount}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            tradeType === 'buy'
              ? 'bg-accent hover:bg-accent/90 disabled:bg-accent/50'
              : 'bg-destructive hover:bg-destructive/90 disabled:bg-destructive/50'
          }`}
        >
          {isLoading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} Now`}
        </button>
      </form>

      {/* Available Balance */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
        <p className="text-lg font-semibold text-foreground">{formatCurrency(user.balance)}</p>
      </div>

      {/* Trade Modal */}
      <TradeModal
        isOpen={showModal}
        tradeType={tradeType}
        amount={parseFloat(amount) || 0}
        quantity={btcQuantity}
        price={currentPrice}
        onConfirm={handleTradeConfirm}
        onCancel={() => setShowModal(false)}
        isLoading={isLoading}
      />
    </GlassCard>
  );
}
