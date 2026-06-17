import { parseOnboardingMeta } from "@/lib/onboarding/parse-application";
import type {
  AssetInfo,
  EmploymentType,
  MortgageApplicationDraft,
  PropertyType,
  PropertyUse,
} from "@/types/mortgage-onboarding";

export function mapApplicationToMortgageDraft(input: {
  personalInfo: Record<string, unknown>;
  financialInfo: Record<string, unknown>;
}): MortgageApplicationDraft {
  const onboarding = parseOnboardingMeta(input.personalInfo);
  const financial = input.financialInfo;
  const assets = financial.assets as AssetInfo | undefined;

  return {
    homeFound: onboarding?.homeFound,
    purchaseTimeline: onboarding?.purchaseTimeline,
    buyingStage: onboarding?.buyingStage,
    targetLocation: onboarding?.targetLocation,
    targetHomePrice: onboarding?.targetHomePrice,
    propertyAddress: onboarding?.propertyAddress,
    purchasePrice: onboarding?.purchasePrice,
    propertyType: onboarding?.propertyType as PropertyType | undefined,
    propertyUse: onboarding?.propertyUse as PropertyUse | undefined,
    firstName: String(input.personalInfo.firstName ?? ""),
    middleName: String(input.personalInfo.middleName ?? ""),
    lastName: String(input.personalInfo.lastName ?? ""),
    dateOfBirth: String(input.personalInfo.dateOfBirth ?? ""),
    email: String(input.personalInfo.email ?? ""),
    phone: String(input.personalInfo.phone ?? ""),
    address: {
      street: String(input.personalInfo.address ?? ""),
      city: String(input.personalInfo.city ?? ""),
      state: String(input.personalInfo.state ?? ""),
      zip: String(input.personalInfo.zipCode ?? ""),
      yearsAtAddress: String(input.personalInfo.yearsAtAddress ?? ""),
    },
    employment: financial.annualIncome
      ? {
          employerName: String(financial.employerName ?? ""),
          employmentType: financial.employmentType as EmploymentType,
          position: String(financial.jobTitle ?? ""),
          yearsEmployed: String(financial.yearsEmployed ?? ""),
          annualIncome: Number(financial.annualIncome ?? 0),
        }
      : undefined,
    assets: assets
      ? {
          checkingBalance: Number(assets.checkingBalance ?? 0),
          savingsBalance: Number(assets.savingsBalance ?? 0),
          investmentBalance: Number(assets.investmentBalance ?? 0),
        }
      : undefined,
    creditProfile: {
      ssn: "",
      citizenshipStatus: String(financial.citizenshipStatus ?? ""),
      maritalStatus: String(financial.maritalStatus ?? ""),
    },
    preQualification: onboarding?.preQualification,
    completedAt: new Date().toISOString(),
  };
}
