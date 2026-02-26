# Agent Guide: Managing User Transactions

## Overview
This guide explains how platform agents can manage user deposits, withdrawals, and transaction approvals using the Supabase dashboard.

## Setup

1. **Run the SQL Migration**
   - Go to Supabase Dashboard → SQL Editor
   - Open and run `/sql/003_transaction_status_and_triggers.sql`
   - This adds the `approved` column and auto-transaction triggers

## Managing Transactions

### Understanding Transaction Status

- **`approved = false`**: Transaction is pending agent approval (shows as "Pending Approval" to user)
- **`approved = true`**: Transaction is approved and successful (shows as "Approved - Successful" to user)

### Approving/Rejecting Withdrawals

When a user submits a withdrawal and shares the receipt:

1. Go to **Supabase Dashboard → Table Editor → transactions**
2. Find the transaction by ID (from the receipt)
3. Update the `approved` column:
   - Set to `true` to approve
   - Keep as `false` to keep pending
4. The status will automatically update for the user

**Using SQL Editor (Alternative):**
```sql
-- Approve a transaction
SELECT approve_transaction('transaction-uuid-here', true);

-- Reject/Keep pending
SELECT approve_transaction('transaction-uuid-here', false);
```

## Adding Funds to User Account

### Method 1: Direct Balance Update (Recommended)

1. Go to **Supabase Dashboard → Table Editor → balances**
2. Find the user's balance row
3. Update the `amount` field with the new balance
4. **A transaction record is automatically created** with:
   - Type: `deposit`
   - Status: `completed`
   - Approved: `true`
   - Metadata includes: "funded by TradeHub Platform"

**Example:**
- User current balance: $1000
- User deposits: $500
- Update balance to: $1500
- System automatically creates transaction for +$500

### Method 2: Using SQL Editor

```sql
-- Update user balance (replace with actual user_id and new amount)
UPDATE balances
SET amount = 1500.00
WHERE user_id = 'user-uuid-here';

-- The trigger automatically creates a transaction record
```

### Method 3: Manual Transaction Creation

If you need more control:

```sql
-- Get user details first
SELECT id, privy_user_id, amount FROM balances WHERE user_id = 'user-uuid-here';

-- Create transaction manually
INSERT INTO transactions (
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
  'user-uuid-here',
  'privy-user-id-here',
  'deposit',
  500.00,
  1000.00,
  1500.00,
  'completed',
  true,
  '{"source": "platform", "funded_by": "Agent Name", "note": "Deposit via agent"}'::jsonb
);

-- Then update the balance
UPDATE balances
SET amount = 1500.00
WHERE user_id = 'user-uuid-here';
```

## Transaction Types

- **`deposit`**: User added funds (via agent)
- **`withdrawal`**: User withdrew funds (needs approval)
- **`trade_open`**: User opened a trading position
- **`trade_close`**: User closed a trading position

## Workflow Example

### User Deposits $500

1. User contacts agent with deposit request
2. Agent receives payment from user
3. Agent goes to Supabase → balances table
4. Agent updates user's balance: `1000` → `1500`
5. System automatically creates transaction record showing +$500 deposit
6. User sees the deposit in their transaction history immediately

### User Withdraws $300

1. User submits withdrawal request in app
2. User receives receipt with transaction ID and security code
3. User shares receipt with agent
4. Agent verifies receipt authenticity (QR code, security code)
5. Agent processes payment to user
6. Agent goes to Supabase → transactions table
7. Agent finds transaction by ID and sets `approved = true`
8. User's receipt status updates to "Approved - Successful"

## Security Features

Each receipt includes:
- **Unique Security Code**: Generated from transaction ID + timestamp
- **QR Code**: Contains encrypted transaction data
- **Watermark**: "TRADEHUB" background text
- **Official Branding**: Logo and official receipt header

Agents should verify these before processing withdrawals.

## Important Notes

1. **Always verify receipt authenticity** before processing withdrawals
2. **Balance updates automatically create transactions** - no need to create them manually
3. **Approved transactions cannot be reversed** - double-check before approving
4. **Transaction history is permanent** - all changes are logged
5. **Users can view all transactions** in their wallet page

## Support

For technical issues or questions, contact the development team.
