import Link from "next/link";

import { getCategoryIcon } from "@/lib/loans/category-icons";
import type { AdminCategoryMeta } from "@/lib/admin/categories/queries";

export function CategoryList({
  categories,
  basePath = "/admin/loan-products",
}: {
  categories: AdminCategoryMeta[];
  basePath?: string;
}) {
  return (
    <div className="card-surface overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-brand-border bg-brand-background/60 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-semibold">Category</th>
            <th className="px-6 py-3 font-semibold">Icon</th>
            <th className="px-6 py-3 font-semibold">Order</th>
            <th className="px-6 py-3 font-semibold">Status</th>
            <th className="px-6 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.iconName);
            return (
              <tr key={category.category} className="hover:bg-brand-background/40">
                <td className="px-6 py-4">
                  <p className="font-semibold text-brand-navy">{category.label}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {category.category}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                    <Icon className="size-4" />
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {category.sortOrder}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-md px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                      category.active
                        ? "bg-brand-success/10 text-brand-success"
                        : "bg-brand-background text-muted-foreground"
                    }`}
                  >
                    {category.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`${basePath}/categories/${category.category}/edit`}
                    className="text-xs font-semibold text-brand-blue hover:text-brand-blue/80"
                  >
                    Edit category
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
