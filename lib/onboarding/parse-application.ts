import type {
  MortgageApplicationDraft,
  PreQualificationResult,
  PropertyAddress,
  TargetLocation,
} from "@/types/mortgage-onboarding";

type OnboardingMeta = {
  homeFound?: boolean;
  targetLocation?: TargetLocation;
  propertyAddress?: PropertyAddress;
  purchasePrice?: number;
  propertyType?: string;
  propertyUse?: string;
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
