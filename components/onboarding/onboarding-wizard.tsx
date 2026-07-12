"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

import {
  OnboardingField,
  OnboardingQuestion,
  OnboardingShell,
  OptionCard,
  onboardingInputClassName,
} from "@/components/onboarding/onboarding-shell";
import { OnboardingStateInput } from "@/components/onboarding/onboarding-state-input";
import { Button } from "@/components/ui-kit/button";
import { formatSSNInput, formatUSPhoneInput, isCompleteSSN, isCompleteUSPhone } from "@/lib/auth/input-formatters";
import { finalizeOnboardingAction, updateApplicationFromOnboardingAction } from "@/lib/onboarding/actions";
import {
  readMortgageApplicationDraft,
  writeMortgageApplicationDraft,
} from "@/lib/onboarding/draft-storage";
import {
  mergeOnboardingDraftWithProfile,
} from "@/lib/onboarding/map-profile-to-draft";
import { OnboardingMortgagePreferencesStep } from "@/components/onboarding/mortgage-preferences-step";
import {
  createDefaultMortgagePreferences,
  validateMortgagePreferences,
  resolveHomePriceFromDraft,
} from "@/lib/mortgage/preferences";
import { DEFAULT_MORTGAGE_CONFIG, type MortgageConfig } from "@/types/mortgage-config";
import type {
  AssetInfo,
  BuyingStage,
  EmploymentType,
  MortgageApplicationDraft,
  PropertyType,
  PropertyUse,
  PurchaseTimeline,
} from "@/types/mortgage-onboarding";
import { ONBOARDING_ROUTES } from "@/types/mortgage-onboarding";

type StepKey =
  | "home-found"
  | "purchase-timeline"
  | "buying-stage"
  | "target-location"
  | "target-price"
  | "property-use-search"
  | "property-address"
  | "purchase-price"
  | "property-type"
  | "property-use-found"
  | "mortgage-preferences"
  | "about-you"
  | "contact"
  | "current-address"
  | "employment"
  | "assets"
  | "credit";

const SEARCH_STEPS: StepKey[] = [
  "home-found",
  "purchase-timeline",
  "buying-stage",
  "target-location",
  "target-price",
  "property-use-search",
  "mortgage-preferences",
  "about-you",
  "contact",
  "current-address",
  "employment",
  "assets",
  "credit",
];

const FOUND_STEPS: StepKey[] = [
  "home-found",
  "property-address",
  "purchase-price",
  "property-type",
  "property-use-found",
  "mortgage-preferences",
  "about-you",
  "contact",
  "current-address",
  "employment",
  "assets",
  "credit",
];

const TIMELINE_OPTIONS: { value: PurchaseTimeline; label: string }[] = [
  { value: "within_30_days", label: "Within 30 days" },
  { value: "2_3_months", label: "2–3 months" },
  { value: "4_6_months", label: "4–6 months" },
  { value: "6_plus_months", label: "6+ months" },
];

const STAGE_OPTIONS: { value: BuyingStage; label: string }[] = [
  { value: "just_getting_started", label: "Just getting started" },
  { value: "looking_at_listings", label: "Looking at homes and listings" },
  { value: "working_with_agent", label: "Working with a real estate agent" },
  { value: "ready_to_make_offer", label: "Ready to make an offer" },
];

const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "single_family", label: "Single Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi_family", label: "Multi-Family" },
];

const PROPERTY_USE_OPTIONS: { value: PropertyUse; label: string }[] = [
  { value: "primary_residence", label: "Primary Residence" },
  { value: "vacation_home", label: "Vacation Home" },
  { value: "investment_property", label: "Investment Property" },
];

const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "self_employed", label: "Self Employed" },
  { value: "contractor", label: "Contractor" },
  { value: "retired", label: "Retired" },
];

const CITIZENSHIP_OPTIONS = [
  { value: "us_citizen", label: "U.S. Citizen" },
  { value: "permanent_resident", label: "Permanent Resident" },
  { value: "non_permanent_resident", label: "Non-Permanent Resident" },
  { value: "other", label: "Other" },
] as const;

const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "separated", label: "Separated" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

const PERSONAL_DETAIL_STEPS = new Set<StepKey>(["about-you", "contact", "current-address"]);

