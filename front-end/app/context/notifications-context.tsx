'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useBTCPrice } from '@/lib/hooks/useBTCPrice';
import { useTradingContext } from '@/app/context/trading-context';
import {
  createNotification as createNotificationRow,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/lib/supabase-service';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'price' | 'trade' | 'portfolio' | 'security';
  color: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, 'id' | 'time' | 'unread'>,
  ) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  hasUnreadNotifications: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

function relativeTime(dateString: string): string {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useTradingContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: btcPrice } = useBTCPrice();
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);

  const refreshNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const rows = await getNotifications(user.id, user.privyUserId);

    setNotifications(
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        time: relativeTime(row.created_at),
        unread: row.unread,
        type: row.type,
        color: row.color,
      })),
    );
  };

  useEffect(() => {
    void refreshNotifications();
  }, [user?.id]);

  useEffect(() => {
    if (!btcPrice) return;

    if (previousPrice !== null) {
      const change = btcPrice - previousPrice;
      const changePercent = (change / previousPrice) * 100;

      if (Math.abs(changePercent) > 0.5 && user) {
        const isUp = change > 0;

        void createNotificationRow({
          userId: user.id,
          privyUserId: user.privyUserId,
          title: 'BTC Price Alert',
          message: `Bitcoin ${isUp ? 'rose' : 'fell'} to $${btcPrice.toLocaleString()} (${isUp ? '+' : ''}${changePercent.toFixed(2)}%)`,
          type: 'price',
          color: isUp ? 'chart-2' : 'destructive',
        }).then(() => refreshNotifications());
      }
    }

    setPreviousPrice(btcPrice);
  }, [btcPrice, previousPrice, user?.id]);

  const addNotification = async (
    notification: Omit<Notification, 'id' | 'time' | 'unread'>,
  ) => {
    if (!user) return;

    await createNotificationRow({
      userId: user.id,
      privyUserId: user.privyUserId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      color: notification.color,
    });

    await refreshNotifications();
  };

  const markAsRead = async (id: string) => {
    if (!user) return;

    await markNotificationAsRead(id, user.id, user.privyUserId);
    await refreshNotifications();
  };

  const markAllAsRead = async () => {
    if (!user) return;

    await markAllNotificationsAsRead(user.id, user.privyUserId);
    await refreshNotifications();
  };

  const hasUnreadNotifications = notifications.some((notification) => notification.unread);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        hasUnreadNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
