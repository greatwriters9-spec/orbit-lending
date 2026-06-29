import type { MetadataRoute } from "next";

import { getAppOrigin } from "@/lib/email/config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getAppOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
