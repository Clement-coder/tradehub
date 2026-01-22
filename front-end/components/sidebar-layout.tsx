'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  History,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { useTradingContext } from '@/app/context/trading-context';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Trading', href: '/trading', icon: TrendingUp },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'History', href: '/history', icon: History },
];

const bottomNavItems = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useTradingContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:translate-x-0 flex flex-col`}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">TradeHub</span>
          </div>
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-border px-3 py-4 space-y-2">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-border p-4 space-y-3">
          {user && (
            <div className="px-2 space-y-1">
              <p className="text-xs text-muted-foreground">Account</p>
              <p className="text-sm font-semibold truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowNotifications(true)}
              className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Notifications Sidebar */}
      {showNotifications && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowNotifications(false)}
          />
          <div className="fixed right-0 top-0 h-full w-80 sm:w-96 bg-background/95 backdrop-blur-xl border-l border-border z-50 transform transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Notifications</h2>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-2 rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 animate-pulse"></div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Market Alert</h3>
                      <p className="text-sm text-muted-foreground">BTC reached $67,420 - up 2.4% today</p>
                      <span className="text-xs text-muted-foreground">2 minutes ago</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 animate-pulse"></div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Trade Executed</h3>
                      <p className="text-sm text-muted-foreground">Your BTC buy order for $1,000 was filled</p>
                      <span className="text-xs text-muted-foreground">5 minutes ago</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-r from-chart-2/10 to-chart-2/5 border border-chart-2/20">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-chart-2 rounded-full mt-2 animate-pulse"></div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Portfolio Update</h3>
                      <p className="text-sm text-muted-foreground">Your portfolio is up 3.2% today</p>
                      <span className="text-xs text-muted-foreground">1 hour ago</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-r from-chart-4/10 to-chart-4/5 border border-chart-4/20">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-chart-4 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Account Security</h3>
                      <p className="text-sm text-muted-foreground">Login from new device detected</p>
                      <span className="text-xs text-muted-foreground">3 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  className="w-full px-6 py-3 rounded-xl font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-200"
                  onClick={() => setShowNotifications(false)}
                >
                  Mark All as Read
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
