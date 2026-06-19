"use client";

import { useRef, useState, useTransition } from "react";
import { CheckCircle2, Clock3, FileUp, Trash2 } from "lucide-react";

import { uploadDocumentRequestAction } from "@/lib/applications/actions";
import { documentReviewStatusLabel } from "@/lib/applications/document-request-status";
import { formatShortDate } from "@/lib/applications/status-utils";
import { Button } from "@/components/ui-kit/button";
import { cn } from "@/lib/utils";
import type { DocumentRequest } from "@/types/application-details";

type ApplicationDocumentRequestsProps = {
  applicationId: string;
  requests: DocumentRequest[];
  className?: string;
};

function statusStyles(reviewStatus: DocumentRequest["reviewStatus"]) {
  switch (reviewStatus) {
    case "approved":
      return "border-brand-success/20 bg-brand-success/[0.03]";
    case "pending_review":
      return "border-brand-warning/20 bg-brand-warning/[0.04]";
    case "rejected":
      return "border-brand-danger/20 bg-brand-danger/[0.03]";
    default:
      return "border-brand-border bg-brand-background/40";
  }
}

export function ApplicationDocumentRequests({
  applicationId,
  requests,
  className,
}: ApplicationDocumentRequestsProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (requests.length === 0) {
    return null;
  }

  function handleUpload(requestId: string) {
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
    });
  }

  return (
    <section className={cn("card-surface p-6 md:p-8", className)}>
      <div className="mb-6">
        <h2 className="heading-secondary text-lg">Document Requests</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload requested documents here. After you submit a file, it stays
          pending until your loan officer reviews it.
        </p>
      </div>

      <div className="space-y-4">
        {requests.map((request) => {
          const canUpload =
            request.reviewStatus === "requested" ||
            request.reviewStatus === "rejected";
          const isApproved = request.reviewStatus === "approved";
          const isPendingReview = request.reviewStatus === "pending_review";

          return (
            <div
              key={request.id}
              className={cn("rounded-xl border p-4 md:p-5", statusStyles(request.reviewStatus))}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-brand-navy">
                      {request.documentName}
                    </p>
                    {isApproved ? (
                      <CheckCircle2 className="size-4 text-brand-success" />
                    ) : null}
                    {isPendingReview ? (
                      <Clock3 className="size-4 text-brand-warning" />
                    ) : null}
                  </div>
                  {request.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {request.description}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>Requested {formatShortDate(request.requestedAt)}</span>
                    {request.dueDate ? (
                      <span>Due {formatShortDate(request.dueDate)}</span>
                    ) : null}
                    <span className="font-medium text-brand-navy">
                      Status: {documentReviewStatusLabel(request.reviewStatus)}
                    </span>
                    {request.fileName ? (
                      <span className="font-medium text-brand-navy">
                        File: {request.fileName}
                      </span>
                    ) : null}
                  </div>
                </div>

                {canUpload ? (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <input
                      ref={(el) => {
                        inputRefs.current[request.id] = el;
                      }}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="hidden"
                      id={`doc-${request.id}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => inputRefs.current[request.id]?.click()}
                      className="h-9 border-brand-border px-3"
                    >
                      <FileUp className="size-4" />
                      Choose File
                    </Button>
                    <Button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleUpload(request.id)}
                      className="h-9 bg-brand-blue px-3 text-white hover:bg-brand-blue/90"
                    >
                      Upload
                    </Button>
                  </div>
                ) : isPendingReview ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="h-9 border-brand-border px-3"
                  >
                    <Clock3 className="size-4" />
                    Under Review
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="h-9 border-brand-border px-3"
                  >
                    <Trash2 className="size-4" />
                    Approved
                  </Button>
                )}
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
