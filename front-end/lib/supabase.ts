import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return { url, anonKey };
}

export function getSupabaseClient(privyUserId?: string): SupabaseClient {
  const headers: Record<string, string> = {};
  const { url, anonKey } = getSupabaseEnv();

  if (privyUserId) {
    headers['x-privy-user-id'] = privyUserId;
  }

  return createClient(url, anonKey, {
    global: {
      headers,
    },
  });
}

export type Numeric = number | string;

// Database row types
export interface User {
  id: string;
  privy_user_id: string;
  wallet_address: string;
  email: string | null;
  username: string | null;
  login_method: string | null;
  created_at: string;
  updated_at: string;
}

export interface Balance {
  id: string;
  user_id: string;
  privy_user_id: string;
  amount: Numeric;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  user_id: string;
  privy_user_id: string;
  type: 'long' | 'short';
  entry_price: Numeric;
  quantity: Numeric;
  is_open: boolean;
  exit_price: Numeric | null;
  created_at: string;
  closed_at: string | null;
}

export interface Trade {
  id: string;
  user_id: string;
  privy_user_id: string;
  position_id: string | null;
  type: 'long' | 'short';
  entry_price: Numeric;
  exit_price: Numeric;
  quantity: Numeric;
  pnl: Numeric;
  pnl_percent: Numeric;
  fee: Numeric;
  opened_at: string;
  closed_at: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  privy_user_id: string;
  type: 'deposit' | 'withdrawal' | 'trade_open' | 'trade_close';
  amount: Numeric;
  balance_before: Numeric;
  balance_after: Numeric;
  status: 'pending' | 'completed' | 'failed';
  approved?: boolean;
  reference_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  privy_user_id: string;
  title: string;
  message: string;
  type: 'price' | 'trade' | 'portfolio' | 'security';
  color: string;
  unread: boolean;
  created_at: string;
}

export interface UserWithBalance extends User {
  balance: number;
}
