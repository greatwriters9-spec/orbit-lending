"use client";

import { usePathname } from "next/navigation";

import { PoweredByPathward } from "@/components/brand/powered-by-pathward";
import { cn } from "@/lib/utils";

const HIDDEN_EXACT = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/get-started",
  "/create-account",
  "/legal",
  "/terms",
  "/privacy",
]);

const HIDDEN_PREFIXES = [
  "/dashboard",
  "/admin",
  "/finance",
  "/super-admin",
  "/profile/complete",
  "/legal",
];

function shouldHidePathwardBadge(pathname: string): boolean {
  if (HIDDEN_EXACT.has(pathname)) {
    return true;
  }

  return HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function SitePathwardBadge() {
  const pathname = usePathname() ?? "";
  const hasMobileBottomNav =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (shouldHidePathwardBadge(pathname)) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4",
        hasMobileBottomNav
          ? "bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] lg:bottom-3"
          : "bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))]",
      )}
    >
      <PoweredByPathward variant="pill" />
    </div>
  );
}
