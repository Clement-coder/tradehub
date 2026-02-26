-- Security Improvements: RLS Policies, Withdrawal Limits, Transaction Locking, Audit Logs
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ADD USER ROLES
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users ADD COLUMN role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'agent', 'admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ============================================
-- 2. WITHDRAWAL LIMITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.withdrawal_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  daily_limit numeric(20, 8) NOT NULL DEFAULT 1000.00,
  weekly_limit numeric(20, 8) NOT NULL DEFAULT 5000.00,
  monthly_limit numeric(20, 8) NOT NULL DEFAULT 20000.00,
  daily_used numeric(20, 8) NOT NULL DEFAULT 0,
  weekly_used numeric(20, 8) NOT NULL DEFAULT 0,
  monthly_used numeric(20, 8) NOT NULL DEFAULT 0,
  last_daily_reset timestamptz NOT NULL DEFAULT now(),
  last_weekly_reset timestamptz NOT NULL DEFAULT now(),
  last_monthly_reset timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_limits_user_id ON public.withdrawal_limits(user_id);

-- ============================================
-- 3. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_agent_id ON public.audit_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================
-- 4. TRANSACTION LOCKING FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.process_withdrawal_with_lock(
  p_user_id uuid,
  p_amount numeric(20, 8),
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance numeric(20, 8);
  v_new_balance numeric(20, 8);
  v_transaction_id uuid;
  v_daily_limit numeric(20, 8);
  v_daily_used numeric(20, 8);
  v_weekly_limit numeric(20, 8);
  v_weekly_used numeric(20, 8);
  v_monthly_limit numeric(20, 8);
  v_monthly_used numeric(20, 8);
BEGIN
  -- Lock the balance row to prevent concurrent modifications
  SELECT amount INTO v_current_balance
  FROM public.balances
  WHERE user_id = p_user_id
  FOR UPDATE; -- This locks the row until transaction completes
  
  -- Check if balance exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User balance not found'
    );
  END IF;
  
  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance',
      'current_balance', v_current_balance,
      'requested_amount', p_amount
    );
  END IF;
  
  -- Get or create withdrawal limits
  INSERT INTO public.withdrawal_limits (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Lock withdrawal limits row
  SELECT daily_limit, daily_used, weekly_limit, weekly_used, monthly_limit, monthly_used
  INTO v_daily_limit, v_daily_used, v_weekly_limit, v_weekly_used, v_monthly_limit, v_monthly_used
  FROM public.withdrawal_limits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Reset counters if needed
  IF EXTRACT(EPOCH FROM (now() - (SELECT last_daily_reset FROM public.withdrawal_limits WHERE user_id = p_user_id))) > 86400 THEN
    v_daily_used := 0;
    UPDATE public.withdrawal_limits SET daily_used = 0, last_daily_reset = now() WHERE user_id = p_user_id;
  END IF;
  
  IF EXTRACT(EPOCH FROM (now() - (SELECT last_weekly_reset FROM public.withdrawal_limits WHERE user_id = p_user_id))) > 604800 THEN
    v_weekly_used := 0;
    UPDATE public.withdrawal_limits SET weekly_used = 0, last_weekly_reset = now() WHERE user_id = p_user_id;
  END IF;
  
  IF EXTRACT(EPOCH FROM (now() - (SELECT last_monthly_reset FROM public.withdrawal_limits WHERE user_id = p_user_id))) > 2592000 THEN
    v_monthly_used := 0;
    UPDATE public.withdrawal_limits SET monthly_used = 0, last_monthly_reset = now() WHERE user_id = p_user_id;
  END IF;
  
  -- Check withdrawal limits
  IF (v_daily_used + p_amount) > v_daily_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Daily withdrawal limit exceeded',
      'daily_limit', v_daily_limit,
      'daily_used', v_daily_used,
      'remaining', v_daily_limit - v_daily_used
    );
  END IF;
  
  IF (v_weekly_used + p_amount) > v_weekly_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Weekly withdrawal limit exceeded',
      'weekly_limit', v_weekly_limit,
      'weekly_used', v_weekly_used,
      'remaining', v_weekly_limit - v_weekly_used
    );
  END IF;
  
  IF (v_monthly_used + p_amount) > v_monthly_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Monthly withdrawal limit exceeded',
      'monthly_limit', v_monthly_limit,
      'monthly_used', v_monthly_used,
      'remaining', v_monthly_limit - v_monthly_used
    );
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;
  
  -- Update balance
  UPDATE public.balances
  SET amount = v_new_balance, updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Update withdrawal limits
  UPDATE public.withdrawal_limits
  SET 
    daily_used = daily_used + p_amount,
    weekly_used = weekly_used + p_amount,
    monthly_used = monthly_used + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Create transaction record
  INSERT INTO public.transactions (
    user_id,
    privy_user_id,
    type,
    amount,
    balance_before,
    balance_after,
    status,
    approved,
    metadata
  )
  SELECT 
    p_user_id,
    u.privy_user_id,
    'withdrawal',
    -p_amount,
    v_current_balance,
    v_new_balance,
    'pending',
    false,
    p_metadata
  FROM public.users u
  WHERE u.id = p_user_id
  RETURNING id INTO v_transaction_id;
  
  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'old_balance', v_current_balance,
    'new_balance', v_new_balance,
    'amount', p_amount
  );
