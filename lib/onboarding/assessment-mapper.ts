import { DEFAULT_MORTGAGE_TERM_MONTHS } from "@/lib/mortgage/preferences";
import { resolveMinDownPaymentPercent } from "@/lib/mortgage/preferences";
import { resolveHomePriceFromDraft } from "@/lib/mortgage/preferences";
import type { MortgageConfig } from "@/types/mortgage-config";
import type {
  AssessmentEmploymentStatus,
  EmploymentType,
  MortgageApplicationDraft,
} from "@/types/mortgage-onboarding";

function mapAssessmentEmployment(
  status?: AssessmentEmploymentStatus,
): EmploymentType {
  switch (status) {
    case "self_employed":
      return "self_employed";
    case "retired":
      return "retired";
    case "military":
    case "employed":
      return "full_time";
    case "other":
      return "contractor";
    default:
      return "full_time";
  }
}

/** Maps the lightweight buying-power assessment into the draft shape expected by computePreQualification. */
export function prepareDraftForPreQualification(
  draft: MortgageApplicationDraft,
  config?: MortgageConfig,
): MortgageApplicationDraft {
  const homePrice =
    resolveHomePriceFromDraft(draft) ||
    (draft.homeFound ? draft.purchasePrice : draft.targetHomePrice) ||
    400_000;

  const minimumDownPercent = resolveMinDownPaymentPercent(config);
  const defaultDownPayment = Math.round(homePrice * (minimumDownPercent / 100));
  const downPaymentAmount =
    draft.plannedDownPayment && draft.plannedDownPayment > 0
      ? draft.plannedDownPayment
      : defaultDownPayment;

  const annualIncome =
    draft.annualHouseholdIncome ?? draft.employment?.annualIncome ?? 0;

  const state = draft.targetLocation?.state ?? "CA";

  return {
    ...draft,
    homeFound: draft.homeFound ?? false,
    propertyUse: draft.propertyUse ?? "primary_residence",
    targetLocation: {
      city: draft.targetLocation?.city ?? "",
      state,
      zip: draft.targetLocation?.zip ?? "",
    },
    purchasePrice: draft.homeFound ? homePrice : draft.purchasePrice,
    targetHomePrice: draft.homeFound ? draft.targetHomePrice : homePrice,
    employment: {
      employerName: draft.employment?.employerName ?? "",
      employmentType:
        draft.employment?.employmentType ??
        mapAssessmentEmployment(draft.employmentStatus),
      position: draft.employment?.position ?? "",
      yearsEmployed: draft.employment?.yearsEmployed ?? "",
      annualIncome,
    },
    assets: draft.assets ?? {
      checkingBalance: 0,
      savingsBalance: 0,
      investmentBalance: 0,
    },
    mortgagePreferences: {
      downPaymentMode: "custom",
      downPaymentAmount,
      termMonths:
        draft.mortgagePreferences?.termMonths ?? DEFAULT_MORTGAGE_TERM_MONTHS,
    },
  };
}
