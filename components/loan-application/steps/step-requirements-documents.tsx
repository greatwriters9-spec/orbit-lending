"use client";

import { useRef, useState, useTransition } from "react";
import { FileUp, Loader2, Trash2 } from "lucide-react";

import { useWizard } from "@/components/loan-application/wizard-context";
import {
  WizardShell,
  WizardStepError,
} from "@/components/loan-application/wizard-shell";
import { Button } from "@/components/ui-kit/button";
import {
  ensureApplicationDraftIdAction,
  uploadApplicationDocumentAction,
} from "@/lib/documents/actions";
import { cn } from "@/lib/utils";

type DocumentUploadFieldProps = {
  requirementId: string;
  documentName: string;
  description: string;
  required: boolean;
  fileName?: string;
  onUpload: (fileName: string, storagePath: string) => void;
  onRemove: () => void;
};

function DocumentUploadField({
  requirementId,
  documentName,
  description,
  required,
  fileName,
  onUpload,
  onRemove,
}: DocumentUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { draft, updateDraft } = useWizard();

  function handleFileSelect(file: File) {
    startTransition(async () => {
      setError(null);

      let applicationId = draft.applicationId;
      if (!applicationId) {
        const ensured = await ensureApplicationDraftIdAction({
          loanProductSlug: draft.loanProductSlug,
        });
        if (ensured.error || !ensured.applicationId) {
          setError(ensured.error ?? "Unable to prepare application draft.");
          return;
        }
        applicationId = ensured.applicationId;
        updateDraft({ applicationId });
      }

      const payload = new FormData();
      payload.set("applicationId", applicationId);
      payload.set("requirementId", requirementId);
      payload.set("file", file);

      const result = await uploadApplicationDocumentAction(payload);
      if (result.error || !result.storagePath) {
        setError(result.error ?? "Upload failed.");
        return;
      }

      onUpload(file.name, result.storagePath);
    });
  }

  return (
    <div className="rounded-xl border border-brand-border bg-white p-4 md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-navy">
            {documentName}
            {!required ? (
              <span className="ml-2 text-xs font-medium text-muted-foreground">
                Optional
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {fileName ? (
            <p className="mt-3 text-sm font-medium text-brand-success">
              Uploaded: {fileName}
            </p>
          ) : null}
          {error ? (
            <p className="mt-2 text-sm text-brand-danger">{error}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-2">
          <input
            ref={inputRef}
            id={`upload-${requirementId}`}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                handleFileSelect(file);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
            className="h-9 border-brand-border px-3 text-brand-navy"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileUp className="size-4" />
            )}
            {fileName ? "Replace" : "Upload"}
          </Button>
          {fileName ? (
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onRemove}
              className="h-9 border-brand-border px-3 text-brand-danger"
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function StepRequirementsDocuments() {
  const {
    product,
    draft,
    setDocument,
    removeDocument,
    stepErrors,
    currentStep,
  } = useWizard();

  return (
    <WizardShell
      title="Requirements & Documents"
      description="Upload documents based on your selected loan product requirements."
    >
      <WizardStepError message={stepErrors[currentStep]} />

      <div className={cn("space-y-4")}>
        {product.requirements.map((requirement) => (
          <DocumentUploadField
            key={requirement.id}
            requirementId={requirement.id}
            documentName={requirement.requirementName}
            description={requirement.description}
            required={requirement.required}
            fileName={draft.documents[requirement.id]?.fileName}
            onUpload={(fileName, storagePath) =>
              setDocument(
                requirement.id,
                requirement.requirementName,
                fileName,
                storagePath,
              )
            }
            onRemove={() => removeDocument(requirement.id)}
          />
        ))}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        Accepted formats: PDF, JPG, PNG, DOC, DOCX. Documents are stored securely
        and reviewed as part of your application.
      </p>
    </WizardShell>
  );
}
