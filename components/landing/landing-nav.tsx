"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Financing Solutions", href: "#products" },
  { label: "Payment Calculator", href: "#calculator" },
  { label: "Why Choose Orbit", href: "#why-orbit" },
  { label: "How It Works", href: "#process" },
] as const;

const NAV = {
  height: "76px",
  maxWidth: "1400px",
  paddingX: "32px",
  menuFontSize: "15px",
  menuFontWeight: 600,
  menuGap: "38px",
  ctaHeight: "40px",
  ctaRadius: "10px",
  borderBottom: "1px solid #E5E7EB",
  background: "#FFFFFF",
  text: "#111827",
  primaryBlue: "#2563EB",
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
    color: NAV.text,
  } as const;

  const linkClass = cn(
    "relative inline-flex items-center tracking-[-0.01em] transition-colors duration-200",
    variant === "desktop" &&
      "py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[#2563EB] after:transition-transform after:duration-200 hover:text-[#2563EB] hover:after:scale-x-100",
    variant === "mobile" &&
      "rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-[#F9FAFB] hover:text-[#2563EB]",
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

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: NAV.background,
        borderBottom: NAV.borderBottom,
      }}
    >
      <div
        className="mx-auto flex items-center justify-between"
        style={{
          height: NAV.height,
          maxWidth: NAV.maxWidth,
          paddingLeft: NAV.paddingX,
          paddingRight: NAV.paddingX,
        }}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div
            className="flex size-9 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: "#0f172a" }}
          >
            <span className="text-sm font-bold">O</span>
          </div>
          <span className="heading-primary text-[17px] leading-none md:text-lg">
            Orbit Lending
          </span>
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center md:flex"
          style={{ gap: NAV.menuGap }}
        >
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-5 md:flex">
          <NavLink href="/login">Log In</NavLink>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-5 text-[15px] font-semibold tracking-[-0.01em] text-white transition-colors duration-200 hover:bg-[#1d4ed8]"
            style={{
              height: NAV.ctaHeight,
              borderRadius: NAV.ctaRadius,
              backgroundColor: NAV.primaryBlue,
            }}
          >
            Apply Now
          </Link>
        </div>

        <button
          type="button"
          className="flex items-center justify-center rounded-[10px] border md:hidden"
          style={{
            width: NAV.ctaHeight,
            height: NAV.ctaHeight,
            borderColor: "#E5E7EB",
            color: NAV.text,
          }}
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={cn("md:hidden", open ? "block" : "hidden")}
        style={{
          background: NAV.background,
          borderTop: NAV.borderBottom,
        }}
      >
        <nav
          className="mx-auto flex flex-col gap-0.5 py-4"
          style={{
            maxWidth: NAV.maxWidth,
            paddingLeft: NAV.paddingX,
            paddingRight: NAV.paddingX,
          }}
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              variant="mobile"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div
            className="mt-3 flex flex-col gap-2 pt-4"
            style={{ borderTop: NAV.borderBottom }}
          >
            <Link
              href="/login"
              className="inline-flex items-center justify-center border transition-colors duration-200 hover:border-[#2563EB]/30 hover:text-[#2563EB]"
              style={{
                height: NAV.ctaHeight,
                borderRadius: NAV.ctaRadius,
                borderColor: "#E5E7EB",
                fontSize: NAV.menuFontSize,
                fontWeight: NAV.menuFontWeight,
                color: NAV.text,
              }}
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#1d4ed8]"
              style={{
                height: NAV.ctaHeight,
                borderRadius: NAV.ctaRadius,
                backgroundColor: NAV.primaryBlue,
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
