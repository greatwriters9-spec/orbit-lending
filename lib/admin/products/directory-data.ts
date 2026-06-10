import { fetchAdminCategories } from "@/lib/admin/categories/queries";
import { fetchAdminProducts } from "@/lib/admin/products/queries";
import type { AdminCategoryMeta } from "@/lib/admin/categories/queries";
import type { AdminLoanProduct } from "@/types/admin";
import type { LoanProductCategory } from "@/types/loans";

export type AdminDirectoryCategory = AdminCategoryMeta & {
  products: AdminLoanProduct[];
};

export async function fetchAdminProductDirectory(): Promise<AdminDirectoryCategory[]> {
  const [categories, products] = await Promise.all([
    fetchAdminCategories(),
    fetchAdminProducts(),
  ]);

  const productsByCategory = new Map<LoanProductCategory, AdminLoanProduct[]>();

  for (const product of products) {
    const category = product.category as LoanProductCategory;
    const list = productsByCategory.get(category) ?? [];
    list.push(product);
    productsByCategory.set(category, list);
  }

  return categories
    .map((category) => ({
      ...category,
      products: productsByCategory.get(category.category) ?? [],
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
