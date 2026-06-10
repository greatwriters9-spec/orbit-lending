import Link from "next/link";
import { ExternalLink, Pencil, Plus, Settings2 } from "lucide-react";

import { ProductStatusActions } from "@/components/admin/product-form";
import { CategoryIllustrationFrame } from "@/components/loans/category-illustration-frame";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { formatCurrency } from "@/lib/loans/queries";
import type { AdminDirectoryCategory } from "@/lib/admin/products/directory-data";
import {
  LOAN_PRODUCT_STATUS_LABELS,
  type AdminLoanProduct,
} from "@/types/admin";

type ProductDirectoryManagerProps = {
  categories: AdminDirectoryCategory[];
  basePath?: string;
};

export function ProductDirectoryManager({
  categories,
  basePath = "/admin/loan-products",
}: ProductDirectoryManagerProps) {
  const totalProducts = categories.reduce(
    (count, category) => count + category.products.length,
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <SectionHeader
          title="Product Directory"
          description="Manage the same categories and products clients see on the Apply for Loan page. Edit category icons, illustrations, display order, and individual product rates from here."
        />
        <div className="flex flex-wrap gap-3">
          <Link
            href="/loans"
            target="_blank"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-brand-border bg-white px-4 text-sm font-semibold text-brand-navy hover:bg-brand-background"
          >
            <ExternalLink className="size-4" />
            View Client Page
          </Link>
          <Link
            href={`${basePath}/new`}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-navy px-4 text-sm font-semibold text-white hover:bg-brand-navy/90"
          >
            <Plus className="size-4" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.04] px-4 py-3 text-sm text-brand-navy">
        Showing {categories.length} categor
        {categories.length === 1 ? "y" : "ies"} and {totalProducts} product
        {totalProducts === 1 ? "" : "s"}, arranged in the same order as the
        client directory. Use <strong>Edit Category</strong> to change icons,
        illustrations, titles, and visibility.
      </div>

      <div className="space-y-10">
        {categories.map((category) => (
          <CategoryDirectorySection
            key={category.category}
            category={category}
            basePath={basePath}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryDirectorySection({
  category,
  basePath,
}: {
  category: AdminDirectoryCategory;
  basePath: string;
}) {
  return (
    <section
      id={`admin-category-${category.category}`}
      className="scroll-mt-24 space-y-4"
    >
      <div className="card-surface overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <CategoryIllustrationFrame
            category={category.category}
            illustrationUrl={category.illustrationUrl}
            iconName={category.iconName}
            variant="banner"
            illustrationTransform={category.illustrationTransform}
            className="lg:min-h-full lg:rounded-none"
          />

          <div className="flex flex-col justify-between border-t border-brand-border p-6 lg:border-t-0 lg:border-l lg:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-brand-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                  Order {category.sortOrder}
                </span>
                <span className="rounded-md bg-brand-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                  Icon: {category.iconName}
                </span>
                <CategoryStatusPill active={category.active} />
              </div>
              <h2 className="heading-secondary mt-3 text-xl md:text-2xl">
                {category.label}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                {category.description}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {category.products.length} product
                {category.products.length === 1 ? "" : "s"} in this category
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`${basePath}/categories/${category.category}/edit`}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-blue px-4 text-sm font-semibold text-white hover:bg-brand-blue/90"
              >
                <Settings2 className="size-4" />
                Edit Category
              </Link>
              <Link
                href={`${basePath}/new?category=${category.category}`}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-brand-border bg-white px-4 text-sm font-semibold text-brand-navy hover:bg-brand-background"
              >
                <Plus className="size-4" />
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      {category.products.length > 0 ? (
        <div className="card-surface overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-brand-border bg-brand-background/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-semibold">Product</th>
                <th className="px-6 py-3 font-semibold">Amount Range</th>
                <th className="px-6 py-3 font-semibold">APR Range</th>
                <th className="px-6 py-3 font-semibold">Term</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {category.products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  basePath={basePath}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-brand-border bg-brand-background/40 px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No products in this category yet.
          </p>
          <Link
            href={`${basePath}/new?category=${category.category}`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
          >
            <Plus className="size-4" />
            Add the first product
          </Link>
        </div>
      )}
    </section>
  );
}

function ProductRow({
  product,
  basePath,
}: {
  product: AdminLoanProduct;
  basePath: string;
}) {
  return (
    <tr className="hover:bg-brand-background/40">
      <td className="px-6 py-4">
        <Link
          href={`${basePath}/${product.id}/edit`}
          className="font-semibold text-brand-navy hover:text-brand-blue"
        >
          {product.name}
        </Link>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
          {product.slug}
        </p>
        {product.catalogOnly ? (
          <span className="mt-1 inline-flex rounded-md bg-brand-blue/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-blue">
            Catalog
          </span>
        ) : null}
      </td>
      <td className="px-6 py-4 text-muted-foreground">
        {formatCurrency(product.minAmount)} – {formatCurrency(product.maxAmount)}
      </td>
      <td className="px-6 py-4 text-muted-foreground">
        {product.minApr?.toFixed(2) ?? "—"}% – {product.maxApr?.toFixed(2) ?? "—"}%
      </td>
      <td className="px-6 py-4 text-muted-foreground">
        {product.minTerm ?? "—"} – {product.maxTerm ?? "—"} mo
      </td>
      <td className="px-6 py-4">
        <ProductStatusPill status={product.productStatus} />
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-2">
          <Link
            href={`${basePath}/${product.id}/edit`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-brand-blue/80"
          >
            <Pencil className="size-3" />
            Edit product & rates
          </Link>
          <ProductStatusActions product={product} />
        </div>
      </td>
    </tr>
  );
}

function CategoryStatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
        active
          ? "bg-brand-success/10 text-brand-success"
          : "bg-brand-background text-muted-foreground"
      }`}
    >
      {active ? "Active" : "Hidden"}
    </span>
  );
}

function ProductStatusPill({ status }: { status: string }) {
  const tones: Record<string, string> = {
    active: "bg-brand-success/10 text-brand-success",
    draft: "bg-brand-background text-muted-foreground",
    hidden: "bg-brand-warning/10 text-brand-warning",
    archived: "bg-brand-danger/10 text-brand-danger",
  };

  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tones[status] ?? tones.draft}`}
    >
      {LOAN_PRODUCT_STATUS_LABELS[status as keyof typeof LOAN_PRODUCT_STATUS_LABELS] ??
        status}
    </span>
  );
}
