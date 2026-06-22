"use client";

import { useState, type ReactNode } from "react";

import { TopNavigation } from "@/components/layout/top-navigation";
import { AdminNotificationRealtime } from "@/components/notifications/admin-notification-realtime";
import type { DashboardUser } from "@/types/auth";

type StaffNavigationBarProps = {
  user: DashboardUser;
  homeHref: string;
  notificationsHref: string;
  initialUnreadNotifications: number;
  mobileMenu?: ReactNode;
};

export function StaffNavigationBar({
  user,
  homeHref,
  notificationsHref,
  initialUnreadNotifications,
  mobileMenu,
}: StaffNavigationBarProps) {
  const [unreadNotifications, setUnreadNotifications] = useState(
    initialUnreadNotifications,
  );

  return (
    <>
      <AdminNotificationRealtime
        initialCount={initialUnreadNotifications}
        onCountChange={setUnreadNotifications}
      />
      <TopNavigation
        homeHref={homeHref}
        mobileMenu={mobileMenu}
        user={user}
        unreadNotifications={unreadNotifications}
        notificationsHref={notificationsHref}
      />
    </>
  );
}
