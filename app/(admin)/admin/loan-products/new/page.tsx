import { ProductForm } from "@/components/admin/product-form";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { getCategoryLabel } from "@/lib/loans/category-config";
import { hasAdminPermission } from "@/lib/admin/permissions";
import { requireAdmin } from "@/lib/auth/guards";
import type { LoanProductCategory } from "@/types/loans";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Create Product | Orbit Mortgage",
};

type PageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function CreateProductPage({ searchParams }: PageProps) {
  const ctx = await requireAdmin();

  if (!hasAdminPermission(ctx.role, "products:manage")) {
    redirect("/admin");
  }

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
      <ProductForm mode="create" defaultCategory={defaultCategory} />
    </div>
  );
}

