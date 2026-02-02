import React from "react"
import { SidebarLayout } from '@/components/sidebar-layout';
import { NotificationsProvider } from '@/app/context/notifications-context';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationsProvider>
      <SidebarLayout>{children}</SidebarLayout>
    </NotificationsProvider>
  );
}
