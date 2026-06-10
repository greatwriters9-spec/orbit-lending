import type { LoanCategoryGroup } from "@/types/loans";

import { ProductCategoryCard } from "./product-category-card";

type ProductDirectoryGridProps = {
  categories: LoanCategoryGroup[];
};

export function ProductDirectoryGrid({ categories }: ProductDirectoryGridProps) {
  const visibleCategories = categories.filter((group) => group.active);

  if (visibleCategories.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="heading-secondary text-xl md:text-2xl">
          Product Directory
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
          Explore financing categories designed for every stage of your financial
          journey. Select a category to view available loan products.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {visibleCategories.map((group) => (
          <ProductCategoryCard key={group.category} group={group} />
        ))}
      </div>
    </section>
  );
}
