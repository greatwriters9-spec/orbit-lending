import Link from "next/link";

import { CompanyLogo } from "@/components/company/company-logo";
import { PoweredByPathward } from "@/components/brand/powered-by-pathward";
import { formatBrandingAddress } from "@/lib/admin/branding/config";
import { LANDING_CONTAINER } from "@/lib/landing/content";
import type { LandingContent } from "@/lib/landing/get-landing-content";
import type { BrandingConfig } from "@/types/branding-config";

function buildFooterLinks(whyNavLabel: string) {
  return {
    Resources: [
      { label: "Mortgage Calculator", href: "#calculator" },
      { label: "Get Pre-Qualified", href: "/get-started" },
      { label: whyNavLabel, href: "#why-orbit" },
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
}

type LandingFooterProps = {
  branding: BrandingConfig;
  content: LandingContent;
};

export function LandingFooter({ branding, content }: LandingFooterProps) {
  const address = formatBrandingAddress(branding);
  const footerLinks = buildFooterLinks(content.whyNavLabel);

  return (
    <footer className="border-t border-brand-border bg-white">
      <div className={`${LANDING_CONTAINER} py-12`}>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <CompanyLogo className="shrink-0" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {content.footerBlurb}
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
            {content.socialLinks.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {content.socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-brand-navy transition-colors hover:text-brand-blue"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
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
          <p>{content.copyrightText}</p>
          <PoweredByPathward variant="default" />
        </div>
      </div>
    </footer>
  );
}
