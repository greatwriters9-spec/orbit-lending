import { getAppOrigin } from "@/lib/email/config";
import { SITE_NAME } from "@/lib/site/metadata";

export function OrganizationJsonLd() {
  const siteUrl = getAppOrigin();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
    logo: `${siteUrl}/icon`,
    image: `${siteUrl}/orbit-mortgage-logo.png`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
