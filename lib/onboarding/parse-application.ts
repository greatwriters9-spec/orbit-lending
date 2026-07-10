import type {
  MortgageApplicationDraft,
  PreQualificationResult,
  PropertyAddress,
  TargetLocation,
  MortgagePreferences,
} from "@/types/mortgage-onboarding";

type OnboardingMeta = {
  buyingGoal?: MortgageApplicationDraft["buyingGoal"];
  homeFound?: boolean;
  plannedDownPayment?: number;
  annualHouseholdIncome?: number;
  monthlyDebtPayments?: number;
  creditRange?: MortgageApplicationDraft["creditRange"];
  employmentStatus?: MortgageApplicationDraft["employmentStatus"];
  militaryService?: MortgageApplicationDraft["militaryService"];
  purchaseTimeline?: MortgageApplicationDraft["purchaseTimeline"];
  buyingStage?: MortgageApplicationDraft["buyingStage"];
  targetLocation?: TargetLocation;
  targetHomePrice?: number;
  propertyAddress?: PropertyAddress;
  purchasePrice?: number;
  propertyType?: string;
  propertyUse?: string;
  mortgagePreferences?: MortgagePreferences;
  preQualification?: PreQualificationResult;
};

export function parseOnboardingMeta(
  personalInfo: Record<string, unknown> | null | undefined,
): OnboardingMeta | null {
  if (!personalInfo || typeof personalInfo !== "object") {
    return null;
  }

  const onboarding = personalInfo.onboarding;
  if (!onboarding || typeof onboarding !== "object") {
    return null;
  }

  return onboarding as OnboardingMeta;
}

export function extractPreQualification(
  personalInfo: Record<string, unknown> | null | undefined,
): PreQualificationResult | null {
  const meta = parseOnboardingMeta(personalInfo);
  return meta?.preQualification ?? null;
}
