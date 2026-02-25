'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  useEffect,
} from 'react';
import { usePrivy, type User as PrivyUser } from '@privy-io/react-auth';
import { useBTCPrice } from '@/lib/hooks/useBTCPrice';
import {
  getOrCreateUser,
  getOpenPositions,
  getTradeHistory,
  getCurrentBalance,
  openPositionTrade,
  closePositionTrade,
  adjustBalance,
} from '@/lib/supabase-service';

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
  privyUserId: string;
  email: string;
  walletAddress: string;
  balance: number;
  name?: string;
  loginMethod?: string;
  createdAt?: number;
}

interface TradingContextType {
  user: User | null;
  setUser: (user: User) => void;
  currentPrice: number;
  positions: Position[];
  trades: Trade[];
  addPosition: (position: Position) => Promise<boolean>;
  closePosition: (id: string, exitPrice: number) => Promise<boolean>;
  updateBalance: (amount: number, metadata?: Record<string, unknown>) => Promise<boolean>;
  updatePrice: (price: number) => void;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

function inferLoginMethod(privyUser: PrivyUser): string {
  const linkedAccounts = privyUser.linkedAccounts ?? [];

  if (linkedAccounts.some((acc) => acc.type === 'google_oauth')) {
    return 'Google';
  }

  if (linkedAccounts.some((acc) => acc.type === 'email')) {
    return 'Email';
  }

  if (linkedAccounts.some((acc) => acc.type === 'wallet')) {
    return 'Wallet';
  }

  return 'Unknown';
}

export function TradingProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const { data: btcPrice } = useBTCPrice();
  const { user: privyUser } = usePrivy();

  useEffect(() => {
    if (btcPrice) {
      setCurrentPrice(btcPrice);
    }
  }, [btcPrice]);

  const refreshUserData = useCallback(async () => {
    if (!user) return;

    const [dbPositions, dbTrades, dbBalance] = await Promise.all([
      getOpenPositions(user.id, user.privyUserId),
      getTradeHistory(user.id, user.privyUserId),
      getCurrentBalance(user.id, user.privyUserId),
    ]);

    setPositions(
      dbPositions.map((position) => ({
        id: position.id,
        entryPrice: Number(position.entry_price),
        quantity: Number(position.quantity),
        timestamp: new Date(position.created_at).getTime(),
        type: position.type,
      })),
    );

    setTrades(
      dbTrades.map((trade) => ({
        id: trade.id,
        entryPrice: Number(trade.entry_price),
        exitPrice: Number(trade.exit_price),
        quantity: Number(trade.quantity),
        pnl: Number(trade.pnl),
        pnlPercent: Number(trade.pnl_percent),
        timestamp: new Date(trade.closed_at).getTime(),
        duration:
          new Date(trade.closed_at).getTime() -
          new Date(trade.opened_at ?? trade.created_at).getTime(),
        type: trade.type,
      })),
    );

    if (dbBalance !== null) {
      setUser((prevUser) => (prevUser ? { ...prevUser, balance: dbBalance } : prevUser));
    }
  }, [user]);

  useEffect(() => {
    const loadUserFromPrivy = async (currentPrivyUser: PrivyUser) => {
      const walletAddress = currentPrivyUser.wallet?.address ?? '';
      const email = currentPrivyUser.google?.email ?? currentPrivyUser.email?.address ?? '';
      const loginMethod = inferLoginMethod(currentPrivyUser);
      const username =
        currentPrivyUser.google?.name ??
        (email.includes('@') ? email.split('@')[0] : 'User');

      const dbUser = await getOrCreateUser({
        privyUserId: currentPrivyUser.id,
        walletAddress,
        email,
        username,
        loginMethod,
      });

      if (!dbUser) {
        setUser(null);
        setPositions([]);
        setTrades([]);
        return;
      }

      setUser({
        id: dbUser.id,
        privyUserId: dbUser.privy_user_id,
        email: dbUser.email ?? email,
        walletAddress: dbUser.wallet_address,
        balance: dbUser.balance,
        name: dbUser.username ?? username,
        loginMethod: dbUser.login_method ?? loginMethod,
        createdAt: new Date(dbUser.created_at).getTime(),
      });
    };

    if (privyUser?.id) {
      void loadUserFromPrivy(privyUser);
    } else {
      setUser(null);
      setPositions([]);
      setTrades([]);
    }
  }, [privyUser]);

  useEffect(() => {
    if (user) {
      void refreshUserData();
    }
  }, [user?.id]);

  const addPosition = useCallback(
    async (position: Position): Promise<boolean> => {
      if (!user) return false;

      const result = await openPositionTrade({
        userId: user.id,
        privyUserId: user.privyUserId,
        type: position.type,
        entryPrice: position.entryPrice,
        quantity: position.quantity,
      });

      if (!result.ok) {
        return false;
      }

      await refreshUserData();
      return true;
    },
    [user, refreshUserData],
  );

  const closePosition = useCallback(
    async (id: string, exitPrice: number): Promise<boolean> => {
      if (!user) return false;

      const result = await closePositionTrade({
        userId: user.id,
        privyUserId: user.privyUserId,
        positionId: id,
        exitPrice,
      });

      if (!result.ok) {
        return false;
      }

      await refreshUserData();
      return true;
    },
    [user, refreshUserData],
  );

  const updateBalance = useCallback(
    async (amount: number, metadata?: Record<string, unknown>): Promise<boolean> => {
      if (!user) return false;

      const type = amount >= 0 ? 'deposit' : 'withdrawal';
      const result = await adjustBalance({
        userId: user.id,
        privyUserId: user.privyUserId,
        delta: amount,
        type,
        metadata,
      });

      if (!result.ok) {
        return false;
      }

      await refreshUserData();
      return true;
    },
    [user, refreshUserData],
  );

  const updatePrice = useCallback((price: number) => {
    setCurrentPrice(price);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setPositions([]);
    setTrades([]);
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
        refreshUserData,
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
