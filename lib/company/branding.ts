import { DEFAULT_BRANDING_CONFIG, type BrandingConfig } from "@/types/branding-config";

import type { CompanyRecord, CompanyTheme } from "@/types/company";



import {

  isOakstoneCompany,

  oakstoneColors,

  oakstoneCssVariables,

  orbitCssVariables,

} from "@/lib/design-system/oakstone/theme";



function parseAddressLines(address: string | null | undefined): {

  addressLine1: string;

  addressLine2: string;

  city: string;

  state: string;

  zipCode: string;

} {

  if (!address) {

    return {

      addressLine1: DEFAULT_BRANDING_CONFIG.addressLine1,

      addressLine2: "",

      city: DEFAULT_BRANDING_CONFIG.city,

      state: DEFAULT_BRANDING_CONFIG.state,

      zipCode: DEFAULT_BRANDING_CONFIG.zipCode,

    };

  }



  const parts = address.split(",").map((part) => part.trim());

  if (parts.length >= 3) {

    const cityStateZip = parts[parts.length - 1] ?? "";

    const match = cityStateZip.match(/^(.+?)\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);

    return {

      addressLine1: parts.slice(0, -1).join(", "),

      addressLine2: "",

      city: match?.[1] ?? parts[parts.length - 2] ?? "",

      state: match?.[2] ?? "",

      zipCode: match?.[3] ?? "",

    };

  }



  return {

    addressLine1: address,

    addressLine2: "",

    city: "",

    state: "",

    zipCode: "",

  };

}



export function companyToBrandingConfig(company: CompanyRecord): BrandingConfig {

  const address = parseAddressLines(company.businessAddress ?? company.headquartersAddress);

  const settings = company.brandingSettings as {

    departmentDefaults?: BrandingConfig["departmentDefaults"];

  };



  return {

    institutionName: company.companyName,

    tagline: company.tagline ?? DEFAULT_BRANDING_CONFIG.tagline,

    supportEmail: company.supportEmail ?? DEFAULT_BRANDING_CONFIG.supportEmail,

    supportPhone: company.phoneNumber ?? DEFAULT_BRANDING_CONFIG.supportPhone,

    officeHours: company.businessHours ?? DEFAULT_BRANDING_CONFIG.officeHours,

    addressLine1: address.addressLine1,

    addressLine2: address.addressLine2,

    city: address.city,

    state: address.state,

    zipCode: address.zipCode,

    websiteDomain: company.website?.replace(/^https?:\/\//, "") ?? company.domain,

    bankPartnerName: company.bankingPartner ?? DEFAULT_BRANDING_CONFIG.bankPartnerName,

    departmentDefaults: {

      ...DEFAULT_BRANDING_CONFIG.departmentDefaults,

      ...(settings.departmentDefaults ?? {}),

    },

  };

}



export function companyToTheme(company: CompanyRecord): CompanyTheme {

  if (isOakstoneCompany(company.slug)) {

    return {

      primaryColor: oakstoneColors.primaryGreen,

      secondaryColor: oakstoneColors.premiumGold,

      accentColor: oakstoneColors.secondaryGreen,

      backgroundColor: oakstoneColors.lightBackground,

      brandNavy: oakstoneColors.primaryGreen,

      brandBlue: oakstoneColors.premiumGold,

      brandBlueDark: oakstoneColors.warmGoldHover,

    };

  }



  return {

    primaryColor: company.primaryColor,

    secondaryColor: company.secondaryColor,

    accentColor: company.accentColor,

    backgroundColor: company.backgroundColor,

    brandNavy: company.primaryColor,

    brandBlue: company.secondaryColor,

    brandBlueDark: company.primaryColor,

  };

}



export function themeToCssVariables(

  theme: CompanyTheme,

  companySlug?: string,

): Record<string, string> {

  const base = {

    "--brand-navy": theme.brandNavy,

    "--brand-blue": theme.brandBlue,

    "--brand-blue-dark": theme.brandBlueDark,

    "--company-primary": theme.primaryColor,

    "--company-secondary": theme.secondaryColor,

    "--company-accent": theme.accentColor,

    "--company-background": theme.backgroundColor,

  };



  if (companySlug && isOakstoneCompany(companySlug)) {

    return {

      ...base,

      ...oakstoneCssVariables(),

    };

  }



  return {

    ...base,

    ...orbitCssVariables(theme.primaryColor),

  };

}

