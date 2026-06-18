import type { ReactNode } from "react";

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { cn } from "@/lib/utils";
import type { DashboardUser } from "@/types/auth";

type DashboardShellProps = {
  children: ReactNode;
  user: DashboardUser;
  className?: string;
  unreadNotifications?: number;
  unreadMessages?: number;
};

export function DashboardShell({
  children,
  user,
  className,
  unreadNotifications = 0,
  unreadMessages = 0,
}: DashboardShellProps) {
  return (
    <div className="dashboard-ui flex min-h-screen bg-brand-background">
      <Sidebar portal="client" className="hidden lg:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavigation
          homeHref="/dashboard"
          user={user}
          unreadNotifications={unreadNotifications}
          unreadMessages={unreadMessages}
          notificationsHref="/dashboard/notifications"
        />

        <main
          className={cn(
            "mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-8 md:py-10",
            "pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-10",
            className,
          )}
        >
          {children}
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
}
