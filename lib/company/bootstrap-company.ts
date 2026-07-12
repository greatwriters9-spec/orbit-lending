import type { CompanyRecord } from "@/types/company";

/** Client-side fallback from SSR data attributes when React context is unavailable. */
export function getBootstrapCompanyFromDom(): Pick<
  CompanyRecord,
  "companyName" | "slug" | "logo" | "primaryColor"
> | null {
  if (typeof document === "undefined") {
    return null;
  }

  const root = document.documentElement;
  const companyName = root.dataset.companyName;
  if (!companyName) {
    return null;
  }

  return {
    companyName,
    slug: root.dataset.company ?? "unknown",
    logo: root.dataset.companyLogo || null,
    primaryColor: root.dataset.companyPrimary ?? "#0f2d78",
  };
}
