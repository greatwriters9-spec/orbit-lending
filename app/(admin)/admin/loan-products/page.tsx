import { redirect } from "next/navigation";

import { ProductDirectoryManager } from "@/components/admin/product-directory-manager";
import { fetchAdminProductDirectory } from "@/lib/admin/products/directory-data";
import { hasAdminPermission } from "@/lib/admin/permissions";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata = {
  title: "Product Directory | Orbit Mortgage",
};

export default async function AdminLoanProductsPage() {
  const ctx = await requireAdmin();

  if (!hasAdminPermission(ctx.role, "products:manage")) {
    redirect("/admin");
  }

  const directory = await fetchAdminProductDirectory();

  return (
    <ProductDirectoryManager
      categories={directory}
      basePath="/admin/loan-products"
    />
  );
}

