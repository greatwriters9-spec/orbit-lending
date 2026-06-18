"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  fetchApplicationDraft,
  saveApplicationDraftAction,
} from "@/lib/loans/application-actions";
import {
  financialInformationSchema,
  personalInformationSchema,
  validateLoanConfiguration,
} from "@/lib/loans/application-schemas";
import { getDraftStorageKey, TOTAL_WIZARD_STEPS } from "@/lib/loans/wizard-config";
import type { LoanApplicationDraft } from "@/types/loan-application";
import type { LoanProduct } from "@/types/loans";
import type { UserProfile } from "@/types/profile";

type WizardContextValue = {
  product: LoanProduct;
  draft: LoanApplicationDraft;
  currentStep: number;
  stepErrors: Record<number, string>;
  isSaving: boolean;
  saveMessage: string | null;
  updateDraft: (partial: Partial<LoanApplicationDraft>) => void;
  updateConfiguration: (
    partial: Partial<LoanApplicationDraft["configuration"]>,
  ) => void;
  updatePersonalInfo: (
    partial: Partial<LoanApplicationDraft["personalInfo"]>,
  ) => void;
  updateFinancialInfo: (
    partial: Partial<LoanApplicationDraft["financialInfo"]>,
  ) => void;
  setDocument: (
    requirementId: string,
    documentName: string,
    fileName: string,
    storagePath?: string | null,
  ) => void;
  removeDocument: (requirementId: string) => void;
  goToStep: (step: number) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  validateStep: (step: number) => boolean;
  saveDraft: () => Promise<boolean>;
};

const WizardContext = createContext<WizardContextValue | null>(null);

function createInitialDraft(
  product: LoanProduct,
  profile: UserProfile | null,
  email: string,
): LoanApplicationDraft {
  const firstTerm = product.terms.find((term) => term.active);

  return {
    currentStep: 1,
    loanProductSlug: product.slug,
    configuration: {
      requestedAmount: 0,
      selectedTermId: firstTerm?.id ?? "",
      repaymentFrequency: firstTerm?.repaymentFrequency ?? "Monthly",
      purpose: "",
    },
    personalInfo: {
      firstName: profile?.first_name ?? "",
      lastName: profile?.last_name ?? "",
      email: profile?.email ?? email,
      phone: profile?.phone ?? "",
      dateOfBirth: profile?.date_of_birth ?? "",
      address: profile?.address ?? "",
      city: profile?.city ?? "",
      state: profile?.state ?? "",
      country: profile?.country ?? "US",
    },
    financialInfo: {
      employmentStatus: "",
      employerName: "",
      jobTitle: "",
      monthlyIncome: 0,
      monthlyExpenses: 0,
      existingDebt: 0,
    },
    documents: {},
  };
}

type WizardProviderProps = {
  product: LoanProduct;
  profile: UserProfile | null;
  email: string;
  children: ReactNode;
};

