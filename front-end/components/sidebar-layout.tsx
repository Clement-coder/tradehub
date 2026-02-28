'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { useNotifications } from '@/app/context/notifications-context';
import { useState } from 'react';
import { LogoutModal } from '@/components/logout-modal';
import { usePrivy } from '@privy-io/react-auth';

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
  const { logout: privyLogout } = usePrivy();
  const { notifications, markAllAsRead, hasUnreadNotifications } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    logout();
    try {
      await privyLogout();
    } catch (error) {
      console.error('Privy logout failed:', error);
    }
    router.push('/');
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
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
        <div className="h-16 flex items-center px-6 border-b border-border bg-gradient-to-r from-orange-500/10 via-blue-500/10 to-purple-500/10">
          <Link href="/" className="flex items-center gap-3 flex-1 group">
            <Image src="/tradeHub_logo.PNG" alt="TradeHub Logo" width={32} height={32} className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">TradeHub</span>
          </Link>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted/50"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              {isActive(item.href) && (
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-blue-500/10 to-purple-500/10 opacity-50 animate-pulse"></div>
                </div>
              )}
              <item.icon className="w-5 h-5 relative z-10" />
              <span className="font-medium relative z-10">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-border px-3 py-4 space-y-2">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              {isActive(item.href) && (
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-blue-500/10 to-purple-500/10 opacity-50 animate-pulse"></div>
                </div>
              )}
              <item.icon className="w-5 h-5 relative z-10" />
              <span className="font-medium relative z-10">{item.name}</span>
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
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6">
          {/* Logo and Name - Visible on mobile when sidebar is closed */}
          <Link href="/" className="flex md:hidden items-center gap-2 group">
            <Image src="/tradeHub_logo.PNG" alt="TradeHub Logo" width={32} height={32} className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-base sm:text-lg text-blue-600 dark:text-blue-400">TradeHub</span>
          </Link>
          
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowNotifications(true)}
              className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-5 h-5" />
              {hasUnreadNotifications && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted/50"
            >
              <Menu className="w-6 h-6" />
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
          <div className="fixed right-0 top-0 h-full w-80 sm:w-96 bg-background/95 backdrop-blur-xl border-l border-border z-50 transform transition-transform duration-300 flex flex-col">
            <div className="p-4 sm:p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Notifications</h2>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-2 rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const getNotificationRoute = () => {
                    switch (notification.type) {
                      case 'price': return '/trading';
                      case 'trade': return '/history';
                      case 'portfolio': return '/wallet';
                      case 'security': return '/settings';
                      default: return '/dashboard';
                    }
                  };

                  return (
                    <button
                      key={notification.id}
                      onClick={() => {
                        router.push(getNotificationRoute());
                        setShowNotifications(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                        notification.unread 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-card/50 border-border/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          notification.unread ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-foreground mb-0.5 truncate">{notification.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                          <span className="text-[10px] text-muted-foreground mt-1 inline-block">{notification.time}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            
            <div className="p-4 sm:p-6 border-t border-border">
              <button
                className="w-full px-4 py-2.5 rounded-lg font-semibold text-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={markAllAsRead}
                disabled={!hasUnreadNotifications}
              >
                {hasUnreadNotifications ? 'Mark All as Read' : 'All Read'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </div>
  );
}
