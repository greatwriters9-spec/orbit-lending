import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { hasAdminPermission } from "@/lib/admin/permissions";
import { fetchAdminProductById } from "@/lib/admin/products/queries";
import { requireAdmin } from "@/lib/auth/guards";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ productId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { productId } = await params;
  const product = await fetchAdminProductById(productId);
  return {
    title: product
      ? `Edit ${product.name} | Orbit Mortgage`
      : "Product Not Found",
  };
}

export default async function EditProductPage({ params }: PageProps) {
  const ctx = await requireAdmin();

  if (!hasAdminPermission(ctx.role, "products:manage")) {
    redirect("/admin");
  }

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
      <ProductForm mode="edit" product={product} />
    </div>
  );
}