function getSteps(
  draft: MortgageApplicationDraft,
  options?: { skipPersonalDetails?: boolean },
): StepKey[] {
  let steps: StepKey[];

  if (draft.homeFound === true) {
    steps = FOUND_STEPS;
  } else if (draft.homeFound === false) {
    steps = SEARCH_STEPS;
  } else {
    return ["home-found"];
  }

  if (options?.skipPersonalDetails) {
    return steps.filter((step) => !PERSONAL_DETAIL_STEPS.has(step));
  }

  return steps;
}

function isEmployedType(type?: EmploymentType): boolean {
  return type === "full_time" || type === "part_time";
}

function parseCurrency(value: string): number {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmountFieldValue(value?: number): string {
  return value && value > 0 ? String(value) : "";
}

function formatZeroAllowedAmountFieldValue(value?: number): string {
  if (value === undefined) return "";
  if (value === 0) return "0";
  return String(value);
}

function buildAssetUpdate(
  draft: MortgageApplicationDraft,
  patch: Partial<AssetInfo>,
): AssetInfo {
  return {
    checkingBalance: draft.assets?.checkingBalance ?? 0,
    savingsBalance: draft.assets?.savingsBalance ?? 0,
    investmentBalance: draft.assets?.investmentBalance ?? 0,
    ...patch,
  };
}

export function OnboardingWizard({
  isLoggedIn = false,
  mode = "create",
  applicationId,
  initialDraft,
  mortgageConfig = DEFAULT_MORTGAGE_CONFIG,
  confirmProfileDetails = false,
  profileDraft,
}: {
  isLoggedIn?: boolean;
  mode?: "create" | "edit";
  applicationId?: string;
  initialDraft?: MortgageApplicationDraft;
  mortgageConfig?: MortgageConfig;
  confirmProfileDetails?: boolean;
  profileDraft?: Partial<MortgageApplicationDraft>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = mode === "edit" && Boolean(applicationId);
  const [draft, setDraft] = useState<MortgageApplicationDraft>(initialDraft ?? {});
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [employmentPhase, setEmploymentPhase] = useState<"type" | "details">("type");
  const [isFinishing, setIsFinishing] = useState(false);

  const skipPersonalDetails = confirmProfileDetails && !isEditMode;

  useEffect(() => {
    if (isEditMode && initialDraft) {
      setDraft(initialDraft);
      setStepIndex(0);
      setHydrated(true);
      return;
    }

    const stored = readMortgageApplicationDraft() ?? {};
    const homeFoundParam = searchParams.get("homeFound");
    const homeFoundPatch =
      homeFoundParam === "true"
        ? { homeFound: true as const }
        : homeFoundParam === "false"
          ? { homeFound: false as const }
          : {};

    const merged = profileDraft
      ? mergeOnboardingDraftWithProfile(stored, profileDraft, skipPersonalDetails)
      : stored;

    const initial = { ...merged, ...homeFoundPatch };

    writeMortgageApplicationDraft(initial);
    setDraft(initial);

    if (homeFoundParam === "true" && initial.homeFound === true) {
      setStepIndex(1);
    }

    setHydrated(true);
  }, [initialDraft, isEditMode, profileDraft, searchParams, skipPersonalDetails]);

  const steps = useMemo(
    () => getSteps(draft, { skipPersonalDetails }),
    [draft, skipPersonalDetails],
  );
  const currentStep = steps[stepIndex] ?? "home-found";
  const totalSteps = draft.homeFound === undefined ? 13 : steps.length;

  useEffect(() => {
    if (currentStep !== "employment") {
      setEmploymentPhase("type");
    }
  }, [currentStep]);

  const updateDraft = useCallback((patch: Partial<MortgageApplicationDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      writeMortgageApplicationDraft(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (currentStep === "mortgage-preferences" && !draft.mortgagePreferences) {
      updateDraft({
        mortgagePreferences: createDefaultMortgagePreferences(mortgageConfig),
      });
    }
  }, [currentStep, draft.mortgagePreferences, mortgageConfig, updateDraft]);

  const goNext = useCallback(async () => {
    setError(null);
    if (stepIndex >= steps.length - 1) {
      const finalDraft = {
        ...draft,
        completedAt: new Date().toISOString(),
      };
      writeMortgageApplicationDraft(finalDraft);
      setIsFinishing(true);

      const result = isEditMode
        ? await updateApplicationFromOnboardingAction(applicationId!, finalDraft)
        : await finalizeOnboardingAction(finalDraft);

      if (result.error) {
        setError(result.error);
        setIsFinishing(false);
        return;
      }

      if (result.needsAccount) {
        router.push(ONBOARDING_ROUTES.createAccount);
        setIsFinishing(false);
        return;
      }

      return;
    }
    setStepIndex((value) => value + 1);
  }, [applicationId, draft, isEditMode, router, stepIndex, steps.length]);

  const goBack = useCallback(() => {
    setError(null);
    if (currentStep === "employment" && employmentPhase === "details") {
      setEmploymentPhase("type");
      return;
    }
    if (stepIndex <= 0) {
      if (isEditMode && applicationId) {
        router.push(`/dashboard/loans/${applicationId}`);
        return;
      }
      router.push("/");
      return;
    }
    setStepIndex((value) => value - 1);
  }, [applicationId, currentStep, employmentPhase, isEditMode, router, stepIndex]);

  const validateStep = (): boolean => {
    switch (currentStep) {
      case "home-found":
        if (draft.homeFound === undefined) {
          setError("Select an option to continue.");
          return false;
        }
        return true;
      case "purchase-timeline":
        if (!draft.purchaseTimeline) {
          setError("Select when you hope to purchase.");
          return false;
        }
        return true;
      case "buying-stage":
        if (!draft.buyingStage) {
          setError("Select where you are in the process.");
          return false;
        }
        return true;
      case "target-location":
        if (!draft.targetLocation?.city || !draft.targetLocation.state || !draft.targetLocation.zip) {
          setError("Enter the city, state, and ZIP for your target area.");
          return false;
        }
        return true;
      case "target-price":
        if (!draft.targetHomePrice || draft.targetHomePrice <= 0) {
          setError("Enter your starting home price.");
          return false;
        }
        return true;
      case "property-use-search":
      case "property-use-found":
        if (!draft.propertyUse) {
          setError("Select how you plan to use the property.");
          return false;
        }
        return true;
      case "mortgage-preferences": {
        const preferences =
          draft.mortgagePreferences ?? createDefaultMortgagePreferences(mortgageConfig);
        const validationError = validateMortgagePreferences(
          preferences,
          resolveHomePriceFromDraft(draft),
          mortgageConfig,
        );
        if (validationError) {
          setError(validationError);
          return false;
        }
        return true;
      }
      case "property-address":
        if (
          !draft.propertyAddress?.street ||
          !draft.propertyAddress.city ||
          !draft.propertyAddress.state ||
          !draft.propertyAddress.zip
        ) {
          setError("Enter the full property address.");
          return false;
        }
        return true;
      case "purchase-price":
        if (!draft.purchasePrice || draft.purchasePrice <= 0) {
          setError("Enter the purchase price.");
          return false;
        }
        return true;
      case "property-type":
        if (!draft.propertyType) {
          setError("Select a property type.");
          return false;
        }
        return true;
      case "about-you":
        if (!draft.firstName || !draft.lastName || !draft.dateOfBirth) {
          setError("Enter your name and date of birth.");
          return false;
        }
        return true;
      case "contact":
        if (!draft.email) {
          setError("Enter your email address.");
          return false;
        }
        if (!draft.phone || !isCompleteUSPhone(draft.phone)) {
          setError("Enter a valid 10-digit phone number: (555) 555-5555.");
          return false;
        }
        return true;
      case "current-address":
        if (
          !draft.address?.street ||
          !draft.address.city ||
          !draft.address.state ||
          !draft.address.zip
        ) {
          setError("Enter your current address.");
          return false;
        }
        return true;
      case "employment":
        if (employmentPhase === "type") {
          if (!draft.employment?.employmentType) {
            setError("Select your employment type to continue.");
            return false;
          }
          return true;
        }
        if (!draft.employment?.annualIncome) {
          setError("Enter your annual income.");
          return false;
        }
        if (isEmployedType(draft.employment.employmentType)) {
          if (
            !draft.employment.employerName?.trim() ||
            !draft.employment.position?.trim()
          ) {
            setError("Enter your employer and position.");
            return false;
          }
        }
        return true;
      case "assets":
        return true;
      case "credit":
        if (!isCompleteSSN(draft.creditProfile?.ssn ?? "")) {
          setError("Enter a valid 9-digit Social Security number.");
          return false;
        }
        if (!draft.creditProfile?.citizenshipStatus) {
          setError("Select your citizenship status.");
          return false;
        }
        if (!draft.creditProfile?.maritalStatus) {
          setError("Select your marital status.");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleContinue = async () => {
    if (!validateStep()) {
      return;
    }

    if (currentStep === "employment" && employmentPhase === "type") {
      setEmploymentPhase("details");
      return;
    }

    if (currentStep === "home-found" && stepIndex === 0) {
      const nextSteps = getSteps(draft, { skipPersonalDetails });
      if (nextSteps.length > 1) {
        setStepIndex(1);
        return;
      }
    }

    await goNext();
  };

  if (!hydrated) {
    return null;
  }

  return (
    <OnboardingShell
      step={stepIndex + 1}
      totalSteps={totalSteps}
      onBack={goBack}
      showBack={stepIndex > 0 || currentStep !== "home-found"}
      stepKey={currentStep}
      showChrome={!isEditMode}
      isLoggedIn={isLoggedIn}
    >
      {error ? (
        <div className="mx-auto mb-6 max-w-xl rounded-xl border border-brand-danger/20 bg-brand-danger/5 px-4 py-3 text-sm text-brand-danger">
          {error}
        </div>
      ) : null}

      {currentStep === "home-found" ? (
        <OnboardingQuestion title="Have you found a home to buy?">
          <div className="space-y-4">
            <OptionCard
              label="Yes"
              selected={draft.homeFound === true}
              onSelect={() => updateDraft({ homeFound: true })}
            />
            <OptionCard
              label="No"
              selected={draft.homeFound === false}
              onSelect={() => updateDraft({ homeFound: false })}
            />
          </div>
        </OnboardingQuestion>
      ) : null}

      {currentStep === "purchase-timeline" ? (
        <OnboardingQuestion title="When do you hope to purchase a home?">
          <div className="space-y-4">
            {TIMELINE_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                selected={draft.purchaseTimeline === option.value}
                onSelect={() => updateDraft({ purchaseTimeline: option.value })}
              />
            ))}
          </div>
        </OnboardingQuestion>
      ) : null}

      {currentStep === "buying-stage" ? (
        <OnboardingQuestion title="Where are you in the home buying process?">
          <div className="space-y-4">
            {STAGE_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                selected={draft.buyingStage === option.value}
                onSelect={() => updateDraft({ buyingStage: option.value })}
              />
            ))}
          </div>
        </OnboardingQuestion>
      ) : null}

      {currentStep === "target-location" ? (
        <OnboardingQuestion title="Where would you like to buy a home?">
          <div className="grid gap-4 sm:grid-cols-2">
            <OnboardingField label="City">
              <input
                className={onboardingInputClassName()}
                value={draft.targetLocation?.city ?? ""}
                onChange={(e) =>
                  updateDraft({
                    targetLocation: {
                      city: e.target.value,
                      state: draft.targetLocation?.state ?? "",
                      zip: draft.targetLocation?.zip ?? "",
                    },
                  })
                }
              />
            </OnboardingField>
            <OnboardingField label="State">
              <OnboardingStateInput
                value={draft.targetLocation?.state ?? ""}
                onChange={(state) =>
                  updateDraft({
                    targetLocation: {
                      city: draft.targetLocation?.city ?? "",
                      state,
                      zip: draft.targetLocation?.zip ?? "",
                    },
                  })
                }
              />
            </OnboardingField>
            <OnboardingField label="ZIP">
              <input
                className={onboardingInputClassName()}
                value={draft.targetLocation?.zip ?? ""}
                onChange={(e) =>
                  updateDraft({
                    targetLocation: {
                      city: draft.targetLocation?.city ?? "",
                      state: draft.targetLocation?.state ?? "",
                      zip: e.target.value,
                    },
                  })
                }
              />
            </OnboardingField>
          </div>
        </OnboardingQuestion>
      ) : null}

      {currentStep === "target-price" ? (
        <OnboardingQuestion
          title="What is your starting home price?"
          subtitle="If you're unsure, enter your estimated budget."
        >
          <OnboardingField label="Estimated home price">
            <input
              type="number"
              min="0"
              className={onboardingInputClassName()}
              value={formatAmountFieldValue(draft.targetHomePrice)}
              onChange={(e) =>
                updateDraft({ targetHomePrice: parseCurrency(e.target.value) })
              }
              placeholder="$350,000"
            />
          </OnboardingField>
        </OnboardingQuestion>
      ) : null}

      {currentStep === "property-use-search" || currentStep === "property-use-found" ? (
        <OnboardingQuestion
          title={
            draft.homeFound
              ? "How do you plan to use this property?"
              : "How do you plan to use your future home?"
          }
        >
          <div className="space-y-4">
            {PROPERTY_USE_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                selected={draft.propertyUse === option.value}
                onSelect={() => updateDraft({ propertyUse: option.value })}
              />
            ))}
          </div>
        </OnboardingQuestion>
      ) : null}

      {currentStep === "mortgage-preferences" ? (
        <OnboardingMortgagePreferencesStep
          draft={draft}
          homePrice={resolveHomePriceFromDraft(draft)}
          mortgageConfig={mortgageConfig}
          onChange={(mortgagePreferences) => updateDraft({ mortgagePreferences })}
        />
      ) : null}

      {currentStep === "property-address" ? (
        <OnboardingQuestion title="Property Address">
          <div className="space-y-4">
            <OnboardingField label="Street">
              <input
                className={onboardingInputClassName()}
                value={draft.propertyAddress?.street ?? ""}
                onChange={(e) =>
                  updateDraft({
                    propertyAddress: {
                      street: e.target.value,
                      city: draft.propertyAddress?.city ?? "",
                      state: draft.propertyAddress?.state ?? "",
                      zip: draft.propertyAddress?.zip ?? "",
                    },
                  })
                }
              />
            </OnboardingField>
            <div className="grid gap-4 sm:grid-cols-3">
              <OnboardingField label="City">
                <input
                  className={onboardingInputClassName()}
                  value={draft.propertyAddress?.city ?? ""}
                  onChange={(e) =>
                    updateDraft({
                      propertyAddress: {
                        street: draft.propertyAddress?.street ?? "",
                        city: e.target.value,
                        state: draft.propertyAddress?.state ?? "",
                        zip: draft.propertyAddress?.zip ?? "",
                      },
                    })
                  }
                />
              </OnboardingField>
              <OnboardingField label="State">
                <OnboardingStateInput
                  value={draft.propertyAddress?.state ?? ""}
                  onChange={(state) =>
                    updateDraft({
                      propertyAddress: {
                        street: draft.propertyAddress?.street ?? "",
                        city: draft.propertyAddress?.city ?? "",
                        state,
                        zip: draft.propertyAddress?.zip ?? "",
                      },
                    })
                  }
                />
              </OnboardingField>
              <OnboardingField label="ZIP">
                <input
                  className={onboardingInputClassName()}
                  value={draft.propertyAddress?.zip ?? ""}
                  onChange={(e) =>
                    updateDraft({
                      propertyAddress: {
                        street: draft.propertyAddress?.street ?? "",
                        city: draft.propertyAddress?.city ?? "",
                        state: draft.propertyAddress?.state ?? "",
                        zip: e.target.value,
                      },
                    })
                  }
                />
              </OnboardingField>
            </div>
          </div>
        </OnboardingQuestion>
      ) : null}

      {currentStep === "purchase-price" ? (
        <OnboardingQuestion title="What is the purchase price?">
          <OnboardingField label="Purchase price">
            <input
              type="number"
              min="0"
              className={onboardingInputClassName()}
              value={formatAmountFieldValue(draft.purchasePrice)}
              onChange={(e) =>
                updateDraft({ purchasePrice: parseCurrency(e.target.value) })
              }
              placeholder="$425,000"
            />
          </OnboardingField>
        </OnboardingQuestion>
      ) : null}

      {currentStep === "property-type" ? (
        <OnboardingQuestion title="What type of property is it?">
          <div className="space-y-4">
            {PROPERTY_TYPE_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                selected={draft.propertyType === option.value}
                onSelect={() => updateDraft({ propertyType: option.value })}
              />
            ))}
          </div>
        </OnboardingQuestion>
      ) : null}

      {currentStep === "about-you" ? (
        <OnboardingQuestion title="About You">
          <div className="grid gap-4 sm:grid-cols-2">
            <OnboardingField label="First Name">
              <input
                className={onboardingInputClassName()}
                value={draft.firstName ?? ""}
                onChange={(e) => updateDraft({ firstName: e.target.value })}
              />
            </OnboardingField>
            <OnboardingField label="Middle Name">
              <input
                className={onboardingInputClassName()}
                value={draft.middleName ?? ""}
                onChange={(e) => updateDraft({ middleName: e.target.value })}
              />
            </OnboardingField>
            <OnboardingField label="Last Name">
              <input
                className={onboardingInputClassName()}
                value={draft.lastName ?? ""}
                onChange={(e) => updateDraft({ lastName: e.target.value })}
              />
            </OnboardingField>
            <OnboardingField label="Date of Birth">
              <input
                type="date"
                className={onboardingInputClassName()}
                value={draft.dateOfBirth ?? ""}
                onChange={(e) => updateDraft({ dateOfBirth: e.target.value })}
              />
            </OnboardingField>
          </div>
        </OnboardingQuestion>
      ) : null}

      {currentStep === "contact" ? (
        <OnboardingQuestion title="Contact Information">
          <div className="space-y-4">
            <OnboardingField label="Email Address">
              <input
                type="email"
                className={onboardingInputClassName()}
                value={draft.email ?? ""}
                onChange={(e) => updateDraft({ email: e.target.value })}
              />
            </OnboardingField>
            <OnboardingField label="Phone Number">
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(555) 555-5555"
                maxLength={14}
                className={onboardingInputClassName()}
                value={formatUSPhoneInput(draft.phone ?? "")}
                onChange={(e) =>
                  updateDraft({ phone: formatUSPhoneInput(e.target.value) })
                }
              />
            </OnboardingField>
          </div>
        </OnboardingQuestion>
      ) : null}

      {currentStep === "current-address" ? (
        <OnboardingQuestion title="Current Address">
          <div className="space-y-4">
            <OnboardingField label="Street Address">
              <input
                className={onboardingInputClassName()}
                value={draft.address?.street ?? ""}
                onChange={(e) =>
                  updateDraft({
                    address: {
                      street: e.target.value,
                      city: draft.address?.city ?? "",
                      state: draft.address?.state ?? "",
                      zip: draft.address?.zip ?? "",
                      yearsAtAddress: draft.address?.yearsAtAddress ?? "",
                    },
                  })
                }
              />
            </OnboardingField>
            <div className="grid gap-4 sm:grid-cols-3">
              <OnboardingField label="City">
                <input
                  className={onboardingInputClassName()}
                  value={draft.address?.city ?? ""}
                  onChange={(e) =>
                    updateDraft({
                      address: {
                        street: draft.address?.street ?? "",
                        city: e.target.value,
                        state: draft.address?.state ?? "",
                        zip: draft.address?.zip ?? "",
                        yearsAtAddress: draft.address?.yearsAtAddress ?? "",
                      },
                    })
                  }
                />
              </OnboardingField>
              <OnboardingField label="State">
                <OnboardingStateInput
                  value={draft.address?.state ?? ""}
                  onChange={(state) =>
                    updateDraft({
                      address: {
                        street: draft.address?.street ?? "",
                        city: draft.address?.city ?? "",
                        state,
                        zip: draft.address?.zip ?? "",
                        yearsAtAddress: draft.address?.yearsAtAddress ?? "",
                      },
                    })
                  }
                />
              </OnboardingField>
              <OnboardingField label="ZIP Code">
                <input
                  className={onboardingInputClassName()}
                  value={draft.address?.zip ?? ""}
                  onChange={(e) =>
                    updateDraft({
                      address: {
                        street: draft.address?.street ?? "",
                        city: draft.address?.city ?? "",
                        state: draft.address?.state ?? "",
                        zip: e.target.value,
                        yearsAtAddress: draft.address?.yearsAtAddress ?? "",
                      },
                    })
                  }
                />
              </OnboardingField>
            </div>
            <OnboardingField label="Years at Current Address">
              <input
                className={onboardingInputClassName()}
                value={draft.address?.yearsAtAddress ?? ""}
                onChange={(e) =>
                  updateDraft({
                    address: {
                      street: draft.address?.street ?? "",
                      city: draft.address?.city ?? "",
                      state: draft.address?.state ?? "",
                      zip: draft.address?.zip ?? "",
                      yearsAtAddress: e.target.value,
                    },
                  })
                }
              />
            </OnboardingField>
          </div>
        </OnboardingQuestion>
      ) : null}

      {currentStep === "employment" && employmentPhase === "type" ? (
        <OnboardingQuestion title="What is your employment type?">
          <div className="space-y-4">
            {EMPLOYMENT_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                selected={draft.employment?.employmentType === option.value}
                onSelect={() =>
                  updateDraft({
                    employment: {
                      employerName: isEmployedType(option.value)
                        ? (draft.employment?.employerName ?? "")
                        : "",
                      employmentType: option.value,
                      position: isEmployedType(option.value)
                        ? (draft.employment?.position ?? "")
                        : "",
                      yearsEmployed: isEmployedType(option.value)
                        ? (draft.employment?.yearsEmployed ?? "")
                        : "",
                      annualIncome: draft.employment?.annualIncome ?? 0,
                    },
                  })
                }
              />
            ))}
          </div>
        </OnboardingQuestion>
      ) : null}

      {currentStep === "employment" && employmentPhase === "details" ? (
        <OnboardingQuestion
          title={
            isEmployedType(draft.employment?.employmentType)
              ? "Tell us about your employment"
              : "What is your annual income?"
          }
          subtitle={
            isEmployedType(draft.employment?.employmentType)
              ? "Share where you work and your role."
              : undefined
          }
        >
          <div className="space-y-4">
            {isEmployedType(draft.employment?.employmentType) ? (
              <>
                <OnboardingField label="Employer Name">
                  <input
                    className={onboardingInputClassName()}
                    value={draft.employment?.employerName ?? ""}
                    onChange={(e) =>
                      updateDraft({
                        employment: {
                          employerName: e.target.value,
                          employmentType: draft.employment!.employmentType,
                          position: draft.employment?.position ?? "",
                          yearsEmployed: draft.employment?.yearsEmployed ?? "",
                          annualIncome: draft.employment?.annualIncome ?? 0,
                        },
                      })
                    }
                  />
                </OnboardingField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <OnboardingField label="Position">
                    <input
                      className={onboardingInputClassName()}
                      value={draft.employment?.position ?? ""}
                      onChange={(e) =>
                        updateDraft({
                          employment: {
                            employerName: draft.employment?.employerName ?? "",
                            employmentType: draft.employment!.employmentType,
                            position: e.target.value,
                            yearsEmployed: draft.employment?.yearsEmployed ?? "",
                            annualIncome: draft.employment?.annualIncome ?? 0,
                          },
                        })
                      }
                    />
                  </OnboardingField>
                  <OnboardingField label="Years Employed">
                    <input
                      className={onboardingInputClassName()}
                      value={draft.employment?.yearsEmployed ?? ""}
                      onChange={(e) =>
                        updateDraft({
                          employment: {
                            employerName: draft.employment?.employerName ?? "",
                            employmentType: draft.employment!.employmentType,
                            position: draft.employment?.position ?? "",
                            yearsEmployed: e.target.value,
                            annualIncome: draft.employment?.annualIncome ?? 0,
                          },
                        })
                      }
                    />
                  </OnboardingField>
                </div>
              </>
            ) : null}
            <OnboardingField label="Annual Income">
              <input
                type="number"
                min="0"
                className={onboardingInputClassName()}
                value={formatAmountFieldValue(draft.employment?.annualIncome)}
                onChange={(e) =>
                  updateDraft({
                    employment: {
                      employerName: draft.employment?.employerName ?? "",
                      employmentType: draft.employment!.employmentType,
                      position: draft.employment?.position ?? "",
                      yearsEmployed: draft.employment?.yearsEmployed ?? "",
                      annualIncome: parseCurrency(e.target.value),
                    },
                  })
                }
                placeholder="$85,000"
              />
            </OnboardingField>
          </div>
        </OnboardingQuestion>
      ) : null}

      {currentStep === "assets" ? (
        <OnboardingQuestion title="Assets">
          <div className="space-y-4">
            <OnboardingField label="Checking Balance">
              <input
                type="number"
                min="0"
                className={onboardingInputClassName()}
                value={formatZeroAllowedAmountFieldValue(draft.assets?.checkingBalance)}
                onChange={(e) =>
                  updateDraft({
                    assets: buildAssetUpdate(draft, {
                      checkingBalance: parseCurrency(e.target.value),
                    }),
                  })
                }
                placeholder="$5,000"
              />
            </OnboardingField>
            <OnboardingField label="Savings Balance">
              <input
                type="number"
                min="0"
                className={onboardingInputClassName()}
                value={formatZeroAllowedAmountFieldValue(draft.assets?.savingsBalance)}
                onChange={(e) =>
                  updateDraft({
                    assets: buildAssetUpdate(draft, {
                      savingsBalance: parseCurrency(e.target.value),
                    }),
                  })
                }
                placeholder="$12,000"
              />
            </OnboardingField>
            <OnboardingField label="Investment Balance">
              <input
                type="number"
                min="0"
                className={onboardingInputClassName()}
                value={formatZeroAllowedAmountFieldValue(draft.assets?.investmentBalance)}
                onChange={(e) =>
                  updateDraft({
                    assets: buildAssetUpdate(draft, {
                      investmentBalance: parseCurrency(e.target.value),
                    }),
                  })
                }
                placeholder="$25,000"
              />
            </OnboardingField>
          </div>
        </OnboardingQuestion>
      ) : null}

      {currentStep === "credit" ? (
        <OnboardingQuestion title="Credit Profile">
          <div className="space-y-6">
            <OnboardingField label="SSN">
              <input
                className={onboardingInputClassName()}
                value={draft.creditProfile?.ssn ?? ""}
                inputMode="numeric"
                autoComplete="off"
                maxLength={11}
                onChange={(e) =>
                  updateDraft({
                    creditProfile: {
                      ssn: formatSSNInput(e.target.value),
                      citizenshipStatus: draft.creditProfile?.citizenshipStatus ?? "",
                      maritalStatus: draft.creditProfile?.maritalStatus ?? "",
                    },
                  })
                }
                placeholder="XXX-XX-XXXX"
              />
            </OnboardingField>

            <OnboardingField label="Citizenship Status">
              <div className="space-y-4">
                {CITIZENSHIP_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={draft.creditProfile?.citizenshipStatus === option.value}
                    onSelect={() =>
                      updateDraft({
                        creditProfile: {
                          ssn: draft.creditProfile?.ssn ?? "",
                          citizenshipStatus: option.value,
                          maritalStatus: draft.creditProfile?.maritalStatus ?? "",
                        },
                      })
                    }
                  />
                ))}
              </div>
            </OnboardingField>

            <OnboardingField label="Marital Status">
              <div className="space-y-4">
                {MARITAL_STATUS_OPTIONS.map((option) => (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={draft.creditProfile?.maritalStatus === option.value}
                    onSelect={() =>
                      updateDraft({
                        creditProfile: {
                          ssn: draft.creditProfile?.ssn ?? "",
                          citizenshipStatus: draft.creditProfile?.citizenshipStatus ?? "",
                          maritalStatus: option.value,
                        },
                      })
                    }
                  />
                ))}
              </div>
            </OnboardingField>
          </div>
        </OnboardingQuestion>
      ) : null}

      <div className="mx-auto mt-12 flex max-w-2xl justify-end">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={isFinishing}
          className="h-14 gap-2 rounded-xl bg-brand-blue px-8 text-base font-semibold text-white hover:bg-brand-blue/90 md:text-lg"
        >
          {isFinishing
            ? "Saving..."
            : stepIndex >= steps.length - 1
              ? isEditMode
                ? "Save Application"
                : isLoggedIn
                  ? "View My Pre-Qualification"
                  : "Continue to Account"
              : currentStep === "employment" && employmentPhase === "type"
                ? "Continue"
                : "Continue"}
          <ArrowRight className="size-5" />
        </Button>
      </div>
    </OnboardingShell>
  );
}
