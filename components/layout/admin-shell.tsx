import type { ReactNode } from "react";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { ADMIN_PORTAL } from "@/components/navigation/admin-nav-config";
import { cn } from "@/lib/utils";
import type { DashboardUser } from "@/types/auth";

type AdminShellProps = {
  children: ReactNode;
  user: DashboardUser;
  className?: string;
};

export function AdminShell({ children, user, className }: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-brand-background">
      <div className="hidden lg:flex">
        <Sidebar portal="admin" portalSubtitle={ADMIN_PORTAL.subtitle} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavigation
          mobileMenu={
            <MobileSidebar
              portal="admin"
              portalSubtitle={ADMIN_PORTAL.subtitle}
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
