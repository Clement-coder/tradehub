# Toast Notification System - Usage Guide

## Overview
Beautiful toast notifications that slide in from the right, auto-dismiss after 3 seconds, and can be manually closed.

## Features
- ✅ Slides in from right
- ✅ Auto-dismisses after 3 seconds
- ✅ Manual close button
- ✅ 4 types: success, error, warning, info
- ✅ Supports title and description
- ✅ Stacks multiple toasts
- ✅ Fully responsive

## Usage

### 1. Import the hook
```typescript
import { useToast } from '@/components/toast-provider';
```

### 2. Use in your component
```typescript
export default function MyComponent() {
  const toast = useToast();
  
  const handleAction = () => {
    // Success toast
    toast.success('Action completed', 'Your changes have been saved');
    
    // Error toast
    toast.error('Action failed', 'Please try again');
    
    // Warning toast
    toast.warning('Be careful', 'This action cannot be undone');
    
    // Info toast
    toast.info('Did you know?', 'You can use keyboard shortcuts');
  };
  
  return <button onClick={handleAction}>Click me</button>;
}
```

## Examples

### Success Messages
```typescript
// Simple success
toast.success('Withdrawal submitted');

// With description
toast.success('Withdrawal submitted', 'Your request has been sent for approval');

// After successful action
const handleSave = async () => {
  try {
    await saveData();
    toast.success('Saved successfully', 'Your changes have been saved');
  } catch (error) {
    toast.error('Save failed', 'Please try again');
  }
};
```

### Error Messages
```typescript
// Simple error
toast.error('Something went wrong');

// With description
toast.error('Insufficient balance', 'You do not have enough funds');

// API error
try {
  await api.call();
} catch (error) {
  toast.error('Request failed', error.message);
}
```

### Warning Messages
```typescript
// Before dangerous action
toast.warning('Confirm deletion', 'This action cannot be undone');

// Limit warnings
toast.warning('Limit reached', 'You have reached your daily withdrawal limit');
```

### Info Messages
```typescript
// Tips
toast.info('Pro tip', 'Use Ctrl+S to save quickly');

// Status updates
toast.info('Processing', 'Your request is being processed');
```

## Common Use Cases

### Form Submission
```typescript
const handleSubmit = async (data) => {
  try {
    await submitForm(data);
    toast.success('Form submitted', 'We will review your information');
  } catch (error) {
    toast.error('Submission failed', 'Please check your inputs');
  }
};
```

### Withdrawal Flow
```typescript
const handleWithdraw = async () => {
  if (amount > balance) {
    toast.error('Insufficient balance', 'You do not have enough funds');
    return;
  }
  
  try {
    await processWithdrawal(amount);
    toast.success('Withdrawal submitted', 'Your request is pending approval');
  } catch (error) {
    toast.error('Withdrawal failed', 'Please try again or contact support');
  }
};
```

### Trade Execution
```typescript
const handleTrade = async () => {
  try {
    await executeTrade();
    toast.success('Trade executed', 'Your position has been opened');
  } catch (error) {
    toast.error('Trade failed', error.message);
  }
};
```

### Copy to Clipboard
```typescript
const handleCopy = () => {
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard');
};
```

### Data Refresh
```typescript
const handleRefresh = async () => {
  try {
    await fetchData();
    toast.success('Data refreshed', 'Your information has been updated');
  } catch (error) {
    toast.error('Refresh failed', 'Could not update data');
  }
};
```

### Settings Update
```typescript
const handleSaveSettings = async () => {
  try {
    await updateSettings();
    toast.success('Settings saved', 'Your preferences have been updated');
  } catch (error) {
    toast.error('Save failed', 'Could not update settings');
  }
};
```

### File Upload
```typescript
const handleUpload = async (file) => {
  try {
    await uploadFile(file);
    toast.success('File uploaded', `${file.name} has been uploaded successfully`);
  } catch (error) {
    toast.error('Upload failed', 'Please try again with a smaller file');
  }
};
```

### Authentication
```typescript
// Login success
toast.success('Welcome back!', 'You have successfully logged in');

// Logout
toast.info('Logged out', 'You have been logged out successfully');

// Session expired
toast.warning('Session expired', 'Please log in again');
```

### Validation Errors
```typescript
if (!email) {
  toast.error('Email required', 'Please enter your email address');
  return;
}

if (!isValidEmail(email)) {
  toast.error('Invalid email', 'Please enter a valid email address');
  return;
}
```

## Styling

The toasts automatically match your theme:
- Success: Green
- Error: Red
- Warning: Orange
- Info: Blue

They also support dark mode automatically.

## Best Practices

1. **Keep messages short** - Users should understand at a glance
2. **Use descriptions for details** - Add context when needed
3. **Don't spam toasts** - One toast per action
4. **Use appropriate types** - Match the severity
5. **Provide actionable info** - Tell users what to do next

## Examples in TradeHub

Already implemented in:
- ✅ Wallet refresh
- ✅ Withdrawal submission
- ✅ Insufficient balance errors

To add to:
- [ ] Trade execution
- [ ] Position close
- [ ] Settings save
- [ ] Profile update
- [ ] Copy actions
- [ ] Agent approvals
