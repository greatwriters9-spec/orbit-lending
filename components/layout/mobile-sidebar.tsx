"use client";

import { Menu } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui-kit/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui-kit/sheet";
import type { PortalKey } from "@/types/portal";

type MobileSidebarProps = {
  portal?: PortalKey;
  portalSubtitle?: string;
};

export function MobileSidebar({
  portal = "client",
  portalSubtitle,
}: MobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[272px] border-0 p-0">
        <Sidebar
          className="w-full"
          portal={portal}
          portalSubtitle={portalSubtitle}
        />
      </SheetContent>
    </Sheet>
  );
}
