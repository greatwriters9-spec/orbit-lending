import Link from "next/link";

import { OrbitLogo } from "@/components/brand/orbit-logo";
import { PoweredByPathward } from "@/components/brand/powered-by-pathward";
import { formatBrandingAddress } from "@/lib/admin/branding/config";
import { LANDING_CONTAINER } from "@/lib/landing/content";
import type { BrandingConfig } from "@/types/branding-config";

const FOOTER_LINKS = {
  Resources: [
    { label: "Mortgage Calculator", href: "#calculator" },
    { label: "Get Pre-Qualified", href: "/get-started" },
    { label: "Why Orbit", href: "#why-orbit" },
    { label: "Application Process", href: "#process" },
  ],
  Legal: [
    { label: "Legal Center", href: "/legal" },
    { label: "Terms of Use", href: "/legal/terms-of-use" },
    { label: "Privacy Policy", href: "/legal/privacy-policy" },
    { label: "Cookie Policy", href: "/legal/cookie-policy" },
    { label: "E-Sign Consent", href: "/legal/electronic-communications-consent" },
    { label: "Application Disclosure", href: "/legal/mortgage-application-disclosure" },
    { label: "Fair Lending", href: "/legal/fair-lending-statement" },
    { label: "Contact", href: "/legal/contact-information" },
  ],
  Company: [
    { label: "Log In", href: "/login" },
    { label: "Create Account", href: "/register" },
  ],
};

type LandingFooterProps = {
  branding: BrandingConfig;
};

export function LandingFooter({ branding }: LandingFooterProps) {
  const address = formatBrandingAddress(branding);

  return (
    <footer className="border-t border-brand-border bg-white">
      <div className={`${LANDING_CONTAINER} py-12`}>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <OrbitLogo className="shrink-0" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Premium digital mortgage financing with transparent terms, real-time
              application tracking, and banking infrastructure powered by{" "}
              {branding.bankPartnerName}. Helping you achieve your homeownership goals.
            </p>
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p>{address.replace(/\n/g, ", ")}</p>
              <p>
                <a href={`tel:${branding.supportPhone.replace(/[^\d+]/g, "")}`} className="hover:text-brand-blue">
                  {branding.supportPhone}
                </a>
              </p>
              <p>
                <a href={`mailto:${branding.supportEmail}`} className="hover:text-brand-blue">
                  {branding.supportEmail}
                </a>
              </p>
              <p>{branding.officeHours}</p>
            </div>
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
          <p>© {new Date().getFullYear()} {branding.institutionName}. All rights reserved.</p>
          <PoweredByPathward variant="default" />
        </div>
      </div>
    </footer>
  );
}
