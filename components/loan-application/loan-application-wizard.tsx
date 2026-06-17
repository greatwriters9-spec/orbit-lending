"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { StepFinancialInformation } from "@/components/loan-application/steps/step-financial-information";
import { StepLoanConfiguration } from "@/components/loan-application/steps/step-loan-configuration";
import { StepPersonalInformation } from "@/components/loan-application/steps/step-personal-information";
import { StepProductSummary } from "@/components/loan-application/steps/step-product-summary";
import { StepRequirementsDocuments } from "@/components/loan-application/steps/step-requirements-documents";
import { StepReviewApplication } from "@/components/loan-application/steps/step-review-application";
import { StepSubmissionConfirmation } from "@/components/loan-application/steps/step-submission-confirmation";
import { WizardNavigation } from "@/components/loan-application/wizard-navigation";
import { WizardProgress } from "@/components/loan-application/wizard-progress";
import {
  WizardProvider,
  useWizard,
} from "@/components/loan-application/wizard-context";
import { submitApplicationAction } from "@/lib/loans/application-actions";
import { getDraftStorageKey } from "@/lib/loans/wizard-config";
import type { LoanProduct } from "@/types/loans";
import type { UserProfile } from "@/types/profile";

type LoanApplicationWizardProps = {
  product: LoanProduct;
  profile: UserProfile | null;
  email: string;
};

function WizardContent({ productName }: { productName: string }) {
  const {
    draft,
    currentStep,
    nextStep,
    prevStep,
    saveDraft,
    isSaving,
    saveMessage,
    validateStep,
    updateDraft,
    goToStep,
  } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit() {
    for (const step of [2, 3, 4, 5]) {
      if (!validateStep(step)) {
        goToStep(step);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError(null);
    const result = await submitApplicationAction(draft);
    setIsSubmitting(false);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    updateDraft({
      applicationId: result.applicationId,
      applicationNumber: result.applicationNumber,
      submittedAt: new Date().toISOString(),
    });

    localStorage.removeItem(getDraftStorageKey(draft.loanProductSlug));
    goToStep(7);
  }

  function renderStep() {
    switch (currentStep) {
      case 1:
        return <StepProductSummary />;
      case 2:
        return <StepLoanConfiguration />;
      case 3:
        return <StepPersonalInformation />;
      case 4:
        return <StepFinancialInformation />;
      case 5:
        return <StepRequirementsDocuments />;
      case 6:
        return <StepReviewApplication />;
      case 7:
        return (
          <StepSubmissionConfirmation
            applicationNumber={draft.applicationNumber ?? "Pending"}
            applicationId={draft.applicationId}
            productName={productName}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      {currentStep < 7 ? <WizardProgress currentStep={currentStep} /> : null}

      {renderStep()}

      {currentStep < 7 ? (
        <WizardNavigation
          currentStep={currentStep}
          isSaving={isSaving}
          saveMessage={submitError ?? saveMessage}
          onBack={prevStep}
          onNext={currentStep === 6 ? handleSubmit : nextStep}
          onSaveDraft={() => void saveDraft()}
          nextLabel={
            currentStep === 6
              ? isSubmitting
                ? "Submitting..."
                : "Submit Application"
              : "Continue"
          }
          showSave={currentStep > 1}
        />
      ) : null}
    </div>
  );
}

export function LoanApplicationWizard({
  product,
  profile,
  email,
}: LoanApplicationWizardProps) {
  return (
    <div className="space-y-6">
      <Link
        href={`/loans/${product.slug}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-blue"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Back to {product.name}
      </Link>

      <div className="card-surface border-brand-border bg-white px-6 py-6 md:px-8 md:py-7">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Mortgage Application
        </p>
        <h1 className="heading-primary mt-2 text-2xl md:text-3xl">
          Get Pre-Qualified for {product.name}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Complete each step to submit your application. You can save your progress
          as a draft and return at any time.
        </p>
      </div>

      <WizardProvider product={product} profile={profile} email={email}>
        <WizardContent productName={product.name} />
      </WizardProvider>
    </div>
  );
}
