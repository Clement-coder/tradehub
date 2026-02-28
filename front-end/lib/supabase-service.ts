import {
  getSupabaseClient,
  type User,
  type Balance,
  type Position,
  type Trade,
  type Transaction,
  type Notification,
  type UserWithBalance,
  type Numeric,
} from './supabase';

export type { Transaction };

interface UserInput {
  privyUserId: string;
  walletAddress: string;
  email?: string;
  username?: string;
  loginMethod?: string;
}

interface OpenPositionInput {
  userId: string;
  privyUserId: string;
  type: 'long' | 'short';
  entryPrice: number;
  quantity: number;
}

interface ClosePositionInput {
  userId: string;
  privyUserId: string;
  positionId: string;
  exitPrice: number;
}

interface BalanceAdjustmentInput {
  userId: string;
  privyUserId: string;
  delta: number;
  type: 'deposit' | 'withdrawal';
  metadata?: Record<string, unknown>;
}

interface ServiceResult {
  ok: boolean;
  error?: string;
}

interface OpenPositionResult extends ServiceResult {
  position?: Position;
  balance?: number;
}

interface ClosePositionResult extends ServiceResult {
  balance?: number;
}

const INVALID_SUPABASE_URLS = new Set(['', 'your_supabase_project_url', 'https://your-project.supabase.co']);
const INVALID_SUPABASE_KEYS = new Set(['', 'your_supabase_anon_key']);

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  return !INVALID_SUPABASE_URLS.has(url) && !INVALID_SUPABASE_KEYS.has(key);
}

function toNumber(value: Numeric | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pgrstNoRows(error: { code?: string } | null): boolean {
  return Boolean(error && error.code === 'PGRST116');
}

export async function getOrCreateUser(input: UserInput): Promise<UserWithBalance | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient(input.privyUserId);

  try {
    const { data: existingUser, error: userFetchError } = await supabase
      .from('users')
      .select('*')
      .eq('privy_user_id', input.privyUserId)
      .single<User>();

    let userRow: User;

    if (existingUser) {
      userRow = existingUser;

      const updatePatch: Partial<User> = {};
      if (input.walletAddress && input.walletAddress !== existingUser.wallet_address) {
        updatePatch.wallet_address = input.walletAddress;
      }
      if (input.email && input.email !== existingUser.email) {
        updatePatch.email = input.email;
      }
      if (input.username && input.username !== existingUser.username) {
        updatePatch.username = input.username;
      }
      if (input.loginMethod && input.loginMethod !== existingUser.login_method) {
        updatePatch.login_method = input.loginMethod;
      }

      if (Object.keys(updatePatch).length > 0) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updatePatch)
          .eq('id', existingUser.id)
          .select('*')
          .single<User>();

        if (updateError) throw updateError;
        if (updatedUser) {
          userRow = updatedUser;
        }
      }
    } else {
      if (!pgrstNoRows(userFetchError)) {
        throw userFetchError;
      }

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert({
          privy_user_id: input.privyUserId,
          wallet_address: input.walletAddress,
          email: input.email ?? null,
          username: input.username ?? null,
          login_method: input.loginMethod ?? null,
        })
        .select('*')
        .single<User>();

      if (createError || !createdUser) throw createError;
      userRow = createdUser;

      // Welcome notification on first login
      await createNotification({
        userId: userRow.id,
        privyUserId: input.privyUserId,
        title: 'Welcome to TradeHub',
        message: 'Your account is ready. Credit wallet to get started.',
        type: 'portfolio',
        color: 'primary',
      });
    }

    const balance = await ensureAndGetBalance(userRow.id, input.privyUserId);

    return {
      ...userRow,
      balance,
    };
  } catch (error) {
    console.error('Error getting/creating user:', error);
    return null;
  }
}

async function ensureAndGetBalance(userId: string, privyUserId: string): Promise<number> {
  const supabase = getSupabaseClient(privyUserId);

  const { data: balanceRow, error: balanceFetchError } = await supabase
    .from('balances')
    .select('*')
    .eq('user_id', userId)
    .eq('privy_user_id', privyUserId)
    .single<Balance>();

  if (balanceRow) return toNumber(balanceRow.amount);

  if (!pgrstNoRows(balanceFetchError)) {
    throw balanceFetchError;
  }

  const { data: createdBalance, error: createBalanceError } = await supabase
    .from('balances')
    .insert({
      user_id: userId,
      privy_user_id: privyUserId,
      amount: 0,
      currency: 'USD',
    })
    .select('*')
    .single<Balance>();

  if (createBalanceError || !createdBalance) throw createBalanceError;
  return toNumber(createdBalance.amount);
}

