"use client";

import Image from "next/image";
import Link from "next/link";

import { OrbitLogoMark } from "@/components/brand/orbit-logo";
import { useOptionalLandingCompany } from "@/components/landing/landing-company-context";
import { getBootstrapCompanyFromDom } from "@/lib/company/bootstrap-company";
import { useOptionalCompany } from "@/components/providers/company-provider";
import { cn } from "@/lib/utils";
import type { CompanyRecord } from "@/types/company";

type CompanyLogoProps = {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  variant?: "default" | "onDark";
  href?: string | null;
  showWordmark?: boolean;
  className?: string;
  "aria-label"?: string;
};

const WORDMARK_SIZES = {
  sm: "text-base",
  md: "text-[22px]",
  lg: "text-2xl",
  xl: "text-xl font-bold leading-tight sm:text-[22px] md:text-2xl",
  hero: "text-3xl",
} as const;

const IMAGE_SIZES = {
  sm: { width: 32, height: 32, className: "max-h-8 w-auto shrink-0 object-contain" },
  md: { width: 44, height: 44, className: "max-h-11 w-auto shrink-0 object-contain" },
  lg: { width: 56, height: 56, className: "max-h-14 w-auto shrink-0 object-contain" },
  xl: { width: 64, height: 64, className: "max-h-16 w-auto shrink-0 object-contain" },
  hero: {
    width: 192,
    height: 192,
    className: "h-auto w-32 shrink-0 object-contain md:w-40 lg:w-48",
  },
} as const;

function useCompanyRecord(): CompanyRecord | null {
  const companyContext = useOptionalCompany();
  const landingContext = useOptionalLandingCompany();

  if (companyContext) {
    return companyContext.company;
  }

  if (landingContext) {
    return landingContext.company;
  }

  const bootstrap = getBootstrapCompanyFromDom();
  if (bootstrap) {
    return bootstrap as CompanyRecord;
  }

  return null;
}


export function CompanyLogo(props: CompanyLogoProps) {
  const company = useCompanyRecord();

  if (!company) {
    return (
      <span
        className={cn("inline-flex h-11 w-32 animate-pulse rounded bg-muted", props.className)}
        aria-hidden
      />
    );
  }

  const {
    size = "md",
    variant = "default",
    href = "/",
    showWordmark = true,
    className,
    "aria-label": ariaLabel,
  } = props;

  const imageSize = IMAGE_SIZES[size];

  const mark = company.logo ? (
    <Image
      src={company.logo}
      alt={`${company.companyName} logo`}
      width={imageSize.width}
      height={imageSize.height}
      className={imageSize.className}
      priority={size === "hero" || size === "xl"}
    />
  ) : company.slug === "orbit" ? (
    <OrbitLogoMark size={size === "xl" || size === "hero" ? "lg" : size} />
  ) : (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        size === "sm" ? "size-8 text-xs" : size === "lg" || size === "xl" || size === "hero" ? "size-14 text-lg" : "size-11 text-sm",
      )}
      style={{ backgroundColor: company.primaryColor }}
    >
      {company.companyName.charAt(0)}
    </span>
  );

  const content = (
    <>
      {mark}
      {showWordmark ? (
        <span
          className={cn(
            "font-bold tracking-tight",
            WORDMARK_SIZES[size],
            variant === "onDark" ? "text-white" : "text-[#1f2937]",
          )}
        >
          {company.companyName}
        </span>
      ) : null}
    </>
  );

  const rootClass = cn("inline-flex items-center gap-3", className);

  if (href) {
    return (
      <Link href={href} className={rootClass} aria-label={ariaLabel ?? company.companyName}>
        {content}
      </Link>
    );
  }

  return (
    <span className={rootClass} aria-label={ariaLabel ?? company.companyName}>
      {content}
    </span>
  );
}