export function WizardProvider({
  product,
  profile,
  email,
  children,
}: WizardProviderProps) {
  const [draft, setDraft] = useState<LoanApplicationDraft>(() =>
    createInitialDraft(product, profile, email),
  );
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function hydrateDraft() {
      const storageKey = getDraftStorageKey(product.slug);
      let merged = createInitialDraft(product, profile, email);

      try {
        const local = localStorage.getItem(storageKey);
        if (local) {
          merged = { ...merged, ...JSON.parse(local) };
        }
      } catch {
        // ignore invalid local storage
      }

      const serverDraft = await fetchApplicationDraft(product.slug);
      if (serverDraft) {
        const selectedTerm = product.terms.find(
          (term) => term.id === serverDraft.configuration.selectedTermId,
        );

        merged = {
          ...merged,
          ...serverDraft,
          personalInfo: { ...merged.personalInfo, ...serverDraft.personalInfo },
          financialInfo: { ...merged.financialInfo, ...serverDraft.financialInfo },
          configuration: {
            ...merged.configuration,
            ...serverDraft.configuration,
            repaymentFrequency:
              selectedTerm?.repaymentFrequency ??
              serverDraft.configuration.repaymentFrequency,
          },
          documents: { ...merged.documents, ...serverDraft.documents },
        };
      }

      setDraft(merged);
      setHydrated(true);
    }

    void hydrateDraft();
  }, [product, profile, email]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(getDraftStorageKey(product.slug), JSON.stringify(draft));
  }, [draft, hydrated, product.slug]);

  const updateDraft = useCallback((partial: Partial<LoanApplicationDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
    setSaveMessage(null);
  }, []);

  const updateConfiguration = useCallback(
    (partial: Partial<LoanApplicationDraft["configuration"]>) => {
      setDraft((prev) => ({
        ...prev,
        configuration: { ...prev.configuration, ...partial },
      }));
      setSaveMessage(null);
    },
    [],
  );

  const updatePersonalInfo = useCallback(
    (partial: Partial<LoanApplicationDraft["personalInfo"]>) => {
      setDraft((prev) => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, ...partial },
      }));
      setSaveMessage(null);
    },
    [],
  );

  const updateFinancialInfo = useCallback(
    (partial: Partial<LoanApplicationDraft["financialInfo"]>) => {
      setDraft((prev) => ({
        ...prev,
        financialInfo: { ...prev.financialInfo, ...partial },
      }));
      setSaveMessage(null);
    },
    [],
  );

  const setDocument = useCallback(
    (
      requirementId: string,
      documentName: string,
      fileName: string,
      storagePath?: string | null,
    ) => {
      setDraft((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [requirementId]: {
            requirementId,
            documentName,
            fileName,
            storagePath: storagePath ?? null,
            fileUrl: storagePath ?? null,
            uploadedAt: new Date().toISOString(),
          },
        },
      }));
      setSaveMessage(null);
    },
    [],
  );

  const removeDocument = useCallback((requirementId: string) => {
    setDraft((prev) => {
      const next = { ...prev.documents };
      delete next[requirementId];
      return { ...prev, documents: next };
    });
    setSaveMessage(null);
  }, []);

  const validateStep = useCallback(
    (step: number) => {
      let error: string | null = null;

      if (step === 2) {
        const result = validateLoanConfiguration(
          draft.configuration,
          product.minAmount,
          product.maxAmount,
        );
        if (!result.ok) {
          error = result.message;
        } else {
          const termExists = product.terms.some(
            (term) => term.id === draft.configuration.selectedTermId && term.active,
          );
          if (!termExists) {
            error = "Select a valid repayment term.";
          }
        }
      }

      if (step === 3) {
        const result = personalInformationSchema.safeParse(draft.personalInfo);
        if (!result.success) {
          error = result.error.issues[0]?.message ?? "Invalid personal information.";
        }
      }

      if (step === 4) {
        const result = financialInformationSchema.safeParse(draft.financialInfo);
        if (!result.success) {
          error = result.error.issues[0]?.message ?? "Invalid financial information.";
        }
      }

      setStepErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[step] = error;
        } else {
          delete next[step];
        }
        return next;
      });

      return !error;
    },
    [draft, product],
  );

  const goToStep = useCallback((step: number) => {
    setDraft((prev) => ({
      ...prev,
      currentStep: Math.min(Math.max(step, 1), TOTAL_WIZARD_STEPS),
    }));
  }, []);

  const nextStep = useCallback(() => {
    const step = draft.currentStep;
    if (step >= TOTAL_WIZARD_STEPS) return false;
    if (step > 1 && !validateStep(step)) return false;
    goToStep(step + 1);
    return true;
  }, [draft.currentStep, goToStep, validateStep]);

  const prevStep = useCallback(() => {
    goToStep(draft.currentStep - 1);
  }, [draft.currentStep, goToStep]);

  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    setSaveMessage(null);
    const result = await saveApplicationDraftAction(draft);
    setIsSaving(false);

    if (result.error) {
      setSaveMessage(result.error);
      return false;
    }

    if (result.applicationId) {
      setDraft((prev) => ({
        ...prev,
        applicationId: result.applicationId,
        applicationNumber: result.applicationNumber ?? prev.applicationNumber,
      }));
    }

    setSaveMessage(result.success ?? "Draft saved.");
    return true;
  }, [draft]);

  const value = useMemo(
    () => ({
      product,
      draft,
      currentStep: draft.currentStep,
      stepErrors,
      isSaving,
      saveMessage,
      updateDraft,
      updateConfiguration,
      updatePersonalInfo,
      updateFinancialInfo,
      setDocument,
      removeDocument,
      goToStep,
      nextStep,
      prevStep,
      validateStep,
      saveDraft,
    }),
    [
      product,
      draft,
      stepErrors,
      isSaving,
      saveMessage,
      updateDraft,
      updateConfiguration,
      updatePersonalInfo,
      updateFinancialInfo,
      setDocument,
      removeDocument,
      goToStep,
      nextStep,
      prevStep,
      validateStep,
      saveDraft,
    ],
  );

  if (!hydrated) {
    return (
      <div className="card-surface flex min-h-[420px] items-center justify-center p-10">
        <p className="text-sm text-muted-foreground">Loading application...</p>
      </div>
    );
  }

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within WizardProvider");
  }
  return context;
}
