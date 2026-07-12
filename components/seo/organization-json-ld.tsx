import { getAppOrigin } from "@/lib/email/config";

type OrganizationJsonLdProps = {
  companyName: string;
  logoUrl?: string | null;
};

export function OrganizationJsonLd({
  companyName,
  logoUrl,
}: OrganizationJsonLdProps) {
  const siteUrl = getAppOrigin();
  const logo = logoUrl ?? `${siteUrl}/icon`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: companyName,
    url: siteUrl,
    logo,
    image: logo,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
