import { ProductForm } from "@/components/admin/product-form";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { getCategoryLabel } from "@/lib/loans/category-config";
import { requireSuperAdmin } from "@/lib/auth/guards";
import type { LoanProductCategory } from "@/types/loans";

export const metadata = {
  title: "Create Product | Orbit Mortgage",
};

type PageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function SuperAdminCreateProductPage({
  searchParams,
}: PageProps) {
  await requireSuperAdmin();
  const { category } = await searchParams;
  const defaultCategory = category as LoanProductCategory | undefined;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Create Mortgage Product"
        description={
          defaultCategory
            ? `Add a new product to ${getCategoryLabel(defaultCategory)}.`
            : "Define a new mortgage product for the Orbit Mortgage catalog."
        }
      />
      <ProductForm
        mode="create"
        basePath="/super-admin/loan-products"
        defaultCategory={defaultCategory}
      />
    </div>
  );
}

