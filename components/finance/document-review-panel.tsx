"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Download, ExternalLink } from "lucide-react";

import {
  approveDocumentRequestAction,
  rejectDocumentRequestAction,
} from "@/lib/finance/document-review-actions";
import { documentReviewStatusLabel } from "@/lib/applications/document-request-status";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import { Button } from "@/components/ui-kit/button";
import { StatusLabelBadge } from "@/components/ui-kit/status-badge";
import { SectionHeader } from "@/components/ui-kit/section-header";
import type { FinanceApplicationDetail } from "@/types/finance";

type DocumentReviewPanelProps = {
  applicationId: string;
  documentRequests: FinanceApplicationDetail["documentRequests"];
};

export function DocumentReviewPanel({
  applicationId,
  documentRequests,
}: DocumentReviewPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  if (documentRequests.length === 0) {
    return null;
  }

  function runAction(action: () => Promise<{ error?: string; success?: string }>) {
    startTransition(async () => {
      const result = await action();
      setFeedback(result.error ?? result.success ?? null);
      router.refresh();
    });
  }

  return (
    <section className="card-surface p-6 md:p-8">
      <SectionHeader
        title="Document Requests"
        description="Review uploaded documents or track outstanding requests."
      />

      <ul className="mt-4 space-y-3">
        {documentRequests.map((doc) => {
          const canReview = doc.reviewStatus === "pending_review";
          const hasUploadedFile = Boolean(doc.fileName && doc.downloadUrl);

          return (
            <li
              key={doc.id}
              className="rounded-xl border border-brand-border px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-navy">
                    {doc.documentName}
                  </p>
                  {doc.description ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {doc.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Requested {formatApplicationDate(doc.requestedAt)}
                    {doc.dueDate ? ` · Due ${formatApplicationDate(doc.dueDate)}` : ""}
                    {doc.fileName ? ` · Uploaded: ${doc.fileName}` : ""}
                  </p>
                </div>
                <StatusLabelBadge
                  label={documentReviewStatusLabel(doc.reviewStatus)}
                  uppercase={false}
                />
              </div>

              {hasUploadedFile ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={doc.downloadUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-brand-border bg-background px-3 text-sm font-medium hover:bg-muted"
                  >
                    <ExternalLink className="size-4" />
                    View Document
                  </a>
                  <a
                    href={doc.downloadUrl!}
                    download={doc.fileName}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-brand-border bg-background px-3 text-sm font-medium hover:bg-muted"
                  >
                    <Download className="size-4" />
                    Download
                  </a>
                </div>
              ) : null}

              {canReview ? (
                <div className="mt-4 space-y-3 border-t border-brand-border pt-4">
                  <textarea
                    rows={2}
                    value={rejectReasons[doc.id] ?? ""}
                    onChange={(event) =>
                      setRejectReasons((current) => ({
                        ...current,
                        [doc.id]: event.target.value,
                      }))
                    }
                    placeholder="Optional rejection reason..."
                    className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={isPending}
                      onClick={() =>
                        runAction(() =>
                          approveDocumentRequestAction({
                            applicationId,
                            requestId: doc.id,
                          }),
                        )
                      }
                      className="h-9 bg-brand-blue px-4 text-white hover:bg-brand-blue/90"
                    >
                      Approve Document
                    </Button>
                    <Button
                      disabled={isPending || (rejectReasons[doc.id]?.trim().length ?? 0) < 3}
                      variant="outline"
                      onClick={() =>
                        runAction(() =>
                          rejectDocumentRequestAction({
                            applicationId,
                            requestId: doc.id,
                            reason:
                              rejectReasons[doc.id]?.trim() ||
                              "Please upload a clearer copy of this document.",
                          }),
                        )
                      }
                      className="h-9 border-brand-danger/30 px-4 text-brand-danger"
                    >
                      Reject Document
                    </Button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {feedback ? <p className="mt-4 text-sm text-muted-foreground">{feedback}</p> : null}
    </section>
  );
}
