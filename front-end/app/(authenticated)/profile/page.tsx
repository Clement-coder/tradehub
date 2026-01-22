'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Copy, Calendar } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useTradingContext();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push('/auth');
    }
  }, [mounted, user, router]);

  if (!mounted || !user) {
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinDate = new Date();

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
          <p className="text-muted-foreground text-sm">View and manage your account details</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-2xl space-y-6">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{user.email}</h2>
              <p className="text-muted-foreground text-sm">Demo Account</p>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Email Address</h3>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{user.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Account ID</h3>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-3 py-1 rounded text-foreground font-mono">
                  {user.id}
                </code>
                <button
                  onClick={() => copyToClipboard(user.id)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Wallet Address</h3>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-3 py-1 rounded text-foreground font-mono truncate">
                  {user.walletAddress}
                </code>
                <button
                  onClick={() => copyToClipboard(user.walletAddress)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              {copied && <p className="text-xs text-accent">Copied to clipboard</p>}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Account Created</h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{joinDate.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Account Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-foreground">Trading</span>
              <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border pt-3">
              <span className="text-foreground">Withdrawal</span>
              <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border pt-3">
              <span className="text-foreground">Two-Factor Auth</span>
              <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium">Not Set</span>
            </div>
          </div>
        </div>

        {/* Demo Information */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-2">This is a Demo Account</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>This account uses simulated data for demonstration purposes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>No real funds are involved in any transactions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>All trades and balances are for testing only</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Data may be reset at any time</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
