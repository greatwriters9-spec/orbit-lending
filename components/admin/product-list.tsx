import Link from "next/link";
import { Plus } from "lucide-react";

import { ProductStatusActions } from "@/components/admin/product-form";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { getCategoryLabel, LOAN_PRODUCT_CATEGORIES } from "@/lib/loans/category-config";
import { formatCurrency } from "@/lib/loans/queries";
import {
  LOAN_PRODUCT_STATUS_LABELS,
  type AdminLoanProduct,
} from "@/types/admin";

type ProductListProps = {
  products: AdminLoanProduct[];
  basePath?: string;
};

export function ProductList({ products, basePath = "/admin/loan-products" }: ProductListProps) {
  const grouped = groupProductsByCategory(products);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          title="Loan Products"
          description="Manage the same products clients see on the Apply for Loan page. Edit rates, amounts, and availability here."
        />
        <Link
          href={`${basePath}/new`}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-navy px-4 text-sm font-semibold text-white hover:bg-brand-navy/90"
        >
          <Plus className="size-4" />
          Add Product
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {products.length} product{products.length === 1 ? "" : "s"} from
        the Orbit Lending catalog. Products marked{" "}
        <span className="font-semibold text-brand-navy">Catalog</span> are
        editable and will be saved to the database on first update.
      </p>

      <div className="space-y-8">
        {grouped.map(({ category, label, items }) => (
          <section key={category} className="space-y-4">
            <h2 className="heading-secondary text-lg">{label}</h2>
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
                  {items.map((product) => (
                    <tr key={product.id} className="hover:bg-brand-background/40">
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
                        {formatCurrency(product.minAmount)} –{" "}
                        {formatCurrency(product.maxAmount)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {product.minApr?.toFixed(2) ?? "—"}% –{" "}
                        {product.maxApr?.toFixed(2) ?? "—"}%
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {product.minTerm ?? "—"} – {product.maxTerm ?? "—"} mo
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={product.productStatus} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`${basePath}/${product.id}/edit`}
                            className="text-xs font-semibold text-brand-blue hover:text-brand-blue/80"
                          >
                            Edit product & rates
                          </Link>
                          <ProductStatusActions product={product} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function groupProductsByCategory(products: AdminLoanProduct[]) {
  const map = new Map<string, AdminLoanProduct[]>();

  for (const product of products) {
    const list = map.get(product.category) ?? [];
    list.push(product);
    map.set(product.category, list);
  }

  return LOAN_PRODUCT_CATEGORIES.filter((category) => map.has(category)).map(
    (category) => ({
      category,
      label: getCategoryLabel(category),
      items: map.get(category) ?? [],
    }),
  );
}

function StatusPill({ status }: { status: string }) {
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
