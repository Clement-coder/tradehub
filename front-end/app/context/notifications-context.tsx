'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useBTCPrice } from '@/lib/hooks/useBTCPrice';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'price' | 'trade' | 'portfolio' | 'security';
  color: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'unread'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  hasUnreadNotifications: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Welcome to TradeHub",
      message: "Your account is ready with $10,000 virtual funds",
      time: "Just now",
      unread: true,
      type: "portfolio",
      color: "primary"
    }
  ]);

  const { data: btcPrice } = useBTCPrice();
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);

  // Track BTC price changes and create notifications
  useEffect(() => {
    if (btcPrice && previousPrice && btcPrice !== previousPrice) {
      const change = btcPrice - previousPrice;
      const changePercent = ((change / previousPrice) * 100).toFixed(2);
      const isUp = change > 0;
      
      // Only notify for significant changes (>0.5%)
      if (Math.abs(parseFloat(changePercent)) > 0.5) {
        addNotification({
          title: "BTC Price Alert",
          message: `Bitcoin ${isUp ? 'rose' : 'fell'} to $${btcPrice.toLocaleString()} (${isUp ? '+' : ''}${changePercent}%)`,
          type: "price",
          color: isUp ? "chart-2" : "destructive"
        });
      }
    }
    
    if (btcPrice) {
      setPreviousPrice(btcPrice);
    }
  }, [btcPrice]);

  const addNotification = (notification: Omit<Notification, 'id' | 'time' | 'unread'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      time: "Just now",
      unread: true
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep only 20 notifications
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, unread: false }))
    );
  };

  const hasUnreadNotifications = notifications.some(notif => notif.unread);

  return (
    <NotificationsContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      hasUnreadNotifications
    }}>
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