export async function getUserByPrivyId(privyUserId: string): Promise<UserWithBalance | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient(privyUserId);

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('privy_user_id', privyUserId)
      .single<User>();

    if (userError || !user) throw userError;

    const balance = await ensureAndGetBalance(user.id, privyUserId);

    return {
      ...user,
      balance,
    };
  } catch (error) {
    console.error('Error fetching user by Privy ID:', error);
    return null;
  }
}

export async function getCurrentBalance(userId: string, privyUserId: string): Promise<number | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    return await ensureAndGetBalance(userId, privyUserId);
  } catch (error) {
    console.error('Error fetching balance:', error);
    return null;
  }
}

export async function getOpenPositions(userId: string, privyUserId: string): Promise<Position[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabaseClient(privyUserId);

  try {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('user_id', userId)
      .eq('privy_user_id', privyUserId)
      .eq('is_open', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Position[]) ?? [];
  } catch (error) {
    console.error('Error fetching positions:', error);
    return [];
  }
}

export async function getTradeHistory(userId: string, privyUserId: string, limit = 50): Promise<Trade[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabaseClient(privyUserId);

  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .eq('privy_user_id', privyUserId)
      .order('closed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as Trade[]) ?? [];
  } catch (error) {
    console.error('Error fetching trades:', error);
    return [];
  }
}

export async function getTransactionHistory(userId: string, privyUserId: string): Promise<Transaction[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabaseClient(privyUserId);

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('privy_user_id', privyUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Transaction[]) ?? [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function openPositionTrade(input: OpenPositionInput): Promise<OpenPositionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase is not configured.' };
  }

  const supabase = getSupabaseClient(input.privyUserId);

  try {
    const currentBalance = await ensureAndGetBalance(input.userId, input.privyUserId);

    const notional = input.entryPrice * input.quantity;
    const fee = Math.abs(notional) * 0.001;

    if (input.type === 'long' && currentBalance < notional + fee) {
      return { ok: false, error: 'Insufficient balance.' };
    }

    const nextBalance = input.type === 'long'
      ? currentBalance - notional - fee
      : currentBalance + notional - fee;

    const { error: balanceError } = await supabase
      .from('balances')
      .update({ amount: nextBalance })
      .eq('user_id', input.userId)
      .eq('privy_user_id', input.privyUserId);

    if (balanceError) throw balanceError;

    const { data: position, error: positionError } = await supabase
      .from('positions')
      .insert({
        user_id: input.userId,
        privy_user_id: input.privyUserId,
        type: input.type,
        entry_price: input.entryPrice,
        quantity: input.quantity,
        is_open: true,
      })
      .select('*')
      .single<Position>();

    if (positionError || !position) throw positionError;

    const transactionAmount = input.type === 'long' ? -notional - fee : notional - fee;

    await supabase.from('transactions').insert({
      user_id: input.userId,
      privy_user_id: input.privyUserId,
      type: 'trade_open',
      amount: transactionAmount,
      balance_before: currentBalance,
      balance_after: nextBalance,
      status: 'completed',
      reference_id: position.id,
      metadata: {
        market: 'BTC/USD',
        side: input.type,
        quantity: input.quantity,
        entry_price: input.entryPrice,
        fee,
      },
    });

    await createNotification({
      userId: input.userId,
      privyUserId: input.privyUserId,
      title: `${input.type === 'long' ? 'Buy' : 'Sell'} Order Executed`,
      message: `${input.quantity.toFixed(6)} BTC at $${input.entryPrice.toLocaleString()}`,
      type: 'trade',
      color: input.type === 'long' ? 'chart-2' : 'destructive',
    });

    return {
      ok: true,
      position,
      balance: nextBalance,
    };
  } catch (error) {
    console.error('Error opening position:', error);
    return { ok: false, error: 'Failed to open position.' };
  }
}

