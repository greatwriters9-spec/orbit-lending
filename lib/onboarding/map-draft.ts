import type { LoanApplicationDraft } from "@/types/loan-application";
import type {
  MortgageApplicationDraft,
  PreQualificationResult,
} from "@/types/mortgage-onboarding";
import { getEmploymentStatusForScoring } from "@/lib/onboarding/pre-qualification";
import { DEFAULT_BRANDING_CONFIG } from "@/types/branding-config";

const BUYING_GOAL_LABELS: Record<string, string> = {
  first_home: "first home purchase",
  another_home: "another home purchase",
  refinancing: "refinancing",
  exploring: "home buying exploration",
};

function buildPurpose(
  draft: MortgageApplicationDraft,
  institutionName: string,
): string {
  const goalLabel = draft.buyingGoal
    ? BUYING_GOAL_LABELS[draft.buyingGoal]
    : undefined;
  const use = draft.propertyUse?.replace(/_/g, " ") ?? "primary residence";

  if (goalLabel === "refinancing") {
    return `Refinance through ${institutionName} pre-qualification`;
  }

  if (draft.homeFound && draft.propertyAddress) {
    return `Purchase ${use} at ${draft.propertyAddress.street}, ${draft.propertyAddress.city}, ${draft.propertyAddress.state}`;
  }
  if (draft.targetLocation?.state) {
    const location = draft.targetLocation.city
      ? `${draft.targetLocation.city}, ${draft.targetLocation.state}`
      : draft.targetLocation.state;
    return goalLabel
      ? `${goalLabel} in ${location}`
      : `Purchase ${use} in ${location}`;
  }
  return goalLabel
    ? `${goalLabel} through ${institutionName} pre-qualification`
    : `Purchase ${use} through ${institutionName} pre-qualification`;
}

export function mapMortgageDraftToLoanApplication(
  draft: MortgageApplicationDraft,
  preQual: PreQualificationResult,
  options?: { institutionName?: string },
): LoanApplicationDraft {
  const institutionName =
    options?.institutionName ?? DEFAULT_BRANDING_CONFIG.institutionName;
  const monthlyIncome = (draft.employment?.annualIncome ?? 0) / 12;
  const monthlyExpenses = Math.round(monthlyIncome * 0.35);
  const liquidAssets =
    (draft.assets?.checkingBalance ?? 0) +
    (draft.assets?.savingsBalance ?? 0) +
    (draft.assets?.investmentBalance ?? 0);

  return {
    currentStep: 7,
    loanProductSlug: preQual.loanProductSlug,
    configuration: {
      requestedAmount: preQual.estimatedMortgageAmount,
      selectedTermId: preQual.loanTermId,
      repaymentFrequency: "Monthly",
      purpose: buildPurpose(draft, institutionName),
    },
    personalInfo: {
      firstName: draft.firstName ?? "",
      lastName: draft.lastName ?? "",
      email: draft.email ?? "",
      phone: draft.phone ?? "",
      dateOfBirth: draft.dateOfBirth ?? "",
      address: draft.address?.street ?? "",
      city: draft.address?.city ?? draft.targetLocation?.city ?? "",
      state: draft.address?.state ?? draft.targetLocation?.state ?? "",
      country: "US",
      middleName: draft.middleName ?? "",
      zipCode: draft.address?.zip ?? draft.targetLocation?.zip ?? "",
      yearsAtAddress: draft.address?.yearsAtAddress ?? "",
      onboarding: {
        buyingGoal: draft.buyingGoal,
        homeFound: draft.homeFound ?? false,
        plannedDownPayment: draft.plannedDownPayment,
        annualHouseholdIncome: draft.annualHouseholdIncome,
        monthlyDebtPayments: draft.monthlyDebtPayments,
        creditRange: draft.creditRange,
        employmentStatus: draft.employmentStatus,
        militaryService: draft.militaryService,
        purchaseTimeline: draft.purchaseTimeline,
        buyingStage: draft.buyingStage,
        targetLocation: draft.targetLocation,
        targetHomePrice: draft.targetHomePrice,
        propertyAddress: draft.propertyAddress,
        purchasePrice: draft.purchasePrice,
        propertyType: draft.propertyType,
        propertyUse: draft.propertyUse,
        mortgagePreferences: draft.mortgagePreferences,
        preQualification: preQual,
      },
    } as LoanApplicationDraft["personalInfo"] & Record<string, unknown>,
    financialInfo: {
      employmentStatus: getEmploymentStatusForScoring(draft),
      employerName: draft.employment?.employerName ?? "",
      jobTitle: draft.employment?.position ?? "",
      monthlyIncome,
      monthlyExpenses,
      existingDebt: draft.monthlyDebtPayments ?? 0,
      employmentType: draft.employment?.employmentType,
      yearsEmployed: draft.employment?.yearsEmployed,
      annualIncome: draft.employment?.annualIncome,
      assets: draft.assets,
      citizenshipStatus: draft.creditProfile?.citizenshipStatus,
      maritalStatus: draft.creditProfile?.maritalStatus,
    } as LoanApplicationDraft["financialInfo"] & Record<string, unknown>,
    documents: {},
  };
}
