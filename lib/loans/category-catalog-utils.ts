import type { CategoryConfigEntry } from "@/lib/loans/category-config";

export function indexCategoryCatalog(
  categories: CategoryConfigEntry[],
): Map<CategoryConfigEntry["category"], CategoryConfigEntry> {
  return new Map(categories.map((entry) => [entry.category, entry]));
}

export function resolveCategoryDisplay(
  categories: CategoryConfigEntry[],
  category: CategoryConfigEntry["category"],
): CategoryConfigEntry | undefined {
  return indexCategoryCatalog(categories).get(category);
}
