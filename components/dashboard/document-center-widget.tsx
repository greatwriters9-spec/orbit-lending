"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Clock3, FileText, FileUp } from "lucide-react";

import { uploadDocumentRequestAction } from "@/lib/applications/actions";
import { Button } from "@/components/ui-kit/button";
import { cn } from "@/lib/utils";
import {
  STATUS_BADGE_BASE,
  statusBadgeClasses,
  type StatusColorVariant,
} from "@/lib/status-colors";
import type { DocumentCenterItem } from "@/types/mortgage-dashboard";

type DocumentCenterWidgetProps = {
  applicationId?: string;
  documents: DocumentCenterItem[];
  className?: string;
};

const STATUS_VARIANTS: Record<DocumentCenterItem["status"], StatusColorVariant> = {
  approved: "success",
  pending: "pending",
  required: "pending",
  rejected: "danger",
};

const STATUS_LABELS: Record<DocumentCenterItem["status"], string> = {
  approved: "Approved",
  pending: "Under Review",
  required: "Required",
  rejected: "Rejected",
};

function canUploadDocument(status: DocumentCenterItem["status"]): boolean {
  return status === "required" || status === "rejected";
}

export function DocumentCenterWidget({
  applicationId,
  documents,
  className,
}: DocumentCenterWidgetProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (documents.length === 0) {
    return null;
  }

  function handleUpload(requestId: string) {
    if (!applicationId) {
      setFeedback("Open your application to upload this document.");
      return;
    }

    const input = inputRefs.current[requestId];
    const file = input?.files?.[0];
    if (!file) {
      setFeedback("Select a file to upload.");
      return;
    }

    startTransition(async () => {
      const payload = new FormData();
      payload.set("applicationId", applicationId);
      payload.set("requestId", requestId);
      payload.set("file", file);

      const result = await uploadDocumentRequestAction(payload);
      setFeedback(result.error ?? result.success ?? null);
      if (!result.error) {
        router.refresh();
      }
    });
  }

  return (
    <section className={cn("dashboard-card flex h-full flex-col p-6 md:p-8", className)}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/8 ring-1 ring-brand-border">
            <FileText className="size-5 text-brand-blue" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-navy">Documents</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Mortgage documents, disclosures, and closing files.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/documents"
          className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
        >
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {documents.map((doc) => {
          const uploadable = canUploadDocument(doc.status);

          return (
            <div
              key={doc.id}
              className="flex flex-col gap-3 rounded-2xl border border-brand-border bg-brand-background/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium text-brand-navy">{doc.name}</span>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span
                  className={cn(
                    STATUS_BADGE_BASE,
                    "rounded-full",
                    statusBadgeClasses(STATUS_VARIANTS[doc.status]),
                  )}
                >
                  {STATUS_LABELS[doc.status]}
                </span>

                {uploadable ? (
                  <>
                    <input
                      ref={(element) => {
                        inputRefs.current[doc.id] = element;
                      }}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="hidden"
                      id={`dashboard-doc-${doc.id}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => inputRefs.current[doc.id]?.click()}
                      className="h-8 border-brand-border px-3 text-xs"
                    >
                      <FileUp className="size-3.5" />
                      Choose File
                    </Button>
                    <Button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleUpload(doc.id)}
                      className="h-8 bg-brand-blue px-3 text-xs text-white hover:bg-brand-blue/90"
                    >
                      Upload
                    </Button>
                  </>
                ) : doc.status === "pending" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    Under Review
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {feedback ? (
        <p className="mt-4 text-sm text-muted-foreground">{feedback}</p>
      ) : null}
    </section>
  );
}
