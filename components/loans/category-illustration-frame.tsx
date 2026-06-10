import type { ReactNode } from "react";

import type { CategoryIllustrationTransform } from "@/lib/loans/category-illustration-transform";
import { getCategoryIcon } from "@/lib/loans/category-icons";
import { cn } from "@/lib/utils";
import type { LoanProductCategory } from "@/types/loans";

import { CategoryIllustration, hasCustomIllustration } from "./category-illustrations";

/** Recommended upload dimensions for category hero artwork */
export const CATEGORY_ILLUSTRATION_SPECS = {
  aspectRatio: "16:9",
  recommendedWidth: 1600,
  recommendedHeight: 900,
  label: "1600 × 900 px (16:9)",
} as const;

type CategoryIllustrationFrameProps = {
  category: LoanProductCategory;
  illustrationUrl?: string | null;
  iconName: string;
  variant?: "card" | "banner";
  productCount?: number;
  illustrationTransform?: Partial<CategoryIllustrationTransform> | null;
  className?: string;
  overlay?: ReactNode;
};

const frameStyles = {
  card: "aspect-[16/9] w-full",
  banner:
    "aspect-[16/9] w-full min-h-[200px] sm:min-h-[240px] lg:aspect-auto lg:h-full lg:min-h-[280px]",
} as const;

export function CategoryIllustrationFrame({
  category,
  illustrationUrl,
  iconName,
  variant = "card",
  productCount,
  illustrationTransform,
  className,
  overlay,
}: CategoryIllustrationFrameProps) {
  const customArt = hasCustomIllustration(illustrationUrl);
  const Icon = getCategoryIcon(iconName);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[#eef4fb]",
        frameStyles[variant],
        className,
      )}
    >
      {!customArt ? (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-background via-white to-brand-blue/[0.05]" />
      ) : null}
      {!customArt ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(0,102,204,0.1),transparent_55%)]" />
      ) : null}

      <CategoryIllustration
        category={category}
        illustrationUrl={illustrationUrl}
        fit={customArt ? "cover" : "contain"}
        illustrationTransform={illustrationTransform}
        className="absolute inset-0 z-[1]"
      />

      {!customArt ? (
        <div className="absolute left-4 top-4 z-[2] flex size-11 items-center justify-center rounded-xl bg-white/90 text-brand-blue shadow-sm ring-1 ring-brand-border/60 backdrop-blur-sm">
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
      ) : null}

      {productCount !== undefined && productCount > 0 ? (
        <span className="absolute right-4 top-4 z-[2] rounded-full bg-brand-navy/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {productCount} product{productCount === 1 ? "" : "s"}
        </span>
      ) : null}

      {overlay ? <div className="absolute inset-0 z-[2]">{overlay}</div> : null}
    </div>
  );
}
