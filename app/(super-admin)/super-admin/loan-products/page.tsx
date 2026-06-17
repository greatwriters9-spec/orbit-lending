import { ProductDirectoryManager } from "@/components/admin/product-directory-manager";
import { fetchAdminProductDirectory } from "@/lib/admin/products/directory-data";
import { requireSuperAdmin } from "@/lib/auth/guards";

export const metadata = {
  title: "Product Directory | Orbit Mortgage",
};

export default async function SuperAdminLoanProductsPage() {
  await requireSuperAdmin();
  const directory = await fetchAdminProductDirectory();

  return (
    <ProductDirectoryManager
      categories={directory}
      basePath="/super-admin/loan-products"
    />
  );
}

