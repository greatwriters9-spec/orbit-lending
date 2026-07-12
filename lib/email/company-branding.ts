import { formatBrandingAddress } from "@/lib/admin/branding/config";
import { companyToBrandingConfig } from "@/lib/company/branding";
import { fetchCompanyById, fetchDefaultCompany } from "@/lib/company/queries";
import type { EmailSenderIdentity } from "@/lib/email/emailRouter";
import type { EmailDepartment } from "@/lib/email/types";
import type { BrandingConfig } from "@/types/branding-config";
import type { CompanyRecord, CompanySocialLinks } from "@/types/company";

const DEPARTMENT_SENDER_NAMES: Record<EmailDepartment, string> = {
  system: "Automated Notifications",
  loan_officer: "Loan Officer",
  underwriting: "Underwriting Department",
  funding: "Funding Department",
  closings: "Closing Department",
  compliance: "Compliance Department",
  support: "Customer Support",
  executive: "Chief Lending Officer",
};

export type CompanyEmailBranding = {
  name: string;
  domain: string;
  websiteUrl: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  supportEmail: string;
  noReplyEmail: string;
  phone: string | null;
  hours: string | null;
  address: string | null;
  tagline: string | null;
  footerText: string | null;
  copyright: string | null;
  socialLinks: CompanySocialLinks;
  branding: BrandingConfig;
};

function formatFromHeader(fromName: string, fromEmail: string): string {
  return `${fromName} <${fromEmail}>`;
}

export function getCompanyWebsiteOrigin(company: Pick<CompanyRecord, "website" | "domain">): string {
  const website = company.website?.trim();
  if (website) {
    if (website.startsWith("http://") || website.startsWith("https://")) {
      return website.replace(/\/$/, "");
    }
    return `https://${website.replace(/^www\./, "")}`;
  }
  return `https://${company.domain.replace(/^www\./, "")}`;
}

function deriveNoReplyEmail(company: CompanyRecord): string {
  if (company.noReplyEmail?.trim()) {
    return company.noReplyEmail.trim();
  }
  return `noreply@${company.domain.replace(/^www\./, "")}`;
}

function deriveSupportEmail(company: CompanyRecord): string {
  if (company.supportEmail?.trim()) {
    return company.supportEmail.trim();
  }
  return `support@${company.domain.replace(/^www\./, "")}`;
}

export function companyToEmailBranding(company: CompanyRecord): CompanyEmailBranding {
  const branding = companyToBrandingConfig(company);
  const address = formatBrandingAddress(branding);

  return {
    name: company.companyName,
    domain: company.domain.replace(/^www\./, ""),
    websiteUrl: getCompanyWebsiteOrigin(company),
    logo: company.logo,
    primaryColor: company.primaryColor,
    secondaryColor: company.secondaryColor,
    supportEmail: deriveSupportEmail(company),
    noReplyEmail: deriveNoReplyEmail(company),
    phone: company.phoneNumber,
    hours: company.businessHours,
    address: address || null,
    tagline: company.tagline,
    footerText: company.footerText,
    copyright: company.copyrightText,
    socialLinks: {
      facebook: company.facebook,
      instagram: company.instagram,
      linkedin: company.linkedin,
      twitter: company.twitter,
      tiktok: company.tiktok,
      youtube: company.youtube,
      threads: company.threads,
      telegram: company.telegram,
      whatsapp: company.whatsapp,
    },
    branding,
  };
}

export async function resolveCompanyEmailBranding(
  companyId?: string,
): Promise<CompanyEmailBranding> {
  if (companyId) {
    const company = await fetchCompanyById(companyId);
    if (company) {
      return companyToEmailBranding(company);
    }
  }

  try {
    const { getCompanyContext } = await import("@/lib/company/server");
    const { company } = await getCompanyContext();
    return companyToEmailBranding(company);
  } catch {
    const company = await fetchDefaultCompany();
    return companyToEmailBranding(company);
  }
}

const DEPARTMENT_EMAIL_LOCAL_PARTS: Partial<Record<EmailDepartment, string>> = {
  loan_officer: "loanofficer",
  underwriting: "underwriting",
  funding: "funding",
  closings: "closing",
  compliance: "compliance",
  executive: "lending",
};

export function getDepartmentContactEmailForBranding(
  branding: CompanyEmailBranding,
  department: EmailDepartment,
): string {
  if (department === "system") {
    return branding.noReplyEmail;
  }

  if (department === "support") {
    return branding.supportEmail;
  }

  const deptKey = department as keyof BrandingConfig["departmentDefaults"];
  const defaults = branding.branding.departmentDefaults[deptKey];
  if (defaults?.contactEmail?.trim()) {
    return defaults.contactEmail.trim();
  }

  if (department === "compliance") {
    return `compliance@${branding.domain}`;
  }

  const localPart = DEPARTMENT_EMAIL_LOCAL_PARTS[department];
  if (localPart) {
    return `${localPart}@${branding.domain}`;
  }

  return branding.supportEmail;
}

function departmentSenderName(
  branding: CompanyEmailBranding,
  department: EmailDepartment,
): string {
  if (department === "system") {
    return branding.name;
  }

  const deptKey = department as keyof BrandingConfig["departmentDefaults"];
  const defaults = branding.branding.departmentDefaults[deptKey];
  if (defaults?.staffName?.trim()) {
    return defaults.staffName.trim();
  }

  return DEPARTMENT_SENDER_NAMES[department];
}

export function getDepartmentSenderIdentity(
  branding: CompanyEmailBranding,
  department: EmailDepartment,
): EmailSenderIdentity {
  const fromEmail = getDepartmentContactEmailForBranding(branding, department);
  const fromName = departmentSenderName(branding, department);
  const replyTo =
    department === "system" ? branding.noReplyEmail : fromEmail;

  return {
    fromName,
    fromEmail,
    replyTo,
    department,
    from: formatFromHeader(fromName, fromEmail),
  };
}
