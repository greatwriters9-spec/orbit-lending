import type { JSX } from "react";

import type { CategoryIllustrationTransform } from "@/lib/loans/category-illustration-transform";
import { getIllustrationImageStyle } from "@/lib/loans/category-illustration-transform";
import { cn } from "@/lib/utils";
import type { LoanProductCategory } from "@/types/loans";

type CategoryIllustrationProps = {
  category: LoanProductCategory;
  illustrationUrl?: string | null;
  fit?: "cover" | "contain";
  illustrationTransform?: Partial<CategoryIllustrationTransform> | null;
  className?: string;
};

export function hasCustomIllustration(
  illustrationUrl?: string | null,
): illustrationUrl is string {
  return Boolean(illustrationUrl && isSafeImageUrl(illustrationUrl));
}

export function CategoryIllustration({
  category,
  illustrationUrl,
  fit = "contain",
  illustrationTransform,
  className,
}: CategoryIllustrationProps) {
  const safeUrl = hasCustomIllustration(illustrationUrl) ? illustrationUrl : null;

  if (safeUrl) {
    return (
      <div className={cn("h-full w-full overflow-hidden", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={safeUrl}
          alt=""
          draggable={false}
          className={cn(
            "h-full w-full will-change-transform",
            fit === "cover"
              ? "object-cover"
              : "object-contain object-center p-4",
          )}
          style={fit === "cover" ? getIllustrationImageStyle(illustrationTransform) : undefined}
        />
      </div>
    );
  }

  const Illustration = ILLUSTRATIONS[category];
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center p-4 sm:p-6",
        className,
      )}
    >
      <Illustration />
    </div>
  );
}

function PersonalIllustration() {
  return (
    <svg
      viewBox="0 0 320 180"
      className="h-full max-h-full w-full max-w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="personal-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8F4FD" />
          <stop offset="100%" stopColor="#D4E8F7" />
        </linearGradient>
      </defs>
      <rect x="20" y="20" width="280" height="140" rx="12" fill="url(#personal-bg)" />
      <rect x="48" y="52" width="180" height="88" rx="8" fill="#0A2540" opacity="0.08" />
      <rect x="58" y="72" width="120" height="14" rx="4" fill="#0066CC" opacity="0.3" />
      <rect x="58" y="96" width="90" height="10" rx="3" fill="#0A2540" opacity="0.15" />
      <circle cx="250" cy="58" r="22" fill="#0066CC" opacity="0.15" />
      <rect x="72" y="36" width="36" height="24" rx="4" fill="#0066CC" />
    </svg>
  );
}

function BusinessIllustration() {
  return (
    <svg
      viewBox="0 0 320 180"
      className="h-full max-h-full w-full max-w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="business-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EEF2FF" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>
      </defs>
      <rect x="110" y="30" width="100" height="120" rx="6" fill="url(#business-bg)" />
      <rect x="125" y="50" width="18" height="18" rx="2" fill="#0066CC" opacity="0.2" />
      <rect x="151" y="50" width="18" height="18" rx="2" fill="#0066CC" opacity="0.2" />
      <rect x="177" y="50" width="18" height="18" rx="2" fill="#0066CC" opacity="0.2" />
      <rect x="60" y="80" width="50" height="40" rx="6" fill="#0066CC" opacity="0.12" />
      <rect x="210" y="80" width="50" height="40" rx="6" fill="#0066CC" opacity="0.12" />
    </svg>
  );
}

function AssetIllustration() {
  return (
    <svg
      viewBox="0 0 320 180"
      className="h-full max-h-full w-full max-w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="asset-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ECFDF5" />
          <stop offset="100%" stopColor="#D1FAE5" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="150" rx="110" ry="10" fill="#0A2540" opacity="0.06" />
      <rect x="50" y="70" width="220" height="70" rx="10" fill="url(#asset-bg)" />
      <circle cx="80" cy="145" r="12" fill="#0A2540" opacity="0.2" />
      <circle cx="240" cy="145" r="12" fill="#0A2540" opacity="0.2" />
    </svg>
  );
}

function PropertyIllustration() {
  return (
    <svg
      viewBox="0 0 320 180"
      className="h-full max-h-full w-full max-w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="property-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="100%" stopColor="#FFEDD5" />
        </linearGradient>
      </defs>
      <polygon points="160,30 270,90 270,150 50,150 50,90" fill="url(#property-bg)" />
      <polygon points="160,30 270,90 50,90" fill="#0066CC" opacity="0.12" />
      <rect x="135" y="105" width="50" height="45" rx="3" fill="#0A2540" opacity="0.15" />
    </svg>
  );
}

function EducationIllustration() {
  return (
    <svg
      viewBox="0 0 320 180"
      className="h-full max-h-full w-full max-w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="education-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5F3FF" />
          <stop offset="100%" stopColor="#EDE9FE" />
        </linearGradient>
      </defs>
      <polygon points="160,35 280,80 160,125 40,80" fill="url(#education-bg)" />
      <rect x="155" y="80" width="10" height="55" fill="#0A2540" opacity="0.12" />
      <rect x="70" y="140" width="180" height="10" rx="3" fill="#0066CC" opacity="0.15" />
    </svg>
  );
}

const ILLUSTRATIONS: Record<LoanProductCategory, () => JSX.Element> = {
  personal: PersonalIllustration,
  business: BusinessIllustration,
  asset_financing: AssetIllustration,
  property: PropertyIllustration,
  education: EducationIllustration,
};

function isSafeImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
