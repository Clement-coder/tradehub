'use client';

import React from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

// Helper functions to format currency and price
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

interface TradeModalProps {
  isOpen: boolean;
  tradeType: 'buy' | 'sell';
  amount: number;
  quantity: number;
  price: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TradeModal({
  isOpen,
  tradeType,
  amount,
  quantity,
  price,
  onConfirm,
  onCancel,
  isLoading = false,
}: TradeModalProps) {
  if (!isOpen) return null;

  const fee = amount * 0.001; // 0.1% fee
  const total = amount + fee;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg max-w-md w-full overflow-hidden shadow-lg">
        {/* Header */}
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Confirm {tradeType === 'buy' ? 'Buy' : 'Sell'} Order
          </h2>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          {/* Order Summary */}
          <div className="space-y-3 bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Order Type</span>
              <span className="font-semibold text-foreground capitalize">
                {tradeType === 'buy' ? 'Market Buy' : 'Market Sell'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Amount</span>
              <span className="font-semibold text-foreground">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Price per BTC</span>
              <span className="font-semibold text-foreground">${formatPrice(price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Quantity</span>
              <span className="font-semibold text-foreground">{quantity.toFixed(6)} BTC</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="text-muted-foreground text-sm">Fee (0.1%)</span>
              <span className="font-semibold text-foreground">{formatCurrency(fee)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="text-foreground font-medium">Total</span>
              <span className="font-bold text-lg">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex gap-3 bg-primary/5 border border-primary/20 rounded-lg p-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              This is a trade. Real funds will be transferred.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-border px-6 py-4 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-primary/25 to-primary/15 border border-primary/40 disabled:opacity-50"
          >
            <span className="text-primary">Cancel</span>
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`group relative inline-flex items-center justify-center gap-2 md:gap-3 px-6 sm:px-8 lg:px-10 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base text-primary-foreground transition-all duration-300 transform hover:-translate-y-1 overflow-hidden disabled:opacity-50 shadow-xl hover:shadow-2xl ${
              tradeType === 'buy'
                ? 'bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70'
                : 'bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            {isLoading ? 'Processing...' : `Confirm ${tradeType === 'buy' ? 'Buy' : 'Sell'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
