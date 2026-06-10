"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import { CategoryIllustrationFrame } from "@/components/loans/category-illustration-frame";
import type { CategoryConfigEntry } from "@/lib/loans/category-config";
import { indexCategoryCatalog } from "@/lib/loans/category-catalog-utils";
import {
  LANDING_PRODUCTS,
  LANDING_PRODUCT_TABS,
  type LandingProductTabId,
} from "@/lib/landing/content";
import { cn } from "@/lib/utils";
import type { LoanProductCategory } from "@/types/loans";

import { SectionHeading, SectionShell } from "./shared/section-shell";

type ProductShowcaseProps = {
  categories: CategoryConfigEntry[];
};

export function ProductShowcase({ categories }: ProductShowcaseProps) {
  const [activeTab, setActiveTab] = useState<LandingProductTabId>("all");
  const metaByCategory = useMemo(
    () => indexCategoryCatalog(categories),
    [categories],
  );

  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return LANDING_PRODUCTS;
    return LANDING_PRODUCTS.filter((product) => product.filterCategory === activeTab);
  }, [activeTab]);

  return (
    <SectionShell id="products" tone="white">
      <SectionHeading
        eyebrow="Financing Solutions"
        title="Products Designed for Every Financial Goal"
        subtitle="Explore Orbit lending categories with competitive starting rates, transparent terms, and a unified digital application experience."
      />

      <div className="mt-10 flex flex-wrap justify-center gap-2 md:gap-3">
        {LANDING_PRODUCT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "border-brand-blue bg-brand-blue text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)]"
                : "border-[#E5E7EB] bg-white text-[#374151] hover:border-brand-blue/30 hover:text-brand-blue",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product) => {
          const meta = product.filterCategory
            ? metaByCategory.get(product.filterCategory)
            : undefined;
          const category = (product.filterCategory ?? "personal") as LoanProductCategory;

          return (
            <ProductCard
              key={product.id}
              product={product}
              category={category}
              meta={meta}
            />
          );
        })}
      </div>
    </SectionShell>
  );
}

function ProductCard({
  product,
  category,
  meta,
}: {
  product: (typeof LANDING_PRODUCTS)[number];
  category: LoanProductCategory;
  meta?: CategoryConfigEntry;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_16px_48px_rgba(37,99,235,0.12)]">
      <div className="overflow-hidden transition-transform duration-500 group-hover:scale-[1.03]">
        <CategoryIllustrationFrame
          category={category}
          illustrationUrl={meta?.illustrationUrl}
          iconName={meta?.iconName ?? "Wallet"}
          illustrationTransform={meta?.illustrationTransform}
          variant="card"
          className="rounded-none"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="heading-tertiary text-xl">{product.title}</h3>
          <span className="shrink-0 rounded-full bg-brand-success/10 px-2.5 py-1 text-[11px] font-semibold text-brand-success">
            From {product.startingApr} APR
          </span>
        </div>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <Link
          href={product.href}
          className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-brand-blue text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
        >
          Apply Now
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
