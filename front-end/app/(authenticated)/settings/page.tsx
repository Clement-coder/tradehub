'use client';
import { FuturisticLoader } from '@/components/futuristic-loader';
import { OfflineDetector } from '@/components/offline-detector';
import { useToast } from '@/components/toast-provider';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Bell, Eye, Lock } from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { usePrivy } from '@privy-io/react-auth';
import { getUserSettings, createDefaultSettings, updateUserSettings, type UserSettings } from '@/lib/supabase-service';

export default function SettingsPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { user } = useTradingContext();
  const toast = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/auth');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      setLoading(true);
      let userSettings = await getUserSettings(user.id, user.privyUserId);
      
      if (!userSettings) {
        userSettings = await createDefaultSettings(user.id, user.privyUserId);
      }
      
      setSettings(userSettings);
      setLoading(false);
    };

    loadSettings();
  }, [user]);

  if (!ready || loading) {
    return <FuturisticLoader />;
  }

  if (!authenticated || !user || !settings) {
    return null;
  }

  const toggleSetting = async (key: keyof Omit<UserSettings, 'id' | 'user_id' | 'privy_user_id' | 'created_at' | 'updated_at'>) => {
    const newValue = !settings[key];
    
    const updated = await updateUserSettings({
      userId: user.id,
      privyUserId: user.privyUserId,
      [key]: newValue,
    });

    if (updated) {
      setSettings(updated);
      toast.success('Settings updated', 'Your preferences have been saved');
    } else {
      toast.error('Update failed', 'Could not save your settings');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <OfflineDetector />
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
                onClick={() => toggleSetting('notifications_enabled')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.notifications_enabled ? 'bg-[oklch(0.72_0.12_140)]' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.notifications_enabled ? 'translate-x-6' : ''
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
                onClick={() => toggleSetting('price_alerts_enabled')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.price_alerts_enabled ? 'bg-[oklch(0.72_0.12_140)]' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.price_alerts_enabled ? 'translate-x-6' : ''
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
                onClick={() => toggleSetting('email_updates_enabled')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.email_updates_enabled ? 'bg-[oklch(0.72_0.12_140)]' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.email_updates_enabled ? 'translate-x-6' : ''
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
                onClick={() => toggleSetting('dark_mode_enabled')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.dark_mode_enabled ? 'bg-[oklch(0.68_0.14_180)]' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.dark_mode_enabled ? 'translate-x-6' : ''
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
                onClick={() => toggleSetting('sound_enabled')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.sound_enabled ? 'bg-[oklch(0.68_0.14_180)]' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.sound_enabled ? 'translate-x-6' : ''
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
                <p className="text-sm text-muted-foreground">Managed through Privy authentication</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-600 font-medium">
                Active
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 bg-card/50 rounded-lg px-4">
              <div>
                <p className="font-medium text-foreground">Connected Wallet</p>
                <p className="text-sm text-muted-foreground font-mono">{user.wallet_address?.slice(0, 6)}...{user.wallet_address?.slice(-4)}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-600 font-medium">
                Verified
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 bg-card/50 rounded-lg px-4">
              <div>
                <p className="font-medium text-foreground">Account Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-600 font-medium">
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
