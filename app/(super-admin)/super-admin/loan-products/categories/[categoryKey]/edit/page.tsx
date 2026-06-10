import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/category-form";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { fetchAdminCategoryByKey } from "@/lib/admin/categories/queries";
import { getCategoryLabel } from "@/lib/loans/category-config";
import { requireSuperAdmin } from "@/lib/auth/guards";
import type { LoanProductCategory } from "@/types/loans";

type PageProps = {
  params: Promise<{ categoryKey: string }>;
};

export default async function SuperAdminEditCategoryPage({ params }: PageProps) {
  await requireSuperAdmin();
  const { categoryKey } = await params;
  const category = await fetchAdminCategoryByKey(
    categoryKey as LoanProductCategory,
  );

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Edit ${category.label}`}
        description={`Change the icon, illustration, title, description, display order, and visibility for ${getCategoryLabel(category.category)}.`}
      />
      <CategoryForm
        category={category}
        basePath="/super-admin/loan-products"
      />
    </div>
  );
}
