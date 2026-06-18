"use client";

import { useRef, useState, useTransition } from "react";
import { CheckCircle2, FileUp, Trash2 } from "lucide-react";

import { uploadDocumentRequestAction } from "@/lib/applications/actions";
import { formatShortDate } from "@/lib/applications/status-utils";
import { Button } from "@/components/ui-kit/button";
import { cn } from "@/lib/utils";
import type { DocumentRequest } from "@/types/application-details";

type ApplicationDocumentRequestsProps = {
  applicationId: string;
  requests: DocumentRequest[];
  className?: string;
};

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
          Upload documents requested by your loan officer to continue the review
          process.
        </p>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className={cn(
              "rounded-xl border p-4 md:p-5",
              request.fulfilled
                ? "border-brand-success/20 bg-brand-success/[0.03]"
                : "border-brand-border bg-brand-background/40",
            )}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-brand-navy">
                    {request.documentName}
                  </p>
                  {request.fulfilled ? (
                    <CheckCircle2 className="size-4 text-brand-success" />
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
                  {request.fileName ? (
                    <span className="font-medium text-brand-success">
                      Uploaded: {request.fileName}
                    </span>
                  ) : null}
                </div>
              </div>

              {!request.fulfilled ? (
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
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled
                  className="h-9 border-brand-border px-3"
                >
                  <Trash2 className="size-4" />
                  Uploaded
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {feedback ? (
        <p className="mt-4 text-sm text-muted-foreground">{feedback}</p>
      ) : null}
    </section>
  );
}
