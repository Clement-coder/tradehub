'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Copy, Calendar } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { usePrivy } from '@privy-io/react-auth';

export default function ProfilePage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { user } = useTradingContext();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && ready && !authenticated) {
      router.push('/auth');
    }
  }, [mounted, ready, authenticated, router]);

  if (!mounted || !ready || !authenticated || !user) {
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
      <div className="border-b border-border bg-gradient-to-r from-[oklch(0.62_0.13_320)]/10 to-[oklch(0.68_0.11_40)]/10">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
          <p className="text-muted-foreground text-sm">View and manage your account details</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-[oklch(0.62_0.13_320)]/10 to-[oklch(0.68_0.11_40)]/10 border border-[oklch(0.62_0.13_320)]/30 rounded-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[oklch(0.62_0.13_320)]/20 to-[oklch(0.68_0.11_40)]/20 flex items-center justify-center flex-shrink-0 border-2 border-[oklch(0.62_0.13_320)]/30">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-[oklch(0.62_0.13_320)]" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{user.name || 'User Profile'}</h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>

          {/* Account Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card/50 rounded-lg p-4 border border-[oklch(0.65_0.15_260)]/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[oklch(0.65_0.15_260)]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[oklch(0.65_0.15_260)]" />
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground">Name</h3>
              </div>
              <p className="text-base text-foreground font-medium ml-13">{user.name || 'N/A'}</p>
            </div>

            <div className="bg-card/50 rounded-lg p-4 border border-[oklch(0.72_0.12_140)]/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[oklch(0.72_0.12_140)]/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[oklch(0.72_0.12_140)]" />
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground">Email</h3>
              </div>
              <p className="text-base text-foreground font-medium ml-13 truncate">{user.email || 'N/A'}</p>
            </div>

            <div className="bg-card/50 rounded-lg p-4 border border-[oklch(0.68_0.14_180)]/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[oklch(0.68_0.14_180)]/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[oklch(0.68_0.14_180)]"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground">Login Method</h3>
              </div>
              <p className="text-base text-foreground font-medium ml-13">{user.loginMethod || 'N/A'}</p>
            </div>

            <div className="bg-card/50 rounded-lg p-4 border border-[oklch(0.68_0.11_40)]/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[oklch(0.68_0.11_40)]/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[oklch(0.68_0.11_40)]" />
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground">Joined</h3>
              </div>
              <p className="text-base text-foreground font-medium ml-13">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-6">Account Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[oklch(0.72_0.12_140)]/10 border border-[oklch(0.72_0.12_140)]/30 rounded-lg p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[oklch(0.72_0.12_140)]/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[oklch(0.72_0.12_140)]"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Trading</p>
              <span className="text-[oklch(0.72_0.12_140)] font-semibold">Active</span>
            </div>

            <div className="bg-[oklch(0.68_0.14_180)]/10 border border-[oklch(0.68_0.14_180)]/30 rounded-lg p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[oklch(0.68_0.14_180)]/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[oklch(0.68_0.14_180)]"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><line x1="18" x2="18" y1="12" y2="12.01"/></svg>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Withdrawal</p>
              <span className="text-[oklch(0.68_0.14_180)] font-semibold">Enabled</span>
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <p className="text-sm text-muted-foreground mb-1">2FA</p>
              <span className="text-muted-foreground font-semibold">Not Set</span>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-gradient-to-br from-[oklch(0.68_0.11_40)]/10 to-[oklch(0.65_0.15_260)]/10 border border-[oklch(0.68_0.11_40)]/30 rounded-xl p-6 sm:p-8">
          <h3 className="font-semibold text-lg sm:text-xl text-foreground mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[oklch(0.68_0.11_40)]"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            Account Information
          </h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-[oklch(0.68_0.11_40)] mt-0.5">•</span>
              <span>This account uses real data</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[oklch(0.68_0.11_40)] mt-0.5">•</span>
              <span>Real funds are involved in all transactions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[oklch(0.68_0.11_40)] mt-0.5">•</span>
              <span>All trades and balances are real</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[oklch(0.68_0.11_40)] mt-0.5">•</span>
              <span>Data may be reset at any time</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
