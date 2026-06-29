import type { Metadata } from "next";

import { getAppOrigin } from "@/lib/email/config";

export const SITE_NAME = "Orbit Mortgage";
export const SITE_TAGLINE = "Digital Mortgage Platform";
export const SITE_DESCRIPTION =
  "A secure digital mortgage origination platform for homebuyers and staff.";

export function getSiteUrl(): URL {
  return new URL(getAppOrigin());
}

export function getSiteMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const iconPath = "/icon";
  const appleIconPath = "/apple-icon";
  const logoPath = "/orbit-mortgage-logo.png";

  return {
    metadataBase: siteUrl,
    title: {
      default: `${SITE_NAME} | ${SITE_TAGLINE}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    icons: {
      icon: [
        { url: iconPath, type: "image/png", sizes: "48x48" },
        { url: "/orbit-icon.svg", type: "image/svg+xml" },
      ],
      shortcut: iconPath,
      apple: [{ url: appleIconPath, sizes: "180x180", type: "image/png" }],
    },
    manifest: "/site.webmanifest",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: SITE_NAME,
      title: `${SITE_NAME} | ${SITE_TAGLINE}`,
      description: SITE_DESCRIPTION,
      images: [
        {
          url: logoPath,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} | ${SITE_TAGLINE}`,
      description: SITE_DESCRIPTION,
      images: [logoPath],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}
