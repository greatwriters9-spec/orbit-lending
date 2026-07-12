"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Check, Pencil } from "lucide-react";

import {
  ApplicationField,
  ApplicationNavButtons,
  ApplicationSection,
  ApplicationShell,
  applicationInputClassName,
} from "@/components/mortgage-application/application-shell";
import { OptionCard } from "@/components/onboarding/onboarding-shell";
import { useCompany } from "@/components/providers/company-provider";
import { OnboardingStateInput } from "@/components/onboarding/onboarding-state-input";
import {
  formatSSNInput,
  formatUSPhoneInput,
  formatZipCodeInput,
  isCompleteSSN,
  isCompleteUSPhone,
} from "@/lib/auth/input-formatters";
import {
  saveMortgageApplicationAction,
  submitMortgageApplicationAction,
} from "@/lib/mortgage-application/actions";
import { generateDocumentChecklist } from "@/lib/mortgage-application/document-checklist";
import {
  getNextSection,
  getPreviousSection,
  markSectionComplete,
} from "@/lib/mortgage-application/progress";
import { formatCurrency } from "@/lib/loans/queries";
import {
  APPLICATION_SECTION_LABELS,
  APPLICATION_SECTIONS,
  type ApplicationSectionKey,
  type FullMortgageApplication,
} from "@/types/mortgage-full-application";

