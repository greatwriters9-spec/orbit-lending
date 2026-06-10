"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark } from "lucide-react";

import { getPortalNav } from "@/components/navigation/portal-nav";
import type { PortalKey } from "@/types/portal";
import { Badge } from "@/components/ui-kit/badge";
import { ScrollArea } from "@/components/ui-kit/scroll-area";
import { Separator } from "@/components/ui-kit/separator";
import { cn } from "@/lib/utils";

type SidebarProps = {
  className?: string;
  portal?: PortalKey;
  portalSubtitle?: string;
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

export function Sidebar({
  className,
  portal = "client",
  portalSubtitle,
}: SidebarProps) {
  const pathname = usePathname();
  const { sections, subtitle } = getPortalNav(portal);

  return (
    <aside
      className={cn(
        "flex h-full w-[272px] shrink-0 flex-col bg-brand-navy text-white",
        className,
      )}
    >
      <div className="border-b border-white/8 px-5 py-5">
        <div className="flex items-center gap-3.5 rounded-xl border border-white/8 bg-white/4 px-3.5 py-3">
          <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue shadow-[var(--shadow-sidebar-active)] ring-1 ring-white/10">
            <Landmark className="size-5 text-white" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold tracking-tight text-white">
              Orbit Lending
            </p>
            <p className="truncate text-[11px] font-medium tracking-wide text-white/45 uppercase">
              {portalSubtitle ?? subtitle}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-5">
        <nav className="space-y-7">
          {sections.map((section, sectionIndex) => (
            <div key={section.label ?? `section-${sectionIndex}`}>
              {section.label ? (
                <p className="mb-2.5 px-3 text-[10px] font-bold tracking-[0.1em] text-white/38 uppercase">
                  {section.label}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {section.items.map((item, itemIndex) => {
                  const isActive = isNavItemActive(pathname, item.href);
                  const Icon = item.icon;

                  return (
                    <li key={`${item.href}-${item.title}-${itemIndex}`}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl py-2.5 pr-3.5 pl-4 text-[13px] font-medium transition-all duration-200",
                          isActive
                            ? "bg-brand-blue text-white shadow-[var(--shadow-sidebar-active)]"
                            : "text-white/68 hover:bg-white/8 hover:text-white",
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "absolute top-1/2 left-0 h-7 w-[3px] -translate-y-1/2 rounded-r-full transition-all duration-200",
                            isActive
                              ? "bg-white opacity-100"
                              : "bg-white/0 group-hover:bg-white/30",
                          )}
                        />
                        <Icon
                          className={cn(
                            "size-[18px] shrink-0 transition-colors duration-200",
                            isActive
                              ? "text-white"
                              : "text-white/55 group-hover:text-white/90",
                          )}
                          strokeWidth={isActive ? 2 : 1.75}
                        />
                        <span className="flex-1 truncate">{item.title}</span>
                        {item.badge ? (
                          <Badge className="border-0 bg-white/14 px-2 py-0 text-[10px] font-semibold text-white hover:bg-white/14">
                            {item.badge}
                          </Badge>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {sectionIndex < sections.length - 1 ? (
                <Separator className="mt-5 bg-white/8" />
              ) : null}
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-white/8 p-4">
        <div className="rounded-xl border border-white/8 bg-white/4 px-4 py-3.5">
          <p className="text-xs font-semibold text-white/88">Need assistance?</p>
          <p className="mt-1 text-xs leading-relaxed text-white/42">
            Support available 24/7 for account and loan inquiries.
          </p>
        </div>
      </div>
    </aside>
  );
}
