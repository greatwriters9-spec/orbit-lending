import { parseOnboardingMeta } from "@/lib/onboarding/parse-application";
import {
  createEmptyFullMortgageApplication,
  type ApplicationProgress,
  type FullMortgageApplication,
} from "@/types/mortgage-full-application";
import type { MortgageApplicationDraft } from "@/types/mortgage-onboarding";

function parseFullApplication(
  personalInfo: Record<string, unknown>,
): FullMortgageApplication | null {
  const raw = personalInfo.fullApplication;
  if (!raw || typeof raw !== "object") {
    return null;
  }
  return raw as FullMortgageApplication;
}

function parseApplicationProgress(
  personalInfo: Record<string, unknown>,
): ApplicationProgress | null {
  const raw = personalInfo.applicationProgress;
  if (!raw || typeof raw !== "object") {
    return null;
  }
  return raw as ApplicationProgress;
}

export function mapApplicationToFullMortgageApplication(input: {
  personalInfo: Record<string, unknown>;
  financialInfo: Record<string, unknown>;
  requestedAmount?: number | null;
}): FullMortgageApplication {
  const existing = parseFullApplication(input.personalInfo);
  if (existing) {
    return existing;
  }

  const onboarding = parseOnboardingMeta(input.personalInfo);
  const financial = input.financialInfo;
  const preQual = onboarding?.preQualification;

  const seed = createEmptyFullMortgageApplication({
    personal: {
      firstName: String(input.personalInfo.firstName ?? ""),
      middleName: String(input.personalInfo.middleName ?? ""),
      lastName: String(input.personalInfo.lastName ?? ""),
      dateOfBirth: String(input.personalInfo.dateOfBirth ?? ""),
      ssn: "",
      citizenship: String(financial.citizenshipStatus ?? ""),
      maritalStatus: String(financial.maritalStatus ?? ""),
      phone: String(input.personalInfo.phone ?? ""),
      email: String(input.personalInfo.email ?? ""),
    },
    residence: {
      current: {
        street: String(input.personalInfo.address ?? ""),
        city: String(input.personalInfo.city ?? ""),
        state: String(input.personalInfo.state ?? ""),
        zip: String(input.personalInfo.zipCode ?? ""),
        moveInDate: "",
        housingStatus: "rent",
        monthlyPayment: 0,
      },
      previousAddresses: [],
    },
    employment: {
      current: {
        employmentStatus: String(financial.employmentStatus ?? onboarding?.employmentStatus ?? ""),
        employerName: String(financial.employerName ?? ""),
        jobTitle: String(financial.jobTitle ?? ""),
        employerStreet: "",
        employerCity: "",
        employerState: "",
        employerZip: "",
        employerPhone: "",
        startDate: "",
        isSelfEmployed: financial.employmentType === "self_employed",
        businessName: "",
        yearsInBusiness: String(financial.yearsEmployed ?? ""),
      },
      previousEmployments: [],
    },
    income: {
      baseSalary: Number(financial.annualIncome ?? onboarding?.annualHouseholdIncome ?? 0),
      overtime: 0,
      bonus: 0,
      commission: 0,
      selfEmployment: 0,
      rental: 0,
      retirement: 0,
      socialSecurity: 0,
      other: 0,
      selectedSources: ["baseSalary"],
    },
    assets: {
      checking: Number((financial.assets as { checkingBalance?: number })?.checkingBalance ?? 0),
      savings: Number((financial.assets as { savingsBalance?: number })?.savingsBalance ?? 0),
      investments: Number((financial.assets as { investmentBalance?: number })?.investmentBalance ?? 0),
      retirement: 0,
      cash: 0,
      giftFunds: 0,
      other: 0,
    },
    liabilities: {
      creditCards: [],
      studentLoans: [],
      autoLoans: [],
      personalLoans: [],
      childSupport: 0,
      alimony: 0,
      otherMonthly: Number(financial.existingDebt ?? onboarding?.monthlyDebtPayments ?? 0),
    },
    property: {
      hasProperty: Boolean(onboarding?.homeFound),
      street: onboarding?.propertyAddress?.street ?? "",
      city: onboarding?.propertyAddress?.city ?? onboarding?.targetLocation?.city ?? "",
      state: onboarding?.propertyAddress?.state ?? onboarding?.targetLocation?.state ?? "",
      zip: onboarding?.propertyAddress?.zip ?? onboarding?.targetLocation?.zip ?? "",
      purchasePrice: Number(
        onboarding?.purchasePrice ?? onboarding?.targetHomePrice ?? preQual?.maximumHomePrice ?? 0,
      ),
      propertyType: onboarding?.propertyType ?? "single_family",
      occupancy: onboarding?.propertyUse ?? "primary_residence",
      sellerName: "",
      sellerContact: "",
    },
    loanDetails: {
      desiredLoanAmount: Number(
        input.requestedAmount ?? preQual?.estimatedMortgageAmount ?? 0,
      ),
      desiredDownPayment: Number(
        onboarding?.plannedDownPayment ?? preQual?.estimatedDownPayment ?? 0,
      ),
      loanPurpose: onboarding?.buyingGoal === "refinancing" ? "refinance" : "purchase",
      loanTermMonths: preQual?.loanTermMonths ?? 360,
      interestPreference: "fixed",
      occupancyType: onboarding?.propertyUse ?? "primary_residence",
    },
  });

  const progress = parseApplicationProgress(input.personalInfo);
  if (progress) {
    seed.progress = progress;
  }

  return seed;
}

export function seedFromOnboardingDraft(
  draft: MortgageApplicationDraft,
  email?: string,
): FullMortgageApplication {
  return mapApplicationToFullMortgageApplication({
    personalInfo: {
      firstName: draft.firstName,
      middleName: draft.middleName,
      lastName: draft.lastName,
      dateOfBirth: draft.dateOfBirth,
      email: draft.email ?? email,
      phone: draft.phone,
      address: draft.address?.street,
      city: draft.address?.city,
      state: draft.address?.state,
      zipCode: draft.address?.zip,
      onboarding: {
        homeFound: draft.homeFound,
        targetLocation: draft.targetLocation,
        targetHomePrice: draft.targetHomePrice,
        propertyAddress: draft.propertyAddress,
        purchasePrice: draft.purchasePrice,
        propertyType: draft.propertyType,
        propertyUse: draft.propertyUse,
        plannedDownPayment: draft.plannedDownPayment,
        annualHouseholdIncome: draft.annualHouseholdIncome,
        monthlyDebtPayments: draft.monthlyDebtPayments,
        employmentStatus: draft.employmentStatus,
        buyingGoal: draft.buyingGoal,
        preQualification: draft.preQualification,
      },
    },
    financialInfo: {
      annualIncome: draft.annualHouseholdIncome ?? draft.employment?.annualIncome,
      existingDebt: draft.monthlyDebtPayments,
      citizenshipStatus: draft.creditProfile?.citizenshipStatus,
      maritalStatus: draft.creditProfile?.maritalStatus,
      employerName: draft.employment?.employerName,
      jobTitle: draft.employment?.position,
      employmentType: draft.employment?.employmentType,
      yearsEmployed: draft.employment?.yearsEmployed,
      assets: draft.assets,
    },
    requestedAmount: draft.preQualification?.estimatedMortgageAmount,
  });
}
