-- Transaction Status Management and Auto-Transaction Creation
-- Run this in Supabase SQL Editor after 001_schema.sql and 002_rls_policies.sql

-- Add approved column to transactions table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'approved'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN approved boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Create index for approved status
CREATE INDEX IF NOT EXISTS idx_transactions_approved ON public.transactions(approved);

-- Function to automatically create transaction when balance is updated
CREATE OR REPLACE FUNCTION public.auto_create_transaction_on_balance_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_privy_user_id text;
  v_amount_change numeric(20, 8);
BEGIN
  -- Only proceed if amount actually changed
  IF NEW.amount != OLD.amount THEN
    v_amount_change := NEW.amount - OLD.amount;
    
    -- Get user details
    SELECT id, privy_user_id INTO v_user_id, v_privy_user_id
    FROM public.users
    WHERE id = NEW.user_id;
    
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
    ) VALUES (
      v_user_id,
      v_privy_user_id,
      CASE WHEN v_amount_change > 0 THEN 'deposit' ELSE 'withdrawal' END,
      v_amount_change,
      OLD.amount,
      NEW.amount,
      'completed',
      true, -- Auto-approved for platform deposits
      jsonb_build_object(
        'source', 'platform',
        'funded_by', 'TradeHub Platform',
        'note', 'Balance updated by platform agent',
        'auto_generated', true,
        'updated_at', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-transaction creation
DROP TRIGGER IF EXISTS trg_auto_create_transaction ON public.balances;
CREATE TRIGGER trg_auto_create_transaction
AFTER UPDATE ON public.balances
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_transaction_on_balance_update();

-- Function to update transaction status (for agents to approve withdrawals)
CREATE OR REPLACE FUNCTION public.approve_transaction(
  p_transaction_id uuid,
  p_approved boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_transaction record;
BEGIN
  -- Get transaction details
  SELECT * INTO v_transaction
  FROM public.transactions
  WHERE id = p_transaction_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Transaction not found'
    );
  END IF;
  
  -- Update transaction status
  UPDATE public.transactions
  SET 
    approved = p_approved,
    status = CASE 
      WHEN p_approved THEN 'completed'
      ELSE 'pending'
    END,
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'approved_at', NOW(),
      'approved', p_approved
    )
  WHERE id = p_transaction_id;
  
  -- Return result
  SELECT jsonb_build_object(
    'success', true,
    'transaction_id', id,
    'approved', approved,
    'status', status,
    'amount', amount,
    'type', type
  ) INTO v_result
  FROM public.transactions
  WHERE id = p_transaction_id;
  
  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.approve_transaction(uuid, boolean) TO authenticated, anon;

-- Update existing transactions to have approved status
UPDATE public.transactions
SET approved = true
WHERE status = 'completed' AND approved IS NULL;

UPDATE public.transactions
SET approved = false
WHERE status = 'pending' AND approved IS NULL;

COMMENT ON COLUMN public.transactions.approved IS 'Agent approval status: true = approved/successful, false = pending approval';
COMMENT ON FUNCTION public.auto_create_transaction_on_balance_update() IS 'Automatically creates transaction record when balance is updated via SQL';
COMMENT ON FUNCTION public.approve_transaction(uuid, boolean) IS 'Approve or reject a transaction (for agent use)';
