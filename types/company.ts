import type { BrandingConfig } from "@/types/branding-config";

export type CompanyStatus = "active" | "inactive";

export type CompanyRecord = {
  id: string;
  companyName: string;
  slug: string;
  domain: string;
  alternateDomains: string[];
  logo: string | null;
  favicon: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  headquartersAddress: string | null;
  businessAddress: string | null;
  supportEmail: string | null;
  noReplyEmail: string | null;
  generalEmail: string | null;
  phoneNumber: string | null;
  secondaryPhone: string | null;
  businessHours: string | null;
  bankingPartner: string | null;
  website: string | null;
  privacyPolicy: string | null;
  termsConditions: string | null;
  aboutUs: string | null;
  mission: string | null;
  vision: string | null;
  whyChooseUs: string | null;
  footerText: string | null;
  copyrightText: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  twitter: string | null;
  tiktok: string | null;
  youtube: string | null;
  threads: string | null;
  telegram: string | null;
  whatsapp: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroButtonText: string | null;
  heroBackground: string | null;
  tagline: string | null;
  brandingSettings: Record<string, unknown>;
  companyStatus: CompanyStatus;
  createdAt: string;
  updatedAt: string;
};

export type CompanySocialLinks = {
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  twitter: string | null;
  tiktok: string | null;
  youtube: string | null;
  threads: string | null;
  telegram: string | null;
  whatsapp: string | null;
};

export type CompanyTheme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  brandNavy: string;
  brandBlue: string;
  brandBlueDark: string;
};

export type CompanyContextValue = {
  company: CompanyRecord;
  branding: BrandingConfig;
  theme: CompanyTheme;
};

export const COMPANY_COOKIE_NAME = "orbit_company_id";

export const ORBIT_COMPANY_ID = "a1000000-0000-4000-8000-000000000001";
export const OAKSTONE_COMPANY_ID = "a1000000-0000-4000-8000-000000000002";
