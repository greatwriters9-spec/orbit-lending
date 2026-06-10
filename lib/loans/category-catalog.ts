import { fetchCategoryMeta } from "@/lib/admin/categories/queries";
import type { CategoryConfigEntry } from "@/lib/loans/category-config";

export {
  indexCategoryCatalog,
  resolveCategoryDisplay,
} from "@/lib/loans/category-catalog-utils";

/**
 * Single source of truth for category illustrations shown on the landing page,
 * client product directory (/loans), and admin previews.
 */
export async function fetchDisplayCategoryCatalog(options?: {
  includeInactive?: boolean;
}): Promise<CategoryConfigEntry[]> {
  return fetchCategoryMeta(options);
}
