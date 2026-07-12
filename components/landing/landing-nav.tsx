"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, Phone, X } from "lucide-react";

import { CompanyLogo } from "@/components/company/company-logo";
import { useLandingCompany } from "@/components/landing/landing-company-context";
import { isOakstoneCompany } from "@/lib/design-system/oakstone/theme";
import { cn } from "@/lib/utils";

const NAV = {
  height: "88px",
  oakstoneHeight: "96px",
  maxWidth: "1400px",
  paddingX: "32px",
  oakstonePaddingX: "48px",
  menuFontSize: "16px",
  menuFontWeight: 500,
  menuGap: "38px",
  ctaHeight: "44px",
  ctaRadius: "10px",
  oakstoneCtaRadius: "12px",
} as const;

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "desktop" | "mobile";
};

function NavLink({
  href,
  children,
  className,
  onClick,
  variant = "desktop",
}: NavLinkProps) {
  const isAnchor = href.startsWith("#");

  const styles = {
    fontSize: NAV.menuFontSize,
    fontWeight: NAV.menuFontWeight,
  } as const;

  const linkClass = cn(
    "relative inline-flex items-center tracking-[-0.01em] text-brand-navy transition-colors duration-200",
    variant === "desktop" &&
      "py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-brand-blue after:transition-transform after:duration-200 hover:text-brand-blue hover:after:scale-x-100",
    variant === "mobile" &&
      "rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-brand-background hover:text-brand-blue",
    className,
  );

  if (isAnchor) {
    return (
      <a href={href} className={linkClass} style={styles} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClass} style={styles} onClick={onClick}>
      {children}
    </Link>
  );
}

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const { company, content } = useLandingCompany();
  const isOakstone = isOakstoneCompany(company.slug);

  const navLinks = [
    { label: "Mortgage Calculator", href: "#calculator" },
    { label: content.whyNavLabel, href: "#why-orbit" },
    { label: "How It Works", href: "#process" },
  ] as const;

  return (
    <header
      className={cn(
        "landing-nav sticky top-0 z-50 border-b border-brand-border bg-white",
        isOakstone && "landing-nav-oakstone",
      )}
    >
      <div
        className="mx-auto flex items-center justify-between"
        style={{
          height: isOakstone ? NAV.oakstoneHeight : NAV.height,
          maxWidth: NAV.maxWidth,
          paddingLeft: isOakstone ? NAV.oakstonePaddingX : NAV.paddingX,
          paddingRight: isOakstone ? NAV.oakstonePaddingX : NAV.paddingX,
        }}
      >
        <CompanyLogo
          aria-label={`${company.companyName} home`}
          size={company.logo ? "xl" : "md"}
          showWordmark
          className={company.logo ? "gap-3.5" : undefined}
        />

        <nav
          className="hidden flex-1 items-center justify-center md:flex"
          style={{ gap: NAV.menuGap }}
        >
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-5 md:flex">
          {content.phoneNumber ? (
            <a
              href={`tel:${content.phoneNumber.replace(/[^\d+]/g, "")}`}
              className={cn(
                "inline-flex items-center gap-2 text-[15px] font-medium text-brand-navy transition-colors hover:text-brand-blue",
                isOakstone && "gap-2.5",
              )}
            >
              {isOakstone ? <Phone className="size-4 shrink-0" strokeWidth={1.75} /> : null}
              {content.phoneNumber}
            </a>
          ) : null}
          <NavLink href="/login">Sign In</NavLink>
          <Link
            href="/get-started"
            className="landing-nav-cta inline-flex items-center justify-center bg-brand-blue px-5 text-[15px] font-semibold tracking-[-0.01em] text-white transition-colors duration-200 hover:bg-brand-blue-dark"
            style={{
              height: NAV.ctaHeight,
              borderRadius: isOakstone ? NAV.oakstoneCtaRadius : NAV.ctaRadius,
            }}
          >
            Apply Now
          </Link>
        </div>

        <button
          type="button"
          className="flex items-center justify-center rounded-[10px] border border-brand-border text-brand-navy md:hidden"
          style={{
            width: NAV.ctaHeight,
            height: NAV.ctaHeight,
          }}
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div className={cn("border-t border-brand-border bg-white md:hidden", open ? "block" : "hidden")}>
        <nav
          className="mx-auto flex flex-col gap-0.5 py-4"
          style={{
            maxWidth: NAV.maxWidth,
            paddingLeft: isOakstone ? NAV.oakstonePaddingX : NAV.paddingX,
            paddingRight: isOakstone ? NAV.oakstonePaddingX : NAV.paddingX,
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              variant="mobile"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-brand-border pt-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center border border-brand-border text-brand-navy transition-colors duration-200 hover:border-brand-blue/30 hover:text-brand-blue"
              style={{
                height: NAV.ctaHeight,
                borderRadius: isOakstone ? NAV.oakstoneCtaRadius : NAV.ctaRadius,
                fontSize: NAV.menuFontSize,
                fontWeight: NAV.menuFontWeight,
              }}
            >
              Sign In
            </Link>
            <Link
              href="/get-started"
              className="landing-nav-cta inline-flex items-center justify-center gap-2 bg-brand-blue text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-brand-blue-dark"
              style={{
                height: NAV.ctaHeight,
                borderRadius: isOakstone ? NAV.oakstoneCtaRadius : NAV.ctaRadius,
              }}
            >
              Apply Now
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
