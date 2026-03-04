-- =====================================================
-- TRADEHUB SECURITY HARDENING
-- Production-ready security fixes for Supabase
-- Note: This complements existing policies in other SQL files
-- =====================================================

-- Note: Anonymous access is disabled via Supabase Dashboard > Authentication > Settings
-- This cannot be done via SQL - must be configured in the dashboard

-- =====================================================
-- ENSURE ROW LEVEL SECURITY IS ENABLED
-- (These may already be enabled by other files)
-- =====================================================

-- Enable RLS on core tables (idempotent)
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- REMOVE ONLY PERMISSIVE POLICIES
-- Only drop policies that are explicitly permissive
-- =====================================================

-- Remove any overly permissive policies (these shouldn't exist but just in case)
DROP POLICY IF EXISTS "allow_all_access" ON public.users;
DROP POLICY IF EXISTS "public_read_access" ON public.users;
DROP POLICY IF EXISTS "anonymous_access" ON public.users;
DROP POLICY IF EXISTS "allow_all_access" ON public.balances;
DROP POLICY IF EXISTS "public_read_access" ON public.balances;
DROP POLICY IF EXISTS "anonymous_access" ON public.balances;
DROP POLICY IF EXISTS "allow_all_access" ON public.transactions;
DROP POLICY IF EXISTS "public_read_access" ON public.transactions;
DROP POLICY IF EXISTS "anonymous_access" ON public.transactions;
DROP POLICY IF EXISTS "allow_all_access" ON public.positions;
DROP POLICY IF EXISTS "public_read_access" ON public.positions;
DROP POLICY IF EXISTS "anonymous_access" ON public.positions;
DROP POLICY IF EXISTS "allow_all_access" ON public.trades;
DROP POLICY IF EXISTS "public_read_access" ON public.trades;
DROP POLICY IF EXISTS "anonymous_access" ON public.trades;
DROP POLICY IF EXISTS "allow_all_access" ON public.notifications;
DROP POLICY IF EXISTS "public_read_access" ON public.notifications;
DROP POLICY IF EXISTS "anonymous_access" ON public.notifications;



-- User ID indexes for fast user-specific queries (from 001_schema.sql, but ensuring they exist)
CREATE INDEX IF NOT EXISTS idx_users_privy_user_id ON public.users(privy_user_id);
CREATE INDEX IF NOT EXISTS idx_balances_privy_user_id ON public.balances(privy_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_privy_user_id ON public.transactions(privy_user_id);
CREATE INDEX IF NOT EXISTS idx_positions_privy_user_id ON public.positions(privy_user_id);
CREATE INDEX IF NOT EXISTS idx_trades_privy_user_id ON public.trades(privy_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_privy_user_id ON public.notifications(privy_user_id);

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_trades_closed_at ON public.trades(closed_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_positions_is_open ON public.positions(is_open);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(unread);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- =====================================================
-- SECURE FUNCTIONS
-- Fix any functions with mutable search_path
-- =====================================================

-- Set immutable search_path for all custom functions (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.handle_new_user() SET search_path = public, auth;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_portfolio_value' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.calculate_portfolio_value() SET search_path = public;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_wallet_balance' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.update_wallet_balance() SET search_path = public;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'request_privy_user_id' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER FUNCTION public.request_privy_user_id() SET search_path = public;
    END IF;
END $$;

-- =====================================================
-- AUDIT AND MONITORING
-- Enable audit logging for sensitive operations
-- =====================================================

-- Note: These settings require superuser privileges and may not work in Supabase
-- They are included for reference in self-hosted PostgreSQL environments

-- Enable statement logging for DDL changes (if supported)
-- ALTER SYSTEM SET log_statement = 'ddl';

-- Log all authentication attempts (if supported)  
-- ALTER SYSTEM SET log_connections = on;
-- ALTER SYSTEM SET log_disconnections = on;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.users IS 'User accounts with Privy authentication integration';
COMMENT ON TABLE public.balances IS 'User account balances with currency support';
COMMENT ON TABLE public.transactions IS 'All financial transactions with audit trail';
COMMENT ON TABLE public.positions IS 'Trading positions (open and closed)';
COMMENT ON TABLE public.trades IS 'Completed trades with P&L calculations';
COMMENT ON TABLE public.notifications IS 'User notifications and alerts';

-- =====================================================
-- FINAL SECURITY VALIDATION
-- =====================================================

-- Create a view to check RLS status (for monitoring)
CREATE OR REPLACE VIEW public.security_status AS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE schemaname = t.schemaname AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;
