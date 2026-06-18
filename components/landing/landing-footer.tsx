import Link from "next/link";

import { OrbitLogo } from "@/components/brand/orbit-logo";
import { PoweredByPathward } from "@/components/brand/powered-by-pathward";
import { LANDING_CONTAINER, PATHWARD_BANK } from "@/lib/landing/content";

const FOOTER_LINKS = {
  Resources: [
    { label: "Mortgage Calculator", href: "#calculator" },
    { label: "Get Pre-Qualified", href: "/get-started" },
    { label: "Why Orbit", href: "#why-orbit" },
    { label: "Application Process", href: "#process" },
  ],
  Company: [
    { label: "Log In", href: "/login" },
    { label: "Create Account", href: "/register" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-brand-border bg-white">
      <div className={`${LANDING_CONTAINER} py-12`}>
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <OrbitLogo className="shrink-0" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Premium digital mortgage financing with transparent terms, real-time
              application tracking, and banking infrastructure powered by{" "}
              {PATHWARD_BANK.name}. Helping you achieve your homeownership goals.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-brand-blue"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-brand-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Orbit Mortgage. All rights reserved.</p>
          <PoweredByPathward variant="default" />
        </div>
      </div>
    </footer>
  );
}

