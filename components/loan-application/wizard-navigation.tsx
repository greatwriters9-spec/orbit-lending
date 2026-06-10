import { ArrowLeft, ArrowRight, Save } from "lucide-react";

import { Button } from "@/components/ui-kit/button";
import { cn } from "@/lib/utils";
import { TOTAL_WIZARD_STEPS } from "@/lib/loans/wizard-config";

type WizardNavigationProps = {
  currentStep: number;
  isSaving?: boolean;
  saveMessage?: string | null;
  onBack?: () => void;
  onNext?: () => void;
  onSaveDraft?: () => void;
  nextLabel?: string;
  showBack?: boolean;
  showNext?: boolean;
  showSave?: boolean;
  className?: string;
};

export function WizardNavigation({
  currentStep,
  isSaving = false,
  saveMessage,
  onBack,
  onNext,
  onSaveDraft,
  nextLabel = "Continue",
  showBack = true,
  showNext = true,
  showSave = true,
  className,
}: WizardNavigationProps) {
  return (
    <div className={cn("space-y-3 border-t border-brand-border pt-6", className)}>
      {saveMessage ? (
        <p
          className={cn(
            "text-sm",
            saveMessage.toLowerCase().includes("error") ||
              saveMessage.toLowerCase().includes("invalid") ||
              saveMessage.toLowerCase().includes("must")
              ? "text-brand-danger"
              : "text-brand-success",
          )}
        >
          {saveMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {showBack && currentStep > 1 && currentStep < TOTAL_WIZARD_STEPS ? (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-10 border-brand-border px-4 text-brand-navy"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          ) : null}

          {showSave && currentStep < TOTAL_WIZARD_STEPS ? (
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={onSaveDraft}
              className="h-10 border-brand-border px-4 text-brand-navy"
            >
              <Save className="size-4" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
          ) : null}
        </div>

        {showNext && currentStep < TOTAL_WIZARD_STEPS ? (
          <Button
            type="button"
            onClick={onNext}
            className="h-10 bg-brand-blue px-6 text-white hover:bg-brand-blue/90"
          >
            {nextLabel}
            <ArrowRight className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
