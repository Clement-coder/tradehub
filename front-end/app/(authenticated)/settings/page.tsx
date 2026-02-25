'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ToggleLeftIcon as ToggleIcon, Bell, Eye, Lock } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { usePrivy } from '@privy-io/react-auth';

export default function SettingsPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { user } = useTradingContext();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    priceAlerts: true,
    emailUpdates: false,
    darkMode: true,
    soundEnabled: true,
  });

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

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-gradient-to-r from-[oklch(0.68_0.11_40)]/10 to-[oklch(0.65_0.15_260)]/10">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground text-sm">Configure your account preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Notifications */}
        <div className="bg-gradient-to-br from-[oklch(0.65_0.15_260)]/10 to-[oklch(0.72_0.12_140)]/10 border border-[oklch(0.65_0.15_260)]/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[oklch(0.65_0.15_260)]/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[oklch(0.65_0.15_260)]" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 bg-card/50 rounded-lg px-4">
              <div>
                <p className="font-medium text-foreground">Trade Notifications</p>
                <p className="text-sm text-muted-foreground">Receive alerts for completed trades</p>
              </div>
              <button
                onClick={() => toggleSetting('notifications')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.notifications ? 'bg-[oklch(0.72_0.12_140)]' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 bg-card/50 rounded-lg px-4">
              <div>
                <p className="font-medium text-foreground">Price Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified for price changes</p>
              </div>
              <button
                onClick={() => toggleSetting('priceAlerts')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.priceAlerts ? 'bg-[oklch(0.72_0.12_140)]' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.priceAlerts ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 bg-card/50 rounded-lg px-4">
              <div>
                <p className="font-medium text-foreground">Email Updates</p>
                <p className="text-sm text-muted-foreground">Receive weekly summary emails</p>
              </div>
              <button
                onClick={() => toggleSetting('emailUpdates')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.emailUpdates ? 'bg-[oklch(0.72_0.12_140)]' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.emailUpdates ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-gradient-to-br from-[oklch(0.68_0.14_180)]/10 to-[oklch(0.62_0.13_320)]/10 border border-[oklch(0.68_0.14_180)]/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[oklch(0.68_0.14_180)]/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-[oklch(0.68_0.14_180)]" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Display</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 bg-card/50 rounded-lg px-4">
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Use dark theme by default</p>
              </div>
              <button
                onClick={() => toggleSetting('darkMode')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.darkMode ? 'bg-[oklch(0.68_0.14_180)]' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.darkMode ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 bg-card/50 rounded-lg px-4">
              <div>
                <p className="font-medium text-foreground">Sound Effects</p>
                <p className="text-sm text-muted-foreground">Play sounds for trade execution</p>
              </div>
              <button
                onClick={() => toggleSetting('soundEnabled')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-[oklch(0.68_0.14_180)]' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-gradient-to-br from-[oklch(0.62_0.13_320)]/10 to-[oklch(0.68_0.11_40)]/10 border border-[oklch(0.62_0.13_320)]/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[oklch(0.62_0.13_320)]/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[oklch(0.62_0.13_320)]" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Security</h2>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 bg-card/50 rounded-lg px-4">
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-[oklch(0.62_0.13_320)]/20 border border-[oklch(0.62_0.13_320)]/30 text-[oklch(0.62_0.13_320)] font-medium hover:bg-[oklch(0.62_0.13_320)]/30 transition-colors">
                Set Up
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 bg-card/50 rounded-lg px-4">
              <div>
                <p className="font-medium text-foreground">API Keys</p>
                <p className="text-sm text-muted-foreground">Manage API access for trading</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-[oklch(0.62_0.13_320)]/20 border border-[oklch(0.62_0.13_320)]/30 text-[oklch(0.62_0.13_320)] font-medium hover:bg-[oklch(0.62_0.13_320)]/30 transition-colors">
                Manage
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 bg-card/50 rounded-lg px-4">
              <div>
                <p className="font-medium text-foreground">Active Sessions</p>
                <p className="text-sm text-muted-foreground">Manage your connected devices</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-[oklch(0.62_0.13_320)]/20 border border-[oklch(0.62_0.13_320)]/30 text-[oklch(0.62_0.13_320)] font-medium hover:bg-[oklch(0.62_0.13_320)]/30 transition-colors">
                View
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground">Danger Zone</h2>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            These actions cannot be undone. Please be careful.
          </p>
          <button className="px-6 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-500 font-semibold hover:bg-red-500/30 transition-colors">
            Reset Account
          </button>
        </div>
      </div>
    </div>
  );
}
