'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ToggleLeftIcon as ToggleIcon, Bell, Eye, Lock } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';

export default function SettingsPage() {
  const router = useRouter();
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
    if (mounted && !user) {
      router.push('/auth');
    }
  }, [mounted, user, router]);

  if (!mounted || !user) {
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
      <div className="p-6 max-w-2xl space-y-6">
        {/* Notifications */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">Trade Notifications</p>
                <p className="text-sm text-muted-foreground">Receive alerts for completed trades</p>
              </div>
              <button
                onClick={() => toggleSetting('notifications')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.notifications ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-border pt-3">
              <div>
                <p className="font-medium text-foreground">Price Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified for price changes</p>
              </div>
              <button
                onClick={() => toggleSetting('priceAlerts')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.priceAlerts ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.priceAlerts ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-border pt-3">
              <div>
                <p className="font-medium text-foreground">Email Updates</p>
                <p className="text-sm text-muted-foreground">Receive weekly summary emails</p>
              </div>
              <button
                onClick={() => toggleSetting('emailUpdates')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.emailUpdates ? 'bg-primary' : 'bg-muted'
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
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Display</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Use dark theme by default</p>
              </div>
              <button
                onClick={() => toggleSetting('darkMode')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.darkMode ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.darkMode ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-border pt-3">
              <div>
                <p className="font-medium text-foreground">Sound Effects</p>
                <p className="text-sm text-muted-foreground">Play sounds for trade execution</p>
              </div>
              <button
                onClick={() => toggleSetting('soundEnabled')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-primary' : 'bg-muted'
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
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Security</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <button className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-primary/25 to-primary/15 border border-primary/40">
                <span className="text-primary">Set Up</span>
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-border pt-3">
              <div>
                <p className="font-medium text-foreground">API Keys</p>
                <p className="text-sm text-muted-foreground">Manage API access for trading</p>
              </div>
              <button className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-primary/25 to-primary/15 border border-primary/40">
                <span className="text-primary">Manage</span>
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-border pt-3">
              <div>
                <p className="font-medium text-foreground">Active Sessions</p>
                <p className="text-sm text-muted-foreground">Manage your connected devices</p>
              </div>
              <button className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-primary/25 to-primary/15 border border-primary/40">
                <span className="text-primary">View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Danger Zone</h2>
          <p className="text-muted-foreground text-sm mb-4">
            These actions cannot be undone. Please be careful.
          </p>
          <button className="px-4 py-2 rounded-lg border border-destructive/30 text-destructive font-medium hover:bg-destructive/5 transition-colors">
            Reset Account
          </button>
        </div>
      </div>
    </div>
  );
}
