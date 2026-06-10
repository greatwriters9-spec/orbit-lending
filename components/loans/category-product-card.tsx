import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { CategoryIllustrationFrame } from "@/components/loans/category-illustration-frame";
import type { CategoryIllustrationTransform } from "@/lib/loans/category-illustration-transform";
import { cn } from "@/lib/utils";
import type { LoanProductCategory } from "@/types/loans";

export type CategoryProductCardProps = {
  category: LoanProductCategory;
  label: string;
  description: string;
  iconName: string;
  illustrationUrl?: string | null;
  illustrationTransform?: CategoryIllustrationTransform | null;
  productCount?: number;
  href?: string;
  ctaLabel?: string;
  titleClassName?: string;
  className?: string;
  onSelect?: () => void;
  footer?: ReactNode;
};

export function CategoryProductCard({
  category,
  label,
  description,
  iconName,
  illustrationUrl = null,
  illustrationTransform,
  productCount,
  href,
  ctaLabel = "Learn more",
  titleClassName,
  className,
  onSelect,
  footer,
}: CategoryProductCardProps) {
  const body = (
    <>
      <CategoryIllustrationFrame
        category={category}
        illustrationUrl={illustrationUrl}
        iconName={iconName}
        illustrationTransform={illustrationTransform}
        variant="card"
        productCount={productCount}
        className="rounded-none"
      />
      <div className="flex flex-1 flex-col p-6">
        <h3 className={cn("heading-tertiary text-xl", titleClassName)}>{label}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {footer ?? (
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue transition-all group-hover:gap-2">
            {ctaLabel}
            <ArrowRight className="size-4" />
          </span>
        )}
      </div>
    </>
  );

  const shellClassName = cn(
    "group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border bg-white text-left shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-blue/25 hover:shadow-[var(--shadow-card-hover)]",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={shellClassName}>
        {body}
      </Link>
    );
  }

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} className={shellClassName}>
        {body}
      </button>
    );
  }

  return <article className={shellClassName}>{body}</article>;
}

export function categoryGroupToProductCardProps(group: {
  category: LoanProductCategory;
  label: string;
  description: string;
  iconName: string;
  illustrationUrl: string | null;
  illustrationTransform: CategoryIllustrationTransform;
  products?: { length: number };
}): Omit<CategoryProductCardProps, "onSelect" | "href" | "footer"> {
  return {
    category: group.category,
    label: group.label,
    description: group.description,
    iconName: group.iconName,
    illustrationUrl: group.illustrationUrl,
    illustrationTransform: group.illustrationTransform,
    productCount: group.products?.length,
  };
}

export function categoryMetaToProductCardProps(meta: {
  category: LoanProductCategory;
  label: string;
  description: string;
  iconName: string;
  illustrationUrl: string | null;
  illustrationTransform: CategoryIllustrationTransform;
}): Omit<CategoryProductCardProps, "onSelect" | "href" | "footer" | "productCount"> {
  return {
    category: meta.category,
    label: meta.label,
    description: meta.description,
    iconName: meta.iconName,
    illustrationUrl: meta.illustrationUrl,
    illustrationTransform: meta.illustrationTransform,
  };
}