export async function closePositionTrade(input: ClosePositionInput): Promise<ClosePositionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase is not configured.' };
  }

  const supabase = getSupabaseClient(input.privyUserId);

  try {
    const { data: position, error: positionError } = await supabase
      .from('positions')
      .select('*')
      .eq('id', input.positionId)
      .eq('user_id', input.userId)
      .eq('privy_user_id', input.privyUserId)
      .eq('is_open', true)
      .single<Position>();

    if (positionError || !position) {
      throw positionError;
    }

    const entryPrice = toNumber(position.entry_price);
    const quantity = toNumber(position.quantity);
    const pnl = (input.exitPrice - entryPrice) * quantity;
    const pnlPercent = entryPrice === 0 ? 0 : ((input.exitPrice - entryPrice) / entryPrice) * 100;
    const fee = Math.abs(pnl) * 0.001;
    const realized = pnl - fee;

    const { error: closeError } = await supabase
      .from('positions')
      .update({
        is_open: false,
        exit_price: input.exitPrice,
        closed_at: new Date().toISOString(),
      })
      .eq('id', input.positionId)
      .eq('user_id', input.userId)
      .eq('privy_user_id', input.privyUserId);

    if (closeError) throw closeError;

    const { error: tradeError } = await supabase
      .from('trades')
      .insert({
        user_id: input.userId,
        privy_user_id: input.privyUserId,
        position_id: input.positionId,
        type: position.type,
        entry_price: entryPrice,
        exit_price: input.exitPrice,
        quantity,
        pnl: realized,
        pnl_percent: pnlPercent,
        fee,
        opened_at: position.created_at,
        closed_at: new Date().toISOString(),
      });

    if (tradeError) throw tradeError;

    const currentBalance = await ensureAndGetBalance(input.userId, input.privyUserId);
    const nextBalance = currentBalance + realized;

    const { error: balanceError } = await supabase
      .from('balances')
      .update({ amount: nextBalance })
      .eq('user_id', input.userId)
      .eq('privy_user_id', input.privyUserId);

    if (balanceError) throw balanceError;

    await supabase.from('transactions').insert({
      user_id: input.userId,
      privy_user_id: input.privyUserId,
      type: 'trade_close',
      amount: realized,
      balance_before: currentBalance,
      balance_after: nextBalance,
      status: 'completed',
      reference_id: input.positionId,
      metadata: {
        market: 'BTC/USD',
        side: position.type,
        quantity,
        entry_price: entryPrice,
        exit_price: input.exitPrice,
        pnl,
        fee,
      },
    });

    await createNotification({
      userId: input.userId,
      privyUserId: input.privyUserId,
      title: 'Position Closed',
      message: `P&L ${realized >= 0 ? '+' : ''}$${Math.abs(realized).toFixed(2)}`,
      type: 'portfolio',
      color: realized >= 0 ? 'chart-2' : 'destructive',
    });

    return {
      ok: true,
      balance: nextBalance,
    };
  } catch (error) {
    console.error('Error closing position:', error);
    return { ok: false, error: 'Failed to close position.' };
  }
}

export async function adjustBalance(input: BalanceAdjustmentInput): Promise<ServiceResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase is not configured.' };
  }

  const supabase = getSupabaseClient(input.privyUserId);

  try {
    const currentBalance = await ensureAndGetBalance(input.userId, input.privyUserId);
    const nextBalance = currentBalance + input.delta;

    if (nextBalance < 0) {
      return { ok: false, error: 'Insufficient balance.' };
    }

    const { error: balanceError } = await supabase
      .from('balances')
      .update({ amount: nextBalance })
      .eq('user_id', input.userId)
      .eq('privy_user_id', input.privyUserId);

    if (balanceError) throw balanceError;

    await supabase.from('transactions').insert({
      user_id: input.userId,
      privy_user_id: input.privyUserId,
      type: input.type,
      amount: input.delta,
      balance_before: currentBalance,
      balance_after: nextBalance,
      status: 'completed',
      metadata: input.metadata ?? null,
    });

    await createNotification({
      userId: input.userId,
      privyUserId: input.privyUserId,
      title: input.type === 'deposit' ? 'Deposit Received' : 'Withdrawal Completed',
      message: `${input.type === 'deposit' ? '+' : '-'}$${Math.abs(input.delta).toFixed(2)}`,
      type: 'portfolio',
      color: input.type === 'deposit' ? 'chart-2' : 'destructive',
    });

    return { ok: true };
  } catch (error) {
    console.error('Error adjusting balance:', error);
    return { ok: false, error: 'Failed to update balance.' };
  }
}

