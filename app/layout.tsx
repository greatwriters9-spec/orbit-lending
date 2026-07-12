import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { CompanyThemeStyles } from "@/components/company/company-theme-styles";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { AppProviders } from "@/components/providers/app-providers";
import { CompanyProvider } from "@/components/providers/company-provider";
import { SitePathwardBadge } from "@/components/brand/site-pathward-badge";
import { getCompanyContext } from "@/lib/company/server";
import { getSiteMetadata } from "@/lib/site/metadata";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { company, branding } = await getCompanyContext();
  const base = getSiteMetadata();

  return {
    ...base,
    title: {
      default: `${company.companyName} | ${branding.tagline}`,
      template: `%s | ${company.companyName}`,
    },
    description: branding.tagline,
    applicationName: company.companyName,
    icons: company.favicon
      ? {
          icon: [{ url: company.favicon, type: "image/png" }],
          shortcut: company.favicon,
        }
      : base.icons,
    openGraph: {
      ...base.openGraph,
      siteName: company.companyName,
      title: `${company.companyName} | ${branding.tagline}`,
      description: branding.tagline,
      ...(company.logo
        ? {
            images: [
              {
                url: company.logo,
                width: 1200,
                height: 630,
                alt: `${company.companyName} logo`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      ...base.twitter,
      title: `${company.companyName} | ${branding.tagline}`,
      description: branding.tagline,
      ...(company.logo ? { images: [company.logo] } : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const companyContext = await getCompanyContext();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      data-company={companyContext.company.slug}
      data-company-name={companyContext.company.companyName}
      data-company-logo={companyContext.company.logo ?? ""}
      data-company-primary={companyContext.company.primaryColor}
    >
      <body
        className={`${inter.className} company-${companyContext.company.slug} min-h-full bg-brand-background font-sans text-foreground`}
      >
        <CompanyProvider value={companyContext}>
          <CompanyThemeStyles
            theme={companyContext.theme}
            companySlug={companyContext.company.slug}
          >
            <OrganizationJsonLd
              companyName={companyContext.company.companyName}
              logoUrl={companyContext.company.logo}
            />
            <AppProviders>{children}</AppProviders>
            <SitePathwardBadge />
          </CompanyThemeStyles>
        </CompanyProvider>
      </body>
    </html>
  );
}

