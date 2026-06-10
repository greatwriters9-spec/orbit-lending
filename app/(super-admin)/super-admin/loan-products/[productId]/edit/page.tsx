import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { fetchAdminProductById } from "@/lib/admin/products/queries";
import { requireSuperAdmin } from "@/lib/auth/guards";

type PageProps = {
  params: Promise<{ productId: string }>;
};

export default async function SuperAdminEditProductPage({ params }: PageProps) {
  await requireSuperAdmin();
  const { productId } = await params;
  const product = await fetchAdminProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Edit ${product.name}`}
        description="Update product terms, rates, and availability."
      />
      <ProductForm
        mode="edit"
        product={product}
        basePath="/super-admin/loan-products"
      />
    </div>
  );
}
