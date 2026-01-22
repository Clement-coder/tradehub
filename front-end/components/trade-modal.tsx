'use client';

import React from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency, formatPrice } from '@/lib/mock-data';

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
              This is a demo trade on testnet. No real funds will be transferred.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-border px-6 py-4 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${
              tradeType === 'buy'
                ? 'bg-accent hover:bg-accent/90'
                : 'bg-destructive hover:bg-destructive/90'
            }`}
          >
            {isLoading ? 'Processing...' : `Confirm ${tradeType === 'buy' ? 'Buy' : 'Sell'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