END;
$$;

-- ============================================
-- 5. AUDIT LOG TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.log_audit_trail()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_action text;
  v_old_value jsonb;
  v_new_value jsonb;
BEGIN
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := TG_TABLE_NAME || '_created';
    v_old_value := NULL;
    v_new_value := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := TG_TABLE_NAME || '_updated';
    v_old_value := to_jsonb(OLD);
    v_new_value := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_action := TG_TABLE_NAME || '_deleted';
    v_old_value := to_jsonb(OLD);
    v_new_value := NULL;
  END IF;
  
  -- Insert audit log
  INSERT INTO public.audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_value,
    new_value,
    metadata
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    v_action,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    v_old_value,
    v_new_value,
    jsonb_build_object(
      'operation', TG_OP,
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create audit triggers for important tables
DROP TRIGGER IF EXISTS trg_audit_balances ON public.balances;
CREATE TRIGGER trg_audit_balances
AFTER INSERT OR UPDATE OR DELETE ON public.balances
FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

DROP TRIGGER IF EXISTS trg_audit_transactions ON public.transactions;
CREATE TRIGGER trg_audit_transactions
AFTER INSERT OR UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

DROP TRIGGER IF EXISTS trg_audit_positions ON public.positions;
CREATE TRIGGER trg_audit_positions
AFTER INSERT OR UPDATE OR DELETE ON public.positions
FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

-- ============================================
-- 6. ENHANCED RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (privy_user_id = request_privy_user_id());

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (privy_user_id = request_privy_user_id());

-- Balances policies
DROP POLICY IF EXISTS "Users can view own balance" ON public.balances;
CREATE POLICY "Users can view own balance" ON public.balances
  FOR SELECT USING (privy_user_id = request_privy_user_id());

DROP POLICY IF EXISTS "Only system can update balances" ON public.balances;
CREATE POLICY "Only system can update balances" ON public.balances
  FOR UPDATE USING (false); -- Balances can only be updated via functions

-- Transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (privy_user_id = request_privy_user_id());

DROP POLICY IF EXISTS "Users can create transactions" ON public.transactions;
CREATE POLICY "Users can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (privy_user_id = request_privy_user_id());

-- Agents can approve transactions
DROP POLICY IF EXISTS "Agents can update transactions" ON public.transactions;
CREATE POLICY "Agents can update transactions" ON public.transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE privy_user_id = request_privy_user_id() 
      AND role IN ('agent', 'admin')
    )
  );

-- Withdrawal limits policies
DROP POLICY IF EXISTS "Users can view own limits" ON public.withdrawal_limits;
CREATE POLICY "Users can view own limits" ON public.withdrawal_limits
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE privy_user_id = request_privy_user_id())
  );

-- Audit logs - only admins can view
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE privy_user_id = request_privy_user_id() 
      AND role = 'admin'
    )
  );

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================
GRANT SELECT ON public.withdrawal_limits TO authenticated, anon;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_withdrawal_with_lock(uuid, numeric, jsonb) TO authenticated, anon;

-- ============================================
-- 8. INITIALIZE DEFAULT LIMITS FOR EXISTING USERS
-- ============================================
INSERT INTO public.withdrawal_limits (user_id)
SELECT id FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.withdrawal_limits IS 'Daily, weekly, and monthly withdrawal limits per user';
COMMENT ON TABLE public.audit_logs IS 'Audit trail of all important actions for security and compliance';
COMMENT ON FUNCTION public.process_withdrawal_with_lock IS 'Process withdrawal with transaction locking to prevent race conditions';
COMMENT ON COLUMN public.users.role IS 'User role: user, agent, or admin';
