import type { EmailCommunicationClass, EmailStatusTone } from "@/lib/email/types";

export type EmailDetailRow = {
  label: string;
  value: string;
};

export type EmailProgressStep = {
  label: string;
  status: string;
  date?: string;
  state: "complete" | "current" | "pending";
};

export type EmailStaffSignature = {
  name: string;
  title: string;
  email: string;
  department: string;
};

export type EmailBrandingContext = {
  institutionName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  officeHours: string;
  addressLine: string;
  websiteDomain: string;
  bankPartnerName: string;
  logoUrl?: string | null;
  primaryColor?: string;
};

export type EmailTemplateContent = {
  headline: string;
  body: string;
  tone?: EmailStatusTone;
  badge?: string;
  detailRows?: EmailDetailRow[];
  progressSteps?: EmailProgressStep[];
  ctaLabel?: string;
  ctaUrl?: string;
  ctaHint?: string;
  departmentName?: string;
  referenceNumber?: string;
  dateLabel?: string;
  contactEmail?: string;
  contactDepartment?: string;
  staff?: EmailStaffSignature;
  executiveSignature?: EmailStaffSignature;
  showProgress?: boolean;
  showInfoGrid?: boolean;
  showContact?: boolean;
  communicationClass?: EmailCommunicationClass;
  branding?: EmailBrandingContext;
};
