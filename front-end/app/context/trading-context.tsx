'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Position {
  id: string;
  entryPrice: number;
  quantity: number;
  timestamp: number;
  type: 'long' | 'short';
}

export interface Trade {
  id: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  timestamp: number;
  duration: number;
  type: 'long' | 'short';
}

export interface User {
  id: string;
  email: string;
  walletAddress: string;
  balance: number;
}

interface TradingContextType {
  user: User | null;
  setUser: (user: User) => void;
  currentPrice: number;
  positions: Position[];
  trades: Trade[];
  addPosition: (position: Position) => void;
  closePosition: (id: string, exitPrice: number) => void;
  updateBalance: (amount: number) => void;
  updatePrice: (price: number) => void;
  logout: () => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export function TradingProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentPrice, setCurrentPrice] = useState(45230);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([
    {
      id: '1',
      entryPrice: 42500,
      exitPrice: 44200,
      quantity: 0.5,
      pnl: 850,
      pnlPercent: 4.0,
      timestamp: Date.now() - 86400000 * 3,
      duration: 3600000,
      type: 'long',
    },
    {
      id: '2',
      entryPrice: 44800,
      exitPrice: 43500,
      quantity: 0.3,
      pnl: -390,
      pnlPercent: -3.1,
      timestamp: Date.now() - 86400000,
      duration: 1800000,
      type: 'short',
    },
  ]);

  const addPosition = useCallback((position: Position) => {
    setPositions((prev) => [...prev, position]);
  }, []);

  const closePosition = useCallback((id: string, exitPrice: number) => {
    setPositions((prev) => {
      const position = prev.find((p) => p.id === id);
      if (!position) return prev;

      const pnl = (exitPrice - position.entryPrice) * position.quantity;
      const pnlPercent = ((exitPrice - position.entryPrice) / position.entryPrice) * 100;

      const trade: Trade = {
        id: `trade-${Date.now()}`,
        entryPrice: position.entryPrice,
        exitPrice,
        quantity: position.quantity,
        pnl,
        pnlPercent,
        timestamp: Date.now(),
        duration: Date.now() - position.timestamp,
        type: position.type,
      };

      setTrades((prevTrades) => [trade, ...prevTrades]);

      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const updateBalance = useCallback((amount: number) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, balance: prev.balance + amount };
    });
  }, []);

  const updatePrice = useCallback((price: number) => {
    setCurrentPrice(price);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setPositions([]);
  }, []);

  return (
    <TradingContext.Provider
      value={{
        user,
        setUser,
        currentPrice,
        positions,
        trades,
        addPosition,
        closePosition,
        updateBalance,
        updatePrice,
        logout,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
}

export function useTradingContext() {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTradingContext must be used within TradingProvider');
  }
  return context;
}
