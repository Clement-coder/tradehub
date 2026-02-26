-- Add user identification columns to all tables
-- Run this in Supabase SQL Editor

-- Add user_email and user_name columns to transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS user_email text,
ADD COLUMN IF NOT EXISTS user_name text;

-- Add user_email and user_name columns to positions
ALTER TABLE public.positions 
ADD COLUMN IF NOT EXISTS user_email text,
ADD COLUMN IF NOT EXISTS user_name text;

-- Add user_email and user_name columns to trades
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS user_email text,
ADD COLUMN IF NOT EXISTS user_name text;

-- Add user_email and user_name columns to notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS user_email text,
ADD COLUMN IF NOT EXISTS user_name text;

-- Add user_email and user_name columns to balances
ALTER TABLE public.balances 
ADD COLUMN IF NOT EXISTS user_email text,
ADD COLUMN IF NOT EXISTS user_name text;

-- Function to sync user info to all related tables
CREATE OR REPLACE FUNCTION public.sync_user_info_to_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update transactions
  UPDATE public.transactions t
  SET 
    user_email = u.email,
    user_name = COALESCE(u.username, u.email, 'User')
  FROM public.users u
  WHERE t.user_id = u.id;

  -- Update positions
  UPDATE public.positions p
  SET 
    user_email = u.email,
    user_name = COALESCE(u.username, u.email, 'User')
  FROM public.users u
  WHERE p.user_id = u.id;

  -- Update trades
  UPDATE public.trades t
  SET 
    user_email = u.email,
    user_name = COALESCE(u.username, u.email, 'User')
  FROM public.users u
  WHERE t.user_id = u.id;

  -- Update notifications
  UPDATE public.notifications n
  SET 
    user_email = u.email,
    user_name = COALESCE(u.username, u.email, 'User')
  FROM public.users u
  WHERE n.user_id = u.id;

  -- Update balances
  UPDATE public.balances b
  SET 
    user_email = u.email,
    user_name = COALESCE(u.username, u.email, 'User')
  FROM public.users u
  WHERE b.user_id = u.id;
END;
$$;

-- Trigger function to auto-populate user info on insert
CREATE OR REPLACE FUNCTION public.auto_populate_user_info()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email text;
  v_name text;
BEGIN
  -- Get user email and name
  SELECT email, COALESCE(username, email, 'User')
  INTO v_email, v_name
  FROM public.users
  WHERE id = NEW.user_id;

  -- Set the values
  NEW.user_email := v_email;
  NEW.user_name := v_name;

  RETURN NEW;
END;
$$;

-- Create triggers for all tables
DROP TRIGGER IF EXISTS trg_transactions_user_info ON public.transactions;
CREATE TRIGGER trg_transactions_user_info
BEFORE INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.auto_populate_user_info();

DROP TRIGGER IF EXISTS trg_positions_user_info ON public.positions;
CREATE TRIGGER trg_positions_user_info
BEFORE INSERT ON public.positions
FOR EACH ROW
EXECUTE FUNCTION public.auto_populate_user_info();

DROP TRIGGER IF EXISTS trg_trades_user_info ON public.trades;
CREATE TRIGGER trg_trades_user_info
BEFORE INSERT ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.auto_populate_user_info();

DROP TRIGGER IF EXISTS trg_notifications_user_info ON public.notifications;
CREATE TRIGGER trg_notifications_user_info
BEFORE INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.auto_populate_user_info();

DROP TRIGGER IF EXISTS trg_balances_user_info ON public.balances;
CREATE TRIGGER trg_balances_user_info
BEFORE INSERT ON public.balances
FOR EACH ROW
EXECUTE FUNCTION public.auto_populate_user_info();

-- Trigger to update user info when user table changes
CREATE OR REPLACE FUNCTION public.update_user_info_everywhere()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update all related tables when user email or username changes
  IF (OLD.email IS DISTINCT FROM NEW.email) OR (OLD.username IS DISTINCT FROM NEW.username) THEN
    UPDATE public.transactions
    SET 
      user_email = NEW.email,
      user_name = COALESCE(NEW.username, NEW.email, 'User')
    WHERE user_id = NEW.id;

    UPDATE public.positions
    SET 
      user_email = NEW.email,
      user_name = COALESCE(NEW.username, NEW.email, 'User')
    WHERE user_id = NEW.id;

    UPDATE public.trades
    SET 
      user_email = NEW.email,
      user_name = COALESCE(NEW.username, NEW.email, 'User')
    WHERE user_id = NEW.id;

    UPDATE public.notifications
    SET 
      user_email = NEW.email,
      user_name = COALESCE(NEW.username, NEW.email, 'User')
    WHERE user_id = NEW.id;

    UPDATE public.balances
    SET 
      user_email = NEW.email,
      user_name = COALESCE(NEW.username, NEW.email, 'User')
    WHERE user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_update_info ON public.users;
CREATE TRIGGER trg_users_update_info
AFTER UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_user_info_everywhere();

-- Sync existing data
SELECT public.sync_user_info_to_tables();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_email ON public.transactions(user_email);
CREATE INDEX IF NOT EXISTS idx_transactions_user_name ON public.transactions(user_name);
CREATE INDEX IF NOT EXISTS idx_positions_user_email ON public.positions(user_email);
CREATE INDEX IF NOT EXISTS idx_trades_user_email ON public.trades(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON public.notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_balances_user_email ON public.balances(user_email);

COMMENT ON COLUMN public.transactions.user_email IS 'User email for easy identification in table editor';
COMMENT ON COLUMN public.transactions.user_name IS 'User name for easy identification in table editor';
COMMENT ON FUNCTION public.sync_user_info_to_tables() IS 'Syncs user email and name to all related tables';
COMMENT ON FUNCTION public.auto_populate_user_info() IS 'Automatically populates user email and name on insert';