function parseCurrency(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function formatCurrencyInput(value: number): string {
  if (!value) return "";
  return value.toLocaleString("en-US");
}

function yearsAtAddress(moveInDate: string): number {
  if (!moveInDate) return 0;
  const moved = new Date(moveInDate);
  if (Number.isNaN(moved.getTime())) return 0;
  const diff = Date.now() - moved.getTime();
  return diff / (1000 * 60 * 60 * 24 * 365.25);
}

function yearsEmployed(startDate: string): number {
  return yearsAtAddress(startDate);
}

function sumIncome(income: FullMortgageApplication["income"]): number {
  const fields: (keyof FullMortgageApplication["income"])[] = [
    "baseSalary",
    "overtime",
    "bonus",
    "commission",
    "selfEmployment",
    "rental",
    "retirement",
    "socialSecurity",
    "other",
  ];
  let total = 0;
  for (const key of income.selectedSources) {
    if (fields.includes(key as (typeof fields)[number])) {
      total += Number(income[key as (typeof fields)[number]] ?? 0);
    }
  }
  return total;
}

function sumLiabilities(liabilities: FullMortgageApplication["liabilities"]): number {
  const sumItems = (items: { monthlyPayment: number }[]) =>
    items.reduce((sum, item) => sum + item.monthlyPayment, 0);
  return (
    sumItems(liabilities.creditCards) +
    sumItems(liabilities.studentLoans) +
    sumItems(liabilities.autoLoans) +
    sumItems(liabilities.personalLoans) +
    liabilities.childSupport +
    liabilities.alimony +
    liabilities.otherMonthly
  );
}

function sumAssets(assets: FullMortgageApplication["assets"]): number {
  return (
    assets.checking +
    assets.savings +
    assets.investments +
    assets.retirement +
    assets.cash +
    assets.giftFunds +
    assets.other
  );
}

const INCOME_SOURCE_OPTIONS = [
  { key: "baseSalary", label: "Base Salary" },
  { key: "overtime", label: "Overtime" },
  { key: "bonus", label: "Bonus" },
  { key: "commission", label: "Commission" },
  { key: "selfEmployment", label: "Self-Employment Income" },
  { key: "rental", label: "Rental Income" },
  { key: "retirement", label: "Retirement Income" },
  { key: "socialSecurity", label: "Social Security" },
  { key: "other", label: "Other Income" },
] as const;

type MortgageApplicationWizardProps = {
  applicationId: string;
  initialApplication: FullMortgageApplication;
  initialSection?: ApplicationSectionKey;
};

export function MortgageApplicationWizard({
  applicationId,
  initialApplication,
  initialSection,
}: MortgageApplicationWizardProps) {
  const { company } = useCompany();
  const [application, setApplication] = useState(initialApplication);
  const [section, setSection] = useState<ApplicationSectionKey>(
    initialSection ?? initialApplication.progress.currentSection ?? "personal",
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const patch = useCallback(
    (patchFn: (current: FullMortgageApplication) => FullMortgageApplication) => {
      setApplication((current) => patchFn(current));
    },
    [],
  );

  const persist = useCallback(
    async (nextSection?: ApplicationSectionKey, markComplete = true) => {
      setSaveState("saving");
      setError(null);

      const updatedProgress = markComplete
        ? markSectionComplete(application.progress, section)
        : application.progress;

      const payload: FullMortgageApplication = {
        ...application,
        progress: {
          ...updatedProgress,
          currentSection: nextSection ?? section,
          lastSavedAt: new Date().toISOString(),
        },
        documentChecklist:
          application.documentChecklist.length > 0
            ? application.documentChecklist
            : generateDocumentChecklist(application),
      };

      const result = await saveMortgageApplicationAction(
        applicationId,
        payload,
        markComplete ? section : undefined,
      );

      if (result.error) {
        setSaveState("error");
        setError(result.error);
        return false;
      }

      setApplication(payload);
      setSaveState("saved");
      return true;
    },
    [application, applicationId, section],
  );

  const goToSection = (target: ApplicationSectionKey) => {
    setSection(target);
    patch((current) => ({
      ...current,
      progress: { ...current.progress, currentSection: target },
    }));
  };

  const handleContinue = () => {
    if (!canContinue) return;

    startTransition(async () => {
      const next = getNextSection(section);

      if (section === "consent") {
        setSaveState("saving");
        setError(null);

        const finalApplication: FullMortgageApplication = {
          ...application,
          documentChecklist:
            application.documentChecklist.length > 0
              ? application.documentChecklist
              : generateDocumentChecklist(application),
        };

        const result = await submitMortgageApplicationAction(
          applicationId,
          finalApplication,
        );

        if (result?.error) {
          setSaveState("error");
          setError(result.error);
        }

        return;
      }

      const saved = await persist(next ?? section, section !== "review");
      if (!saved) return;

      if (next) {
        setSection(next);
      }
    });
  };

  const handlePrevious = () => {
    const prev = getPreviousSection(section);
    if (prev) {
      goToSection(prev);
    }
  };

  const canContinue = useMemo(() => {
    switch (section) {
      case "personal":
        return (
          Boolean(application.personal.firstName.trim()) &&
          Boolean(application.personal.lastName.trim()) &&
          Boolean(application.personal.dateOfBirth) &&
          isCompleteSSN(application.personal.ssn) &&
          Boolean(application.personal.citizenship) &&
          Boolean(application.personal.maritalStatus) &&
          isCompleteUSPhone(application.personal.phone) &&
          Boolean(application.personal.email.trim())
        );
      case "residence": {
        const current = application.residence.current;
        const needsPrevious = yearsAtAddress(current.moveInDate) < 2;
        return (
          Boolean(current.street && current.city && current.state && current.zip) &&
          Boolean(current.moveInDate) &&
          (!needsPrevious || application.residence.previousAddresses.length > 0)
        );
      }
      case "employment": {
        const emp = application.employment.current;
        if (emp.isSelfEmployed) {
          return Boolean(emp.businessName && emp.yearsInBusiness);
        }
        const needsPrevious = yearsEmployed(emp.startDate) < 2;
        return (
          Boolean(emp.employmentStatus && emp.employerName && emp.jobTitle && emp.startDate) &&
          (!needsPrevious || application.employment.previousEmployments.length > 0)
        );
      }
      case "income":
        return application.income.selectedSources.length > 0 && sumIncome(application.income) > 0;
      case "assets":
        return true;
      case "liabilities":
        return true;
      case "property":
        if (!application.property.hasProperty) return true;
        return Boolean(
          application.property.street &&
            application.property.city &&
            application.property.state &&
            application.property.purchasePrice > 0,
        );
      case "loan-details":
        return (
          application.loanDetails.desiredLoanAmount > 0 &&
          application.loanDetails.desiredDownPayment >= 0
        );
      case "declarations":
        return true;
      case "documents":
        return true;
      case "review":
        return true;
      case "consent":
        return Object.entries(application.consents)
          .filter(([key]) => key !== "acknowledgedAt")
          .every(([, value]) => value === true);
      default:
        return false;
    }
  }, [application, section]);

  const continueLabel =
    section === "consent"
      ? "Submit Application"
      : section === "review"
        ? "Continue to Consent"
        : "Continue";

  return (
    <ApplicationShell
      progress={application.progress}
      onBack={section !== "personal" ? handlePrevious : undefined}
      showBack={section !== "personal"}
      saveState={saveState}
    >
      {error ? (
        <p className="mb-6 rounded-xl border border-brand-danger/20 bg-brand-danger/5 px-4 py-3 text-sm text-brand-danger">
          {error}
        </p>
      ) : null}

      {section === "personal" ? (
        <ApplicationSection
          subtitle="Section 1"
          title="Personal Information"
          explanation="We use this information to verify your identity and prepare your mortgage application."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <ApplicationField label="Legal First Name">
              <input
                className={applicationInputClassName}
                value={application.personal.firstName}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    personal: { ...c.personal, firstName: e.target.value },
                  }))
                }
              />
            </ApplicationField>
            <ApplicationField label="Middle Name (optional)">
              <input
                className={applicationInputClassName}
                value={application.personal.middleName}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    personal: { ...c.personal, middleName: e.target.value },
                  }))
                }
              />
            </ApplicationField>
            <ApplicationField label="Last Name">
              <input
                className={applicationInputClassName}
                value={application.personal.lastName}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    personal: { ...c.personal, lastName: e.target.value },
                  }))
                }
              />
            </ApplicationField>
            <ApplicationField label="Date of Birth">
              <input
                type="date"
                className={applicationInputClassName}
                value={application.personal.dateOfBirth}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    personal: { ...c.personal, dateOfBirth: e.target.value },
                  }))
                }
              />
            </ApplicationField>
            <ApplicationField label="Social Security Number">
              <input
                className={applicationInputClassName}
                inputMode="numeric"
                placeholder="000-00-0000"
                value={application.personal.ssn}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    personal: { ...c.personal, ssn: formatSSNInput(e.target.value) },
                  }))
                }
              />
            </ApplicationField>
            <ApplicationField label="Citizenship">
              <select
                className={applicationInputClassName}
                value={application.personal.citizenship}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    personal: { ...c.personal, citizenship: e.target.value },
                  }))
                }
              >
                <option value="">Select</option>
                <option value="us_citizen">U.S. Citizen</option>
                <option value="permanent_resident">Permanent Resident</option>
                <option value="non_permanent">Non-Permanent Resident</option>
              </select>
            </ApplicationField>
            <ApplicationField label="Marital Status">
              <select
                className={applicationInputClassName}
                value={application.personal.maritalStatus}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    personal: { ...c.personal, maritalStatus: e.target.value },
                  }))
                }
              >
                <option value="">Select</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="separated">Separated</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </ApplicationField>
            <ApplicationField label="Phone Number">
              <input
                className={applicationInputClassName}
                value={application.personal.phone}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    personal: { ...c.personal, phone: formatUSPhoneInput(e.target.value) },
                  }))
                }
              />
            </ApplicationField>
            <ApplicationField label="Email Address">
              <input
                type="email"
                className={applicationInputClassName}
                value={application.personal.email}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    personal: { ...c.personal, email: e.target.value },
                  }))
                }
              />
            </ApplicationField>
          </div>
        </ApplicationSection>
      ) : null}

      {section === "residence" ? (
        <ApplicationSection
          subtitle="Section 2"
          title="Residence History"
          explanation="We need your current and recent address history to verify stability and calculate housing expenses."
        >
          <div className="space-y-5">
            <ApplicationField label="Current Street Address">
              <input
                className={applicationInputClassName}
                value={application.residence.current.street}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    residence: {
                      ...c.residence,
                      current: { ...c.residence.current, street: e.target.value },
                    },
                  }))
                }
              />
            </ApplicationField>
            <div className="grid gap-5 md:grid-cols-3">
              <ApplicationField label="City">
                <input
                  className={applicationInputClassName}
                  value={application.residence.current.city}
                  onChange={(e) =>
                    patch((c) => ({
                      ...c,
                      residence: {
                        ...c.residence,
                        current: { ...c.residence.current, city: e.target.value },
                      },
                    }))
                  }
                />
              </ApplicationField>
              <ApplicationField label="State">
                <OnboardingStateInput
                  value={application.residence.current.state}
                  onChange={(state) =>
                    patch((c) => ({
                      ...c,
                      residence: {
                        ...c.residence,
                        current: { ...c.residence.current, state },
                      },
                    }))
                  }
                />
              </ApplicationField>
              <ApplicationField label="ZIP Code">
                <input
                  className={applicationInputClassName}
                  value={application.residence.current.zip}
                  onChange={(e) =>
                    patch((c) => ({
                      ...c,
                      residence: {
                        ...c.residence,
                        current: {
                          ...c.residence.current,
                          zip: formatZipCodeInput(e.target.value),
                        },
                      },
                    }))
                  }
                />
              </ApplicationField>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <ApplicationField label="Move-in Date">
                <input
                  type="date"
                  className={applicationInputClassName}
                  value={application.residence.current.moveInDate}
                  onChange={(e) =>
                    patch((c) => ({
                      ...c,
                      residence: {
                        ...c.residence,
                        current: { ...c.residence.current, moveInDate: e.target.value },
                      },
                    }))
                  }
                />
              </ApplicationField>
              <ApplicationField label="Housing Status">
                <select
                  className={applicationInputClassName}
                  value={application.residence.current.housingStatus}
                  onChange={(e) =>
                    patch((c) => ({
                      ...c,
                      residence: {
                        ...c.residence,
                        current: {
                          ...c.residence.current,
                          housingStatus: e.target.value as "own" | "rent" | "other",
                        },
                      },
                    }))
                  }
                >
                  <option value="own">Own</option>
                  <option value="rent">Rent</option>
                  <option value="other">Other</option>
                </select>
              </ApplicationField>
            </div>
            <ApplicationField label="Monthly Housing Payment">
              <input
                inputMode="numeric"
                className={applicationInputClassName}
                value={formatCurrencyInput(application.residence.current.monthlyPayment)}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    residence: {
                      ...c.residence,
                      current: {
                        ...c.residence.current,
                        monthlyPayment: parseCurrency(e.target.value),
                      },
                    },
                  }))
                }
              />
            </ApplicationField>

            {yearsAtAddress(application.residence.current.moveInDate) < 2 ? (
              <div className="rounded-xl border border-brand-border bg-brand-background/40 p-4">
                <p className="text-sm font-semibold text-brand-navy">
                  Previous Address Required
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Because you&apos;ve lived at your current address for less than two
                  years, we need your previous address history.
                </p>
                <div className="mt-4 space-y-4">
                  {(application.residence.previousAddresses[0] ?? {
                    street: "",
                    city: "",
                    state: "",
                    zip: "",
                    moveInDate: "",
                    housingStatus: "rent" as const,
                    monthlyPayment: 0,
                  }) && (
                    <>
                      <ApplicationField label="Previous Street Address">
                        <input
                          className={applicationInputClassName}
                          value={application.residence.previousAddresses[0]?.street ?? ""}
                          onChange={(e) =>
                            patch((c) => {
                              const prev = c.residence.previousAddresses[0] ?? {
                                street: "",
                                city: "",
                                state: "",
                                zip: "",
                                moveInDate: "",
                                housingStatus: "rent" as const,
                                monthlyPayment: 0,
                              };
                              return {
                                ...c,
                                residence: {
                                  ...c.residence,
                                  previousAddresses: [{ ...prev, street: e.target.value }],
                                },
                              };
                            })
                          }
                        />
                      </ApplicationField>
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </ApplicationSection>
      ) : null}

      {section === "employment" ? (
        <ApplicationSection
          subtitle="Section 3"
          title="Employment"
          explanation="Employment history helps us verify income stability and determine your eligibility."
        >
          <div className="space-y-5">
            <ApplicationField label="Employment Status">
              <select
                className={applicationInputClassName}
                value={application.employment.current.employmentStatus}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    employment: {
                      ...c.employment,
                      current: { ...c.employment.current, employmentStatus: e.target.value },
                    },
                  }))
                }
              >
                <option value="">Select</option>
                <option value="employed">Employed</option>
                <option value="self_employed">Self-employed</option>
                <option value="retired">Retired</option>
                <option value="military">Military</option>
                <option value="other">Other</option>
              </select>
            </ApplicationField>

            <label className="flex items-center gap-3 text-sm font-medium text-brand-navy">
              <input
                type="checkbox"
                checked={application.employment.current.isSelfEmployed}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    employment: {
                      ...c.employment,
                      current: {
                        ...c.employment.current,
                        isSelfEmployed: e.target.checked,
                      },
                    },
                  }))
                }
              />
              I am self-employed
            </label>

            {application.employment.current.isSelfEmployed ? (
              <>
                <ApplicationField label="Business Name">
                  <input
                    className={applicationInputClassName}
                    value={application.employment.current.businessName}
                    onChange={(e) =>
                      patch((c) => ({
                        ...c,
                        employment: {
                          ...c.employment,
                          current: {
                            ...c.employment.current,
                            businessName: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </ApplicationField>
                <ApplicationField label="Years in Business">
                  <input
                    className={applicationInputClassName}
                    value={application.employment.current.yearsInBusiness}
                    onChange={(e) =>
                      patch((c) => ({
                        ...c,
                        employment: {
                          ...c.employment,
                          current: {
                            ...c.employment.current,
                            yearsInBusiness: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </ApplicationField>
              </>
            ) : (
              <>
                <ApplicationField label="Employer Name">
                  <input
                    className={applicationInputClassName}
                    value={application.employment.current.employerName}
                    onChange={(e) =>
                      patch((c) => ({
                        ...c,
                        employment: {
                          ...c.employment,
                          current: {
                            ...c.employment.current,
                            employerName: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </ApplicationField>
                <ApplicationField label="Job Title">
                  <input
                    className={applicationInputClassName}
                    value={application.employment.current.jobTitle}
                    onChange={(e) =>
                      patch((c) => ({
                        ...c,
                        employment: {
                          ...c.employment,
                          current: { ...c.employment.current, jobTitle: e.target.value },
                        },
                      }))
                    }
                  />
                </ApplicationField>
                <ApplicationField label="Start Date">
                  <input
                    type="date"
                    className={applicationInputClassName}
                    value={application.employment.current.startDate}
                    onChange={(e) =>
                      patch((c) => ({
                        ...c,
                        employment: {
                          ...c.employment,
                          current: { ...c.employment.current, startDate: e.target.value },
                        },
                      }))
                    }
                  />
                </ApplicationField>
                <ApplicationField label="Employer Phone">
                  <input
                    className={applicationInputClassName}
                    value={application.employment.current.employerPhone}
                    onChange={(e) =>
                      patch((c) => ({
                        ...c,
                        employment: {
                          ...c.employment,
                          current: {
                            ...c.employment.current,
                            employerPhone: formatUSPhoneInput(e.target.value),
                          },
                        },
                      }))
                    }
                  />
                </ApplicationField>
                <ApplicationField label="Employer Street Address">
                  <input
                    className={applicationInputClassName}
                    value={application.employment.current.employerStreet}
                    onChange={(e) =>
                      patch((c) => ({
                        ...c,
                        employment: {
                          ...c.employment,
                          current: {
                            ...c.employment.current,
                            employerStreet: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </ApplicationField>
                <div className="grid gap-5 md:grid-cols-3">
                  <ApplicationField label="City">
                    <input
                      className={applicationInputClassName}
                      value={application.employment.current.employerCity}
                      onChange={(e) =>
                        patch((c) => ({
                          ...c,
                          employment: {
                            ...c.employment,
                            current: {
                              ...c.employment.current,
                              employerCity: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </ApplicationField>
                  <ApplicationField label="State">
                    <OnboardingStateInput
                      value={application.employment.current.employerState}
                      onChange={(state) =>
                        patch((c) => ({
                          ...c,
                          employment: {
                            ...c.employment,
                            current: {
                              ...c.employment.current,
                              employerState: state,
                            },
                          },
                        }))
                      }
                    />
                  </ApplicationField>
                  <ApplicationField label="ZIP">
                    <input
                      className={applicationInputClassName}
                      value={application.employment.current.employerZip}
                      onChange={(e) =>
                        patch((c) => ({
                          ...c,
                          employment: {
                            ...c.employment,
                            current: {
                              ...c.employment.current,
                              employerZip: formatZipCodeInput(e.target.value),
                            },
                          },
                        }))
                      }
                    />
                  </ApplicationField>
                </div>
                {yearsEmployed(application.employment.current.startDate) < 2 ? (
                  <div className="rounded-xl border border-brand-border bg-brand-background/40 p-4">
                    <p className="text-sm font-semibold text-brand-navy">
                      Previous Employment Required
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Because you&apos;ve been with your current employer for less than
                      two years, please provide your previous employment.
                    </p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <ApplicationField label="Previous Employer">
                        <input
                          className={applicationInputClassName}
                          value={
                            application.employment.previousEmployments[0]?.employerName ?? ""
                          }
                          onChange={(e) =>
                            patch((c) => {
                              const prev = c.employment.previousEmployments[0] ?? {
                                employerName: "",
                                jobTitle: "",
                                startDate: "",
                                endDate: "",
                              };
                              return {
                                ...c,
                                employment: {
                                  ...c.employment,
                                  previousEmployments: [
                                    { ...prev, employerName: e.target.value },
                                  ],
                                },
                              };
                            })
                          }
                        />
                      </ApplicationField>
                      <ApplicationField label="Previous Job Title">
                        <input
                          className={applicationInputClassName}
                          value={
                            application.employment.previousEmployments[0]?.jobTitle ?? ""
                          }
                          onChange={(e) =>
                            patch((c) => {
                              const prev = c.employment.previousEmployments[0] ?? {
                                employerName: "",
                                jobTitle: "",
                                startDate: "",
                                endDate: "",
                              };
                              return {
                                ...c,
                                employment: {
                                  ...c.employment,
                                  previousEmployments: [
                                    { ...prev, jobTitle: e.target.value },
                                  ],
                                },
                              };
                            })
                          }
                        />
                      </ApplicationField>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </ApplicationSection>
      ) : null}

      {section === "income" ? (
        <ApplicationSection
          subtitle="Section 4"
          title="Income"
          explanation="Tell us about all income sources that should be considered for your mortgage."
        >
          <div className="space-y-5">
            <p className="text-sm font-semibold text-brand-navy">Income Sources</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {INCOME_SOURCE_OPTIONS.map((option) => (
                <OptionCard
                  key={option.key}
                  label={option.label}
                  selected={application.income.selectedSources.includes(option.key)}
                  onSelect={() =>
                    patch((c) => {
                      const selected = c.income.selectedSources.includes(option.key)
                        ? c.income.selectedSources.filter((s) => s !== option.key)
                        : [...c.income.selectedSources, option.key];
                      return {
                        ...c,
                        income: { ...c.income, selectedSources: selected },
                      };
                    })
                  }
                />
              ))}
            </div>
            {application.income.selectedSources.map((sourceKey) => {
              const label =
                INCOME_SOURCE_OPTIONS.find((o) => o.key === sourceKey)?.label ?? sourceKey;
              return (
                <ApplicationField key={sourceKey} label={`Annual ${label}`}>
                  <input
                    inputMode="numeric"
                    className={applicationInputClassName}
                    value={formatCurrencyInput(
                      Number(application.income[sourceKey as keyof typeof application.income] ?? 0),
                    )}
                    onChange={(e) =>
                      patch((c) => ({
                        ...c,
                        income: {
                          ...c.income,
                          [sourceKey]: parseCurrency(e.target.value),
                        },
                      }))
                    }
                  />
                </ApplicationField>
              );
            })}
            <p className="text-sm font-semibold text-brand-navy">
              Total Annual Income: {formatCurrency(sumIncome(application.income))}
            </p>
          </div>
        </ApplicationSection>
      ) : null}

      {section === "assets" ? (
        <ApplicationSection subtitle="Section 5" title="Assets">
          <div className="grid gap-5 md:grid-cols-2">
            {(
              [
                ["checking", "Checking Accounts"],
                ["savings", "Savings Accounts"],
                ["investments", "Investment Accounts"],
                ["retirement", "Retirement Accounts"],
                ["cash", "Cash Available"],
                ["giftFunds", "Gift Funds"],
                ["other", "Other Assets"],
              ] as const
            ).map(([key, label]) => (
              <ApplicationField key={key} label={label}>
                <input
                  inputMode="numeric"
                  className={applicationInputClassName}
                  value={formatCurrencyInput(application.assets[key])}
                  onChange={(e) =>
                    patch((c) => ({
                      ...c,
                      assets: { ...c.assets, [key]: parseCurrency(e.target.value) },
                    }))
                  }
                />
              </ApplicationField>
            ))}
          </div>
          <p className="mt-6 text-sm font-semibold text-brand-navy">
            Estimated Available Funds: {formatCurrency(sumAssets(application.assets))}
          </p>
        </ApplicationSection>
      ) : null}

      {section === "liabilities" ? (
        <ApplicationSection subtitle="Section 6" title="Debts & Liabilities">
          <div className="grid gap-5 md:grid-cols-2">
            <ApplicationField label="Child Support (monthly)">
              <input
                inputMode="numeric"
                className={applicationInputClassName}
                value={formatCurrencyInput(application.liabilities.childSupport)}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    liabilities: {
                      ...c.liabilities,
                      childSupport: parseCurrency(e.target.value),
                    },
                  }))
                }
              />
            </ApplicationField>
            <ApplicationField label="Alimony (monthly)">
              <input
                inputMode="numeric"
                className={applicationInputClassName}
                value={formatCurrencyInput(application.liabilities.alimony)}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    liabilities: {
                      ...c.liabilities,
                      alimony: parseCurrency(e.target.value),
                    },
                  }))
                }
              />
            </ApplicationField>
            <ApplicationField label="Credit Cards (total monthly payment)">
              <input
                inputMode="numeric"
                className={applicationInputClassName}
                value={formatCurrencyInput(
                  application.liabilities.creditCards[0]?.monthlyPayment ?? 0,
                )}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    liabilities: {
                      ...c.liabilities,
                      creditCards: [
                        {
                          type: "credit_card",
                          creditor: "Combined",
                          monthlyPayment: parseCurrency(e.target.value),
                          balance: 0,
                        },
                      ],
                    },
                  }))
                }
              />
            </ApplicationField>
            <ApplicationField label="Student Loans (monthly)">
              <input
                inputMode="numeric"
                className={applicationInputClassName}
                value={formatCurrencyInput(
                  application.liabilities.studentLoans[0]?.monthlyPayment ?? 0,
                )}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    liabilities: {
                      ...c.liabilities,
                      studentLoans: [
                        {
                          type: "student",
                          creditor: "Combined",
                          monthlyPayment: parseCurrency(e.target.value),
                          balance: 0,
                        },
                      ],
                    },
                  }))
                }
              />
            </ApplicationField>
            <ApplicationField label="Auto Loans (monthly)">
              <input
                inputMode="numeric"
                className={applicationInputClassName}
                value={formatCurrencyInput(
                  application.liabilities.autoLoans[0]?.monthlyPayment ?? 0,
                )}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    liabilities: {
                      ...c.liabilities,
                      autoLoans: [
                        {
                          type: "auto",
                          creditor: "Combined",
                          monthlyPayment: parseCurrency(e.target.value),
                          balance: 0,
                        },
                      ],
                    },
                  }))
                }
              />
            </ApplicationField>
            <ApplicationField label="Other Monthly Obligations">
              <input
                inputMode="numeric"
                className={applicationInputClassName}
                value={formatCurrencyInput(application.liabilities.otherMonthly)}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    liabilities: {
                      ...c.liabilities,
                      otherMonthly: parseCurrency(e.target.value),
                    },
                  }))
                }
              />
            </ApplicationField>
          </div>
          <p className="mt-6 text-sm font-semibold text-brand-navy">
            Total Monthly Liabilities:{" "}
            {formatCurrency(sumLiabilities(application.liabilities))}
          </p>
        </ApplicationSection>
      ) : null}

      {section === "property" ? (
        <ApplicationSection
          subtitle="Section 7"
          title="Property Information"
          explanation={
            application.property.hasProperty
              ? "Review and update the property details from your pre-qualification."
              : undefined
          }
        >
          {!application.property.hasProperty ? (
            <p className="text-base leading-relaxed text-muted-foreground">
              No problem. We&apos;ll continue with your application, and you can add
              property details later.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              <ApplicationField label="Property Street">
                <input
                  className={applicationInputClassName}
                  value={application.property.street}
                  onChange={(e) =>
                    patch((c) => ({
                      ...c,
                      property: { ...c.property, street: e.target.value },
                    }))
                  }
                />
              </ApplicationField>
              <ApplicationField label="City">
                <input
                  className={applicationInputClassName}
                  value={application.property.city}
                  onChange={(e) =>
                    patch((c) => ({
                      ...c,
                      property: { ...c.property, city: e.target.value },
                    }))
                  }
                />
              </ApplicationField>
              <ApplicationField label="State">
                <OnboardingStateInput
                  value={application.property.state}
                  onChange={(state) =>
                    patch((c) => ({
                      ...c,
                      property: { ...c.property, state },
                    }))
                  }
                />
              </ApplicationField>
              <ApplicationField label="Purchase Price">
                <input
                  inputMode="numeric"
                  className={applicationInputClassName}
                  value={formatCurrencyInput(application.property.purchasePrice)}
                  onChange={(e) =>
                    patch((c) => ({
                      ...c,
                      property: {
                        ...c.property,
                        purchasePrice: parseCurrency(e.target.value),
                      },
                    }))
                  }
                />
              </ApplicationField>
              <ApplicationField label="Property Type">
                <select
                  className={applicationInputClassName}
                  value={application.property.propertyType}
                  onChange={(e) =>
                    patch((c) => ({
                      ...c,
                      property: { ...c.property, propertyType: e.target.value },
                    }))
                  }
                >
                  <option value="single_family">Single Family</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="multi_family">Multi-Family</option>
                </select>
              </ApplicationField>
              <ApplicationField label="Occupancy">
                <select
                  className={applicationInputClassName}
                  value={application.property.occupancy}
                  onChange={(e) =>
                    patch((c) => ({
                      ...c,
                      property: { ...c.property, occupancy: e.target.value },
                    }))
                  }
                >
                  <option value="primary_residence">Primary Residence</option>
                  <option value="vacation_home">Second Home</option>
                  <option value="investment_property">Investment Property</option>
                </select>
              </ApplicationField>
            </div>
          )}
        </ApplicationSection>
      ) : null}

      {section === "loan-details" ? (
        <ApplicationSection subtitle="Section 8" title="Loan Details">
          <div className="grid gap-5 md:grid-cols-2">
            <ApplicationField label="Desired Loan Amount">
              <input
                inputMode="numeric"
                className={applicationInputClassName}
                value={formatCurrencyInput(application.loanDetails.desiredLoanAmount)}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    loanDetails: {
                      ...c.loanDetails,
                      desiredLoanAmount: parseCurrency(e.target.value),
                    },
                  }))
                }
              />
            </ApplicationField>
            <ApplicationField label="Desired Down Payment">
              <input
                inputMode="numeric"
                className={applicationInputClassName}
                value={formatCurrencyInput(application.loanDetails.desiredDownPayment)}
                onChange={(e) =>
                  patch((c) =>
                    ({
                      ...c,
                      loanDetails: {
                        ...c.loanDetails,
                        desiredDownPayment: parseCurrency(e.target.value),
                      },
                    }),
                  )
                }
              />
            </ApplicationField>
            <ApplicationField label="Loan Term">
              <select
                className={applicationInputClassName}
                value={application.loanDetails.loanTermMonths}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    loanDetails: {
                      ...c.loanDetails,
                      loanTermMonths: Number(e.target.value),
                    },
                  }))
                }
              >
                <option value={180}>15 Years</option>
                <option value={360}>30 Years</option>
              </select>
            </ApplicationField>
            <ApplicationField label="Interest Preference">
              <select
                className={applicationInputClassName}
                value={application.loanDetails.interestPreference}
                onChange={(e) =>
                  patch((c) => ({
                    ...c,
                    loanDetails: {
                      ...c.loanDetails,
                      interestPreference: e.target.value,
                    },
                  }))
                }
              >
                <option value="fixed">Fixed Rate</option>
                <option value="adjustable">Adjustable Rate</option>
                <option value="no_preference">No Preference</option>
              </select>
            </ApplicationField>
          </div>
        </ApplicationSection>
      ) : null}

      {section === "declarations" ? (
        <ApplicationSection subtitle="Section 9" title="Declarations">
          <div className="space-y-4">
            {(
              [
                ["bankruptcy", "Have you declared bankruptcy in the past 7 years?"],
                ["foreclosure", "Have you had a property foreclosed in the past 7 years?"],
                ["judgments", "Do you have any outstanding judgments?"],
                ["lawsuits", "Are you party to any pending lawsuits?"],
                ["coSigner", "Are you a co-signer on any debt?"],
                ["otherPropertyOwnership", "Do you own other real estate?"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-border px-4 py-3">
                <span className="text-sm text-brand-navy">{label}</span>
                <div className="flex gap-2">
                  <OptionCard
                    label="Yes"
                    selected={application.declarations[key] === true}
                    onSelect={() =>
                      patch((c) => ({
                        ...c,
                        declarations: { ...c.declarations, [key]: true },
                      }))
                    }
                  />
                  <OptionCard
                    label="No"
                    selected={application.declarations[key] === false}
                    onSelect={() =>
                      patch((c) => ({
                        ...c,
                        declarations: { ...c.declarations, [key]: false },
                      }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </ApplicationSection>
      ) : null}

      {section === "documents" ? (
        <ApplicationSection
          subtitle="Section 10"
          title="Document Checklist"
          explanation="Based on your application, here are the documents you'll likely need. Uploads will be requested in the next stage."
        >
          <ul className="space-y-3">
            {(application.documentChecklist.length > 0
              ? application.documentChecklist
              : generateDocumentChecklist(application)
            ).map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-brand-border px-4 py-3"
              >
                <div>
                  <p className="font-medium text-brand-navy">{item.name}</p>
                  {item.description ? (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>
                <span className="rounded-full bg-brand-background px-3 py-1 text-xs font-semibold text-muted-foreground capitalize">
                  {item.status.replace(/_/g, " ")}
                </span>
              </li>
            ))}
          </ul>
        </ApplicationSection>
      ) : null}

      {section === "review" ? (
        <ApplicationSection subtitle="Section 11" title="Review Your Application">
          <div className="space-y-4">
            {APPLICATION_SECTIONS.filter((s) => s !== "review" && s !== "consent").map(
              (sectionKey) => (
                <div
                  key={sectionKey}
                  className="flex items-center justify-between rounded-xl border border-brand-border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-brand-success/15 text-brand-success">
                      <Check className="size-4" />
                    </span>
                    <span className="font-medium text-brand-navy">
                      {APPLICATION_SECTION_LABELS[sectionKey]}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToSection(sectionKey)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </button>
                </div>
              ),
            )}
          </div>
        </ApplicationSection>
      ) : null}

      {section === "consent" ? (
        <ApplicationSection subtitle="Section 12" title="Consent & Authorization">
          <div className="space-y-4">
            {(
              [
                ["identityVerification", "Identity Verification"],
                ["creditAuthorization", "Credit Authorization"],
                ["employmentVerification", "Employment Verification"],
                ["incomeVerification", "Income Verification"],
                ["assetVerification", "Asset Verification"],
                ["fraudPrevention", "Fraud Prevention"],
                ["electronicConsent", "Electronic Consent"],
                ["privacyPolicy", "Privacy Policy"],
                ["termsOfService", "Terms of Service"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-start gap-3 rounded-xl border border-brand-border px-4 py-3"
              >
                <input
                  type="checkbox"
                  checked={application.consents[key]}
                  onChange={(e) =>
                    patch((c) => ({
                      ...c,
                      consents: { ...c.consents, [key]: e.target.checked },
                    }))
                  }
                  className="mt-1 size-4 rounded border-brand-border text-brand-blue"
                />
                <span className="text-sm text-brand-navy">
                  I authorize {company.companyName} to perform {label.toLowerCase()} as
                  part of my mortgage application.
                </span>
              </label>
            ))}
            <p className="text-sm text-muted-foreground">
              Read our{" "}
              <Link href="/privacy" className="font-semibold text-brand-blue">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="font-semibold text-brand-blue">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </ApplicationSection>
      ) : null}

      <ApplicationNavButtons
        onContinue={handleContinue}
        onPrevious={section !== "personal" ? handlePrevious : undefined}
        continueLabel={continueLabel}
        continueDisabled={!canContinue}
        isSaving={isPending}
      />
    </ApplicationShell>
  );
}
