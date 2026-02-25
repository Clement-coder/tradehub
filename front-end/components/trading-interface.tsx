'use client';

import React from 'react';
import { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Check } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { TradeModal } from '@/components/trade-modal';
import GlassCard from '@/components/glass-card';
import { CurrencyDisplay } from '@/components/currency-display';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function TradingInterface() {
  const { user, currentPrice, addPosition } = useTradingContext();
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

    setTimeout(async () => {
      const position = {
        id: `pos-${Date.now()}`,
        entryPrice: currentPrice,
        quantity: btcQuantity,
        timestamp: Date.now(),
        type: tradeType === 'buy' ? ('long' as const) : ('short' as const),
      };

      const success = await addPosition(position);

      if (!success) {
        setErrorMessage('Unable to execute trade with your current balance.');
        setShowModal(false);
        setIsLoading(false);
        return;
      }

      setSuccessMessage(`${tradeType === 'buy' ? 'Buy' : 'Sell'} order executed!`);
      setAmount('');
      setShowModal(false);
      setIsLoading(false);

      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };

  return (
    <GlassCard className="p-6 relative overflow-hidden">
      {/* Animated BTC Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
        <div className="absolute top-4 right-4 w-32 h-32 animate-spin-slow">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-orange-500">
            <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/>
          </svg>
        </div>
        <div className="absolute bottom-8 left-8 w-24 h-24 animate-pulse" style={{animationDuration: '3s'}}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-orange-500">
            <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center animate-pulse" style={{animationDuration: '2s'}}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-orange-500">
              <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Trade BTC</h2>
        </div>

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
                <span className="text-accent"><CurrencyDisplay amount={totalCost} logoSize={16} /></span>
              </div>
            </div>
          )}

          {/* Messages */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 text-destructive text-sm">
              <p>{errorMessage}</p>
              {errorMessage === 'Insufficient balance' && (
                <a 
                  href="/wallet" 
                  className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-destructive hover:text-destructive/80 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3">
                    <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2"/>
                    <path d="M2 10h20" strokeWidth="2"/>
                  </svg>
                  View Wallet
                </a>
              )}
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
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden ${
              tradeType === 'buy'
                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400'
                : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 relative z-10">
              <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/>
            </svg>
            <span className="relative z-10">{isLoading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} BTC`}</span>
          </button>
        </form>

        {/* Available Balance */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
          <p className="text-lg font-semibold text-foreground"><CurrencyDisplay amount={user.balance} logoSize={16} /></p>
        </div>
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

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </GlassCard>
  );
}
