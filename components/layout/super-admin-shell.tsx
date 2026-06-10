import type { ReactNode } from "react";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { SUPER_ADMIN_PORTAL } from "@/components/navigation/super-admin-nav-config";
import { cn } from "@/lib/utils";
import type { DashboardUser } from "@/types/auth";

type SuperAdminShellProps = {
  children: ReactNode;
  user: DashboardUser;
  className?: string;
};

export function SuperAdminShell({
  children,
  user,
  className,
}: SuperAdminShellProps) {
  return (
    <div className="flex min-h-screen bg-brand-background">
      <div className="hidden lg:flex">
        <Sidebar
          portal="super_admin"
          portalSubtitle={SUPER_ADMIN_PORTAL.subtitle}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavigation
          mobileMenu={
            <MobileSidebar
              portal="super_admin"
              portalSubtitle={SUPER_ADMIN_PORTAL.subtitle}
            />
          }
          user={user}
        />
        <main
          className={cn(
            "mx-auto w-full max-w-[1520px] flex-1 px-5 py-7 md:px-9 md:py-8",
            className,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
