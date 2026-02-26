# Security Improvements Setup Guide

## What We Fixed

### 1. **Transaction Locking** 🔒
**Problem:** Two withdrawals at the same time could both succeed, causing negative balance.

**Solution:** Database row locking ensures only one operation can modify a balance at a time.

**How it works:**
```sql
-- This locks the row until the transaction completes
SELECT amount FROM balances WHERE user_id = '...' FOR UPDATE;
```

### 2. **Withdrawal Limits** 💰
**Problem:** Users could withdraw unlimited amounts.

**Solution:** Daily, weekly, and monthly limits per user.

**Default Limits:**
- Daily: $1,000
- Weekly: $5,000
- Monthly: $20,000

### 3. **Audit Logs** 📝
**Problem:** No record of who did what and when.

**Solution:** Every important action is logged with:
- Who performed the action
- What changed (old value → new value)
- When it happened
- IP address and user agent

**What gets logged:**
- Balance changes
- Transaction approvals
- Position opens/closes
- All database modifications

### 4. **Row Level Security (RLS)** 🛡️
**Problem:** Users could potentially see other users' data.

**Solution:** Database-level security policies ensure users only see their own data.

**Policies:**
- Users can only view their own balances, transactions, positions
- Agents can approve transactions
- Admins can view audit logs

### 5. **Error Tracking** 🐛
**Problem:** Errors happen silently, no way to know what's breaking.

**Solution:** Sentry integration captures all errors with context.

---

## Installation Steps

### Step 1: Run SQL Migration

1. Go to **Supabase Dashboard → SQL Editor**
2. Create new query
3. Copy and paste `/sql/005_security_improvements.sql`
4. Click **Run**

This will:
- Add user roles (user, agent, admin)
- Create withdrawal_limits table
- Create audit_logs table
- Add transaction locking function
- Enable RLS policies
- Set up audit triggers

### Step 2: Set Up Error Tracking

1. **Create Sentry Account**
   - Go to https://sentry.io
   - Sign up for free account
   - Create new project (Next.js)
   - Copy your DSN

2. **Add to Environment Variables**
   
   Edit `front-end/.env`:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

3. **Sentry is already configured** in:
   - `sentry.client.config.ts` (browser errors)
   - `sentry.server.config.ts` (server errors)
   - `sentry.edge.config.ts` (edge runtime errors)

### Step 3: Update Frontend Code

The withdrawal function needs to use the new locked transaction:

```typescript
// In your withdrawal handler
const result = await supabase.rpc('process_withdrawal_with_lock', {
  p_user_id: user.id,
  p_amount: amount,
  p_metadata: {
    destination_address: address,
    network: network,
    // ... other metadata
  }
});

if (result.data?.success) {
  // Withdrawal successful
  console.log('Transaction ID:', result.data.transaction_id);
} else {
  // Show error to user
  console.error(result.data?.error);
}
```

---

## How to Use

### For Users

**Withdrawal Limits:**
- Users can see their limits in the wallet page
- If limit is exceeded, withdrawal will fail with clear message
- Limits reset automatically (daily at midnight, weekly on Monday, monthly on 1st)

### For Agents

**Approving Withdrawals:**
1. Go to Supabase → Table Editor → transactions
2. Find pending withdrawal
3. Set `approved = true`
4. User receives notification

**Viewing Audit Logs:**
1. Go to Supabase → Table Editor → audit_logs
2. Filter by user_id, action, or date
3. See complete history of all actions

**Adjusting Withdrawal Limits:**
1. Go to Supabase → Table Editor → withdrawal_limits
2. Find user
3. Update daily_limit, weekly_limit, or monthly_limit

### For Admins

**Making Someone an Agent:**
```sql
UPDATE users 
SET role = 'agent' 
WHERE email = 'agent@example.com';
```

**Making Someone an Admin:**
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

