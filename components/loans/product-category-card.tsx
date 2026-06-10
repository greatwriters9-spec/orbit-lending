"use client";

import {
  CategoryProductCard,
  categoryGroupToProductCardProps,
} from "@/components/loans/category-product-card";
import type { LoanCategoryGroup } from "@/types/loans";

type ProductCategoryCardProps = {
  group: LoanCategoryGroup;
  className?: string;
  onSelect?: (category: string) => void;
};

export function ProductCategoryCard({
  group,
  className,
  onSelect,
}: ProductCategoryCardProps) {
  function handleSelect() {
    if (onSelect) {
      onSelect(group.category);
      return;
    }

    const target = document.getElementById(`category-${group.category}`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <CategoryProductCard
      {...categoryGroupToProductCardProps(group)}
      ctaLabel="Browse products"
      titleClassName="text-lg"
      className={className}
      onSelect={handleSelect}
    />
  );
}
