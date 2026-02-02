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
      <div className="p-4 sm:p-6 lg:p-8 max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto space-y-6 sm:space-y-8">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{user.email || 'User Profile'}</h2>
              <p className="text-muted-foreground text-sm">Account</p>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground">Name</h3>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <span className="text-sm sm:text-base text-foreground">{user.name || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground">Email Address</h3>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <span className="text-sm sm:text-base text-foreground">{user.email || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground">Sign-up Method</h3>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-in text-muted-foreground"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                <span className="text-sm sm:text-base text-foreground">{user.loginMethod || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground">Account Created</h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <span className="text-sm sm:text-base text-foreground">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Account Status</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm sm:text-base text-foreground">Trading</span>
              <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border pt-3">
              <span className="text-sm sm:text-base text-foreground">Withdrawal</span>
              <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border pt-3">
              <span className="text-sm sm:text-base text-foreground">Two-Factor Auth</span>
              <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium">Not Set</span>
            </div>
          </div>
        </div>

        {/* Account Information */ }
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 sm:p-8">
          <h3 className="font-semibold text-lg sm:text-xl text-foreground mb-2">Account Information</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>This account uses real data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Real funds are involved in all transactions</span>
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
