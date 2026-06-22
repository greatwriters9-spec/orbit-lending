import type { ReactNode } from "react";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Sidebar } from "@/components/layout/sidebar";
import { StaffNavigationBar } from "@/components/layout/staff-navigation-bar";
import { cn } from "@/lib/utils";
import type { DashboardUser } from "@/types/auth";

type SuperAdminShellProps = {
  children: ReactNode;
  user: DashboardUser;
  className?: string;
  unreadNotifications?: number;
};

export function SuperAdminShell({
  children,
  user,
  className,
  unreadNotifications = 0,
}: SuperAdminShellProps) {
  return (
    <div className="flex min-h-screen bg-brand-background">
      <Sidebar portal="super_admin" className="hidden lg:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <StaffNavigationBar
          homeHref="/super-admin"
          notificationsHref="/super-admin/notifications"
          initialUnreadNotifications={unreadNotifications}
          mobileMenu={<MobileSidebar portal="super_admin" />}
          user={user}
        />

        <main
          className={cn(
            "mx-auto w-full max-w-[1440px] flex-1 px-5 py-8 md:px-8 md:py-10",
            className,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
