"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headphones } from "lucide-react";

import { OrbitLogo } from "@/components/brand/orbit-logo";
import { getPortalNav } from "@/components/navigation/portal-nav";
import type { PortalKey } from "@/types/portal";
import { Badge } from "@/components/ui-kit/badge";
import { ScrollArea } from "@/components/ui-kit/scroll-area";
import { Separator } from "@/components/ui-kit/separator";
import { cn } from "@/lib/utils";

type SidebarProps = {
  className?: string;
  portal?: PortalKey;
  homeHref?: string;
};

function isNavItemActive(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }

  if (href === "/finance/dashboard" && pathname === "/finance") {
    return true;
  }

  if (href !== "/dashboard" && pathname.startsWith(`${href}/`)) {
    return true;
  }

  return false;
}

const PORTAL_HOME: Record<PortalKey, string> = {
  client: "/dashboard",
  admin: "/admin",
  finance: "/finance/dashboard",
  super_admin: "/super-admin",
};

export function Sidebar({
  className,
  portal = "client",
  homeHref,
}: SidebarProps) {
  const pathname = usePathname();
  const { sections } = getPortalNav(portal);
  const logoHref = homeHref ?? PORTAL_HOME[portal];

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen w-[260px] shrink-0 flex-col bg-brand-navy text-white",
        className,
      )}
    >
      <div className="border-b border-white/10 px-5 py-5">
        <OrbitLogo
          href={logoHref}
          size="sm"
          variant="onDark"
          className="gap-2.5"
          aria-label="Orbit Mortgage home"
        />
      </div>

      <ScrollArea className="flex-1 px-3 py-5">
        <nav className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={section.label ?? `section-${sectionIndex}`}>
              {section.label ? (
                <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.1em] text-white/45 uppercase">
                  {section.label}
                </p>
              ) : null}
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const isActive = isNavItemActive(pathname, item.href);
                  const Icon = item.icon;

                  return (
                    <li key={`${item.href}-${item.title}-${itemIndex}`}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-200",
                          isActive
                            ? "bg-brand-blue text-white shadow-[var(--shadow-sidebar-active)]"
                            : "text-white/75 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-[18px] shrink-0",
                            isActive ? "text-white" : "text-white/60",
                          )}
                          strokeWidth={isActive ? 2 : 1.75}
                        />
                        <span className="flex-1 truncate">{item.title}</span>
                        {item.badge ? (
                          <Badge className="border-0 bg-brand-blue px-2 py-0 text-[10px] font-semibold text-white hover:bg-brand-blue">
                            {item.badge}
                          </Badge>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {sectionIndex < sections.length - 1 ? (
                <Separator className="mt-5 bg-white/10" />
              ) : null}
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
          <p className="text-sm font-semibold text-white">Need Help?</p>
          <p className="mt-1.5 text-xs leading-relaxed text-white/65">
            Our support team is available 24/7 for mortgage and account inquiries.
          </p>
          <Link
            href="/dashboard/support"
            className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90"
          >
            <Headphones className="size-4" />
            Contact Support
          </Link>
        </div>
      </div>
    </aside>
  );
}