**Viewing All Audit Logs:**
```sql
SELECT 
  al.*,
  u.email as user_email,
  a.email as agent_email
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
LEFT JOIN users a ON al.agent_id = a.id
ORDER BY al.created_at DESC
LIMIT 100;
```

---

## Testing

### Test Transaction Locking

Try to withdraw the same amount twice simultaneously:

```javascript
// This should fail on the second attempt
Promise.all([
  supabase.rpc('process_withdrawal_with_lock', { p_user_id: userId, p_amount: 500 }),
  supabase.rpc('process_withdrawal_with_lock', { p_user_id: userId, p_amount: 500 })
]);
```

Expected: One succeeds, one fails with "Insufficient balance"

### Test Withdrawal Limits

Try to withdraw more than daily limit:

```javascript
// If daily limit is $1000, this should fail
supabase.rpc('process_withdrawal_with_lock', { 
  p_user_id: userId, 
  p_amount: 1500 
});
```

Expected: Fails with "Daily withdrawal limit exceeded"

### Test Audit Logs

1. Make a withdrawal
2. Check audit_logs table
3. Should see entries for:
   - Balance update
   - Transaction creation

### Test RLS Policies

Try to access another user's data:

```javascript
// Should return empty or error
const { data } = await supabase
  .from('balances')
  .select('*')
  .eq('user_id', 'some-other-user-id');
```

Expected: No data returned (RLS blocks it)

---

## Monitoring

### Sentry Dashboard

After setup, you'll see in Sentry:
- All JavaScript errors
- API errors
- Performance issues
- User sessions with errors

### Audit Log Queries

**Most active users:**
```sql
SELECT user_id, COUNT(*) as action_count
FROM audit_logs
WHERE created_at > now() - interval '7 days'
GROUP BY user_id
ORDER BY action_count DESC
LIMIT 10;
```

**Recent agent actions:**
```sql
SELECT 
  a.email as agent_email,
  al.action,
  al.created_at
FROM audit_logs al
JOIN users a ON al.agent_id = a.id
WHERE a.role IN ('agent', 'admin')
ORDER BY al.created_at DESC
LIMIT 50;
```

**Failed withdrawal attempts:**
```sql
SELECT 
  u.email,
  t.amount,
  t.metadata->>'error' as error_reason,
  t.created_at
FROM transactions t
JOIN users u ON t.user_id = u.id
WHERE t.status = 'failed'
  AND t.type = 'withdrawal'
ORDER BY t.created_at DESC;
```

---

## Security Best Practices

1. **Never expose service role key** - Only use anon key in frontend
2. **Always use RLS policies** - Never bypass with service role in user-facing code
3. **Review audit logs regularly** - Check for suspicious activity
4. **Monitor Sentry daily** - Fix errors quickly
5. **Adjust limits based on user trust** - Verified users can have higher limits
6. **Backup database daily** - Audit logs are critical for compliance

---

## Troubleshooting

### "Function does not exist"
- Make sure you ran the SQL migration
- Check function name: `process_withdrawal_with_lock`

### "Permission denied"
- Check RLS policies are enabled
- Verify user has correct role
- Check grants: `GRANT EXECUTE ON FUNCTION ...`

### Sentry not capturing errors
- Verify DSN is correct in .env
- Check Sentry dashboard for project status
- Errors only sent in production mode

### Withdrawal limits not resetting
- Check server timezone matches expected timezone
- Verify last_daily_reset timestamps
- Run manual reset if needed:
  ```sql
  UPDATE withdrawal_limits 
  SET daily_used = 0, last_daily_reset = now()
  WHERE user_id = '...';
  ```

---

## Next Steps

After implementing these fixes, consider:

1. **Email notifications** when withdrawal limits are reached
2. **2FA requirement** for large withdrawals
3. **KYC verification** to increase limits
4. **Automated fraud detection** based on audit logs
5. **Agent dashboard** instead of using Supabase directly

---

## Support

If you encounter issues:
1. Check Sentry for error details
2. Review audit_logs for what happened
3. Check Supabase logs
4. Contact development team with transaction ID
