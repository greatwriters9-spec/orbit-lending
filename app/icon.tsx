import { getCompanyContext } from "@/lib/company/server";
import { resolveCompanyFaviconResponse } from "@/lib/company/resolve-favicon";

export const size = {
  width: 48,
  height: 48,
};

export const contentType = "image/png";

export default async function Icon() {
  const { company } = await getCompanyContext();

  return resolveCompanyFaviconResponse({
    slug: company.slug,
    faviconPath: company.favicon,
    width: size.width,
    height: size.height,
  });
}
