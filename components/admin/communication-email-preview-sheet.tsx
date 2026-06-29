"use client";

import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";

import type { CommunicationPreviewResult } from "@/lib/email/communication-compose";
import { Button } from "@/components/ui-kit/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui-kit/sheet";

type CommunicationEmailPreviewSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: CommunicationPreviewResult | null;
  loading?: boolean;
  sending?: boolean;
  error?: string | null;
  onConfirmSend: () => void;
};

export function CommunicationEmailPreviewSheet({
  open,
  onOpenChange,
  preview,
  loading = false,
  sending = false,
  error,
  onConfirmSend,
}: CommunicationEmailPreviewSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-3xl"
        showCloseButton
      >
        <SheetHeader>
          <SheetTitle>Review email before sending</SheetTitle>
          <SheetDescription>
            Confirm every detail below matches what you want the customer to receive.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center gap-2 px-4 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Building preview...
          </div>
        ) : null}

        {!loading && preview ? (
          <div className="space-y-5 px-4 pb-4">
            <div className="rounded-xl border border-brand-border bg-brand-surface/40 p-4">
              <h3 className="text-sm font-semibold text-brand-navy">
                Delivery summary
              </h3>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Subject</dt>
                  <dd className="font-medium text-brand-navy">{preview.subject}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Headline</dt>
                  <dd className="font-medium text-brand-navy">{preview.headline}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Template</dt>
                  <dd className="font-medium text-brand-navy">{preview.templateLabel}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Recipients</dt>
                  <dd className="font-medium text-brand-navy">
                    {preview.recipientCount} total
                  </dd>
                </div>
              </dl>
              {preview.recipientPreview.length > 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  {preview.recipientPreview.join(", ")}
                  {preview.recipientCount > preview.recipientPreview.length
                    ? ` and ${preview.recipientCount - preview.recipientPreview.length} more`
                    : ""}
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-brand-border bg-white p-4">
              <h3 className="text-sm font-semibold text-brand-navy">
                Accuracy checks
              </h3>
              <ul className="mt-3 space-y-2">
                {preview.checks.map((check) => (
                  <li
                    key={check.id}
                    className="flex items-start gap-2 text-sm"
                  >
                    {check.ok ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-success" />
                    ) : (
                      <CircleAlert className="mt-0.5 size-4 shrink-0 text-brand-danger" />
                    )}
                    <span>
                      <span className="font-medium text-brand-navy">
                        {check.label}
                      </span>
                      {check.detail ? (
                        <span className="block text-muted-foreground">
                          {check.detail}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
              <div className="border-b border-brand-border px-4 py-3 text-sm font-semibold text-brand-navy">
                Email preview
              </div>
              <iframe
                title="Email preview"
                srcDoc={preview.html}
                className="h-[min(70vh,720px)] w-full bg-white"
                sandbox=""
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mx-4 rounded-xl border border-brand-danger/20 bg-brand-danger/5 px-4 py-3 text-sm text-brand-danger">
            {error}
          </p>
        ) : null}

        <SheetFooter className="border-t border-brand-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Back to edit
          </Button>
          <Button
            type="button"
            onClick={onConfirmSend}
            disabled={!preview?.readyToSend || sending || loading}
          >
            {sending ? "Sending..." : "Confirm & Send"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
