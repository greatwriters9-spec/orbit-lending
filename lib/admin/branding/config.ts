import { z } from "zod";

import {
  BRANDING_SETTINGS_KEY,
  DEFAULT_BRANDING_CONFIG,
  type BrandingConfig,
} from "@/types/branding-config";

const departmentDefaultsSchema = z.object({
  staffName: z.string().trim().min(1),
  staffTitle: z.string().trim().min(1),
  contactEmail: z.string().trim().email(),
});

export const brandingConfigSchema = z.object({
  institutionName: z.string().trim().min(2),
  tagline: z.string().trim().min(3),
  supportEmail: z.string().trim().email(),
  supportPhone: z.string().trim().min(7),
  officeHours: z.string().trim().min(3),
  addressLine1: z.string().trim().min(3),
  addressLine2: z.string().trim(),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  zipCode: z.string().trim().min(3),
  websiteDomain: z.string().trim().min(3),
  bankPartnerName: z.string().trim().min(2),
  departmentDefaults: z.object({
    loan_officer: departmentDefaultsSchema,
    underwriting: departmentDefaultsSchema,
    funding: departmentDefaultsSchema,
    closings: departmentDefaultsSchema,
    support: departmentDefaultsSchema,
    executive: departmentDefaultsSchema,
  }),
});

function mergeBrandingConfig(value: unknown): BrandingConfig {
  const base = DEFAULT_BRANDING_CONFIG;
  if (!value || typeof value !== "object") {
    return base;
  }

  const record = value as Record<string, unknown>;
  const defaults = (record.departmentDefaults ?? {}) as Record<
    string,
    Partial<BrandingConfig["departmentDefaults"]["loan_officer"]>
  >;

  return {
    institutionName: String(record.institutionName ?? base.institutionName),
    tagline: String(record.tagline ?? base.tagline),
    supportEmail: String(record.supportEmail ?? base.supportEmail),
    supportPhone: String(record.supportPhone ?? base.supportPhone),
    officeHours: String(record.officeHours ?? base.officeHours),
    addressLine1: String(record.addressLine1 ?? base.addressLine1),
    addressLine2: String(record.addressLine2 ?? base.addressLine2),
    city: String(record.city ?? base.city),
    state: String(record.state ?? base.state),
    zipCode: String(record.zipCode ?? base.zipCode),
    websiteDomain: String(record.websiteDomain ?? base.websiteDomain),
    bankPartnerName: String(record.bankPartnerName ?? base.bankPartnerName),
    departmentDefaults: {
      loan_officer: { ...base.departmentDefaults.loan_officer, ...defaults.loan_officer },
      underwriting: { ...base.departmentDefaults.underwriting, ...defaults.underwriting },
      funding: { ...base.departmentDefaults.funding, ...defaults.funding },
      closings: { ...base.departmentDefaults.closings, ...defaults.closings },
      support: { ...base.departmentDefaults.support, ...defaults.support },
      executive: { ...base.departmentDefaults.executive, ...defaults.executive },
    },
  };
}

export function parseBrandingConfig(value: unknown): BrandingConfig {
  const merged = mergeBrandingConfig(value);
  const parsed = brandingConfigSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_BRANDING_CONFIG;
}

export function formatBrandingAddress(config: BrandingConfig): string {
  const cityState = [config.city, config.state].filter(Boolean).join(", ");
  const cityLine = [cityState, config.zipCode].filter(Boolean).join(" ");
  return [config.addressLine1, config.addressLine2, cityLine]
    .filter(Boolean)
    .join("\n");
}