interface NotificationInsert {
  userId: string;
  privyUserId: string;
  title: string;
  message: string;
  type: 'price' | 'trade' | 'portfolio' | 'security';
  color: string;
}

export async function createNotification(input: NotificationInsert): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = getSupabaseClient(input.privyUserId);

  const { error } = await supabase.from('notifications').insert({
    user_id: input.userId,
    privy_user_id: input.privyUserId,
    title: input.title,
    message: input.message,
    type: input.type,
    color: input.color,
    unread: true,
  });

  if (error) {
    console.error('Error creating notification:', error);
  }
}

export async function getNotifications(userId: string, privyUserId: string, limit = 20): Promise<Notification[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabaseClient(privyUserId);

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('privy_user_id', privyUserId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as Notification[]) ?? [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(
  notificationId: string,
  userId: string,
  privyUserId: string,
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = getSupabaseClient(privyUserId);

  const { error } = await supabase
    .from('notifications')
    .update({ unread: false })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .eq('privy_user_id', privyUserId);

  if (error) {
    console.error('Error marking notification as read:', error);
  }
}

export async function markAllNotificationsAsRead(userId: string, privyUserId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = getSupabaseClient(privyUserId);

  const { error } = await supabase
    .from('notifications')
    .update({ unread: false })
    .eq('user_id', userId)
    .eq('privy_user_id', privyUserId)
    .eq('unread', true);

  if (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

// ============================================================================
// User Settings
// ============================================================================

export interface UserSettings {
  id: string;
  user_id: string;
  privy_user_id: string;
  notifications_enabled: boolean;
  price_alerts_enabled: boolean;
  email_updates_enabled: boolean;
  dark_mode_enabled: boolean;
  sound_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface UserSettingsUpdate {
  userId: string;
  privyUserId: string;
  notifications_enabled?: boolean;
  price_alerts_enabled?: boolean;
  email_updates_enabled?: boolean;
  dark_mode_enabled?: boolean;
  sound_enabled?: boolean;
}

async function getUserSettings(userId: string, privyUserId: string): Promise<UserSettings | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  await supabase.rpc('set_app_user', { user_id: privyUserId });

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .eq('privy_user_id', privyUserId)
    .single();

  if (error && !pgrstNoRows(error)) {
    console.error('Error fetching user settings:', error.message || error);
  }

  return data;
}

async function createDefaultSettings(userId: string, privyUserId: string): Promise<UserSettings | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  await supabase.rpc('set_app_user', { user_id: privyUserId });

  const { data, error } = await supabase
    .from('user_settings')
    .insert({
      user_id: userId,
      privy_user_id: privyUserId,
      notifications_enabled: true,
      price_alerts_enabled: true,
      email_updates_enabled: false,
      dark_mode_enabled: true,
      sound_enabled: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating default settings:', error.message || error);
    // Return default settings object if table doesn't exist
    return {
      id: 'temp',
      user_id: userId,
      privy_user_id: privyUserId,
      notifications_enabled: true,
      price_alerts_enabled: true,
      email_updates_enabled: false,
      dark_mode_enabled: true,
      sound_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return data;
}

async function updateUserSettings(input: UserSettingsUpdate): Promise<UserSettings | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  await supabase.rpc('set_app_user', { user_id: input.privyUserId });

  const updateData: any = {};
  if (input.notifications_enabled !== undefined) updateData.notifications_enabled = input.notifications_enabled;
  if (input.price_alerts_enabled !== undefined) updateData.price_alerts_enabled = input.price_alerts_enabled;
  if (input.email_updates_enabled !== undefined) updateData.email_updates_enabled = input.email_updates_enabled;
  if (input.dark_mode_enabled !== undefined) updateData.dark_mode_enabled = input.dark_mode_enabled;
  if (input.sound_enabled !== undefined) updateData.sound_enabled = input.sound_enabled;

  const { data, error } = await supabase
    .from('user_settings')
    .update(updateData)
    .eq('user_id', input.userId)
    .eq('privy_user_id', input.privyUserId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user settings:', error.message || error);
    // Return updated settings object as fallback
    const current = await getUserSettings(input.userId, input.privyUserId);
    if (current) {
      return { ...current, ...updateData };
    }
    return null;
  }

  return data;
}
