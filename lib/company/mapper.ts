import type { CompanyRecord, CompanyStatus } from "@/types/company";

export type CompanyRow = {
  id: string;
  company_name: string;
  slug: string;
  domain: string;
  alternate_domains: string[] | null;
  logo: string | null;
  favicon: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  headquarters_address: string | null;
  business_address: string | null;
  support_email: string | null;
  no_reply_email: string | null;
  general_email: string | null;
  phone_number: string | null;
  secondary_phone: string | null;
  business_hours: string | null;
  banking_partner: string | null;
  website: string | null;
  privacy_policy: string | null;
  terms_conditions: string | null;
  about_us: string | null;
  mission: string | null;
  vision: string | null;
  why_choose_us: string | null;
  footer_text: string | null;
  copyright_text: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  twitter: string | null;
  tiktok: string | null;
  youtube: string | null;
  threads: string | null;
  telegram: string | null;
  whatsapp: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_button_text: string | null;
  hero_background: string | null;
  tagline: string | null;
  branding_settings: Record<string, unknown> | null;
  company_status: CompanyStatus;
  created_at: string;
  updated_at: string;
};

export function mapCompanyRow(row: CompanyRow): CompanyRecord {
  return {
    id: row.id,
    companyName: row.company_name,
    slug: row.slug,
    domain: row.domain,
    alternateDomains: row.alternate_domains ?? [],
    logo: row.logo,
    favicon: row.favicon,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    accentColor: row.accent_color,
    backgroundColor: row.background_color,
    headquartersAddress: row.headquarters_address,
    businessAddress: row.business_address,
    supportEmail: row.support_email,
    noReplyEmail: row.no_reply_email,
    generalEmail: row.general_email,
    phoneNumber: row.phone_number,
    secondaryPhone: row.secondary_phone,
    businessHours: row.business_hours,
    bankingPartner: row.banking_partner,
    website: row.website,
    privacyPolicy: row.privacy_policy,
    termsConditions: row.terms_conditions,
    aboutUs: row.about_us,
    mission: row.mission,
    vision: row.vision,
    whyChooseUs: row.why_choose_us,
    footerText: row.footer_text,
    copyrightText: row.copyright_text,
    facebook: row.facebook,
    instagram: row.instagram,
    linkedin: row.linkedin,
    twitter: row.twitter,
    tiktok: row.tiktok,
    youtube: row.youtube,
    threads: row.threads,
    telegram: row.telegram,
    whatsapp: row.whatsapp,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    heroButtonText: row.hero_button_text,
    heroBackground: row.hero_background,
    tagline: row.tagline,
    brandingSettings: row.branding_settings ?? {},
    companyStatus: row.company_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCompanyToRow(
  company: Partial<CompanyRecord> & Pick<CompanyRecord, "companyName" | "slug" | "domain">,
): Partial<CompanyRow> {
  return {
    company_name: company.companyName,
    slug: company.slug,
    domain: company.domain,
    alternate_domains: company.alternateDomains ?? [],
    logo: company.logo ?? null,
    favicon: company.favicon ?? null,
    primary_color: company.primaryColor,
    secondary_color: company.secondaryColor,
    accent_color: company.accentColor,
    background_color: company.backgroundColor,
    headquarters_address: company.headquartersAddress ?? null,
    business_address: company.businessAddress ?? null,
    support_email: company.supportEmail ?? null,
    no_reply_email: company.noReplyEmail ?? null,
    general_email: company.generalEmail ?? null,
    phone_number: company.phoneNumber ?? null,
    secondary_phone: company.secondaryPhone ?? null,
    business_hours: company.businessHours ?? null,
    banking_partner: company.bankingPartner ?? null,
    website: company.website ?? null,
    privacy_policy: company.privacyPolicy ?? null,
    terms_conditions: company.termsConditions ?? null,
    about_us: company.aboutUs ?? null,
    mission: company.mission ?? null,
    vision: company.vision ?? null,
    why_choose_us: company.whyChooseUs ?? null,
    footer_text: company.footerText ?? null,
    copyright_text: company.copyrightText ?? null,
    facebook: company.facebook ?? null,
    instagram: company.instagram ?? null,
    linkedin: company.linkedin ?? null,
    twitter: company.twitter ?? null,
    tiktok: company.tiktok ?? null,
    youtube: company.youtube ?? null,
    threads: company.threads ?? null,
    telegram: company.telegram ?? null,
    whatsapp: company.whatsapp ?? null,
    hero_title: company.heroTitle ?? null,
    hero_subtitle: company.heroSubtitle ?? null,
    hero_button_text: company.heroButtonText ?? null,
    hero_background: company.heroBackground ?? null,
    tagline: company.tagline ?? null,
    branding_settings: company.brandingSettings ?? {},
    company_status: company.companyStatus ?? "active",
  };
}
