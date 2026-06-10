import { getCategoryIcon } from "@/lib/loans/category-icons";
import { cn } from "@/lib/utils";
import type { LoanCategoryGroup } from "@/types/loans";

import { CategoryIllustrationFrame } from "./category-illustration-frame";
import { hasCustomIllustration } from "./category-illustrations";
import { LoanProductCard } from "./loan-product-card";

type LoanCategorySectionProps = {
  group: LoanCategoryGroup;
  className?: string;
};

export function LoanCategorySection({
  group,
  className,
}: LoanCategorySectionProps) {
  const Icon = getCategoryIcon(group.iconName);
  const customArt = hasCustomIllustration(group.illustrationUrl);

  if (group.products.length === 0) {
    return null;
  }

  return (
    <section
      id={`category-${group.category}`}
      className={cn("scroll-mt-28 space-y-6", className)}
    >
      <div className="card-surface overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <CategoryIllustrationFrame
            category={group.category}
            illustrationUrl={group.illustrationUrl}
            iconName={group.iconName}
            variant="banner"
            illustrationTransform={group.illustrationTransform}
            className="lg:min-h-full lg:rounded-none"
          />

          <div className="flex flex-col justify-center border-t border-brand-border p-6 lg:border-t-0 lg:border-l lg:p-8">
            <div className="flex items-start gap-4">
              {!customArt ? (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/15">
                  <Icon className="size-5" strokeWidth={1.75} />
                </div>
              ) : null}
              <div>
                <h2 className="heading-secondary text-xl md:text-2xl">
                  {group.label}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {group.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {group.products.map((product) => (
          <LoanProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
