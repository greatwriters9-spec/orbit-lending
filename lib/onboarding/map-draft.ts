import type { LoanApplicationDraft } from "@/types/loan-application";
import type {
  MortgageApplicationDraft,
  PreQualificationResult,
} from "@/types/mortgage-onboarding";
import { getEmploymentStatusForScoring } from "@/lib/onboarding/pre-qualification";

function buildPurpose(draft: MortgageApplicationDraft): string {
  const use = draft.propertyUse?.replace(/_/g, " ") ?? "primary residence";
  if (draft.homeFound && draft.propertyAddress) {
    return `Purchase ${use} at ${draft.propertyAddress.street}, ${draft.propertyAddress.city}, ${draft.propertyAddress.state}`;
  }
  if (draft.targetLocation) {
    return `Purchase ${use} in ${draft.targetLocation.city}, ${draft.targetLocation.state}`;
  }
  return `Purchase ${use} through Orbit Mortgage onboarding`;
}

export function mapMortgageDraftToLoanApplication(
  draft: MortgageApplicationDraft,
  preQual: PreQualificationResult,
): LoanApplicationDraft {
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
      purpose: buildPurpose(draft),
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
        homeFound: draft.homeFound ?? false,
        purchaseTimeline: draft.purchaseTimeline,
        buyingStage: draft.buyingStage,
        targetLocation: draft.targetLocation,
        targetHomePrice: draft.targetHomePrice,
        propertyAddress: draft.propertyAddress,
        purchasePrice: draft.purchasePrice,
        propertyType: draft.propertyType,
        propertyUse: draft.propertyUse,
        preQualification: preQual,
      },
    } as LoanApplicationDraft["personalInfo"] & Record<string, unknown>,
    financialInfo: {
      employmentStatus: getEmploymentStatusForScoring(draft),
      employerName: draft.employment?.employerName ?? "",
      jobTitle: draft.employment?.position ?? "",
      monthlyIncome,
      monthlyExpenses,
      existingDebt: 0,
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
