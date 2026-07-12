"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import {
  deleteEmailCommunicationLogAction,
  fetchEmailCommunicationLogDetailAction,
  type EmailCommunicationLogDetail,
} from "@/lib/email/admin-actions";
import { getEmailTemplateLabel } from "@/lib/email/templates/catalog-labels";
import type { EmailCommunicationLog } from "@/lib/email/types";
import { Button } from "@/components/ui-kit/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui-kit/sheet";
import { formatApplicationDate } from "@/lib/applications/status-utils";

type CommunicationLogDetailSheetProps = {
  log: EmailCommunicationLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (logId: string) => void;
};

export function CommunicationLogDetailSheet({
  log,
  open,
  onOpenChange,
  onDeleted,
}: CommunicationLogDetailSheetProps) {
  const [detail, setDetail] = useState<EmailCommunicationLogDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || !log) {
      setDetail(null);
      setError(null);
      return;
    }

    startTransition(async () => {
      const result = await fetchEmailCommunicationLogDetailAction(log.id);
      if (result.error) {
        setError(result.error);
        setDetail(null);
        return;
      }

      setDetail(result.detail ?? null);
      setError(null);
    });
  }, [log, open]);

  function handleDelete() {
    if (!log) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this email log entry? This cannot be undone.",
    );
    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteEmailCommunicationLogAction(log.id);
      if (result.error) {
        setError(result.error);
        return;
      }

      onDeleted(log.id);
      onOpenChange(false);
    });
  }

  const activeLog = detail?.log ?? log;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-3xl"
        showCloseButton
      >
        <SheetHeader>
          <SheetTitle>Sent email details</SheetTitle>
          <SheetDescription>
            Review what was delivered and remove the log entry if needed.
          </SheetDescription>
        </SheetHeader>

        {isPending && !detail ? (
          <div className="flex items-center gap-2 px-4 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading email...
          </div>
        ) : null}

        {activeLog ? (
          <div className="space-y-5 px-4 pb-4">
            <div className="rounded-xl border border-brand-border bg-brand-surface/40 p-4 text-sm">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Date</dt>
                  <dd className="font-medium text-brand-navy">
                    {formatApplicationDate(activeLog.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium capitalize text-brand-navy">
                    {activeLog.status}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Recipient</dt>
                  <dd className="font-medium text-brand-navy">
                    {activeLog.recipientEmail}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Department</dt>
                  <dd className="font-medium text-brand-navy">
                    {activeLog.senderDisplayName}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Template</dt>
                  <dd className="font-medium text-brand-navy">
                    {getEmailTemplateLabel(activeLog.templateKey)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Subject</dt>
                  <dd className="font-medium text-brand-navy">{activeLog.subject}</dd>
                </div>
              </dl>
              {activeLog.errorMessage ? (
                <p className="mt-3 rounded-lg border border-brand-danger/20 bg-brand-danger/5 px-3 py-2 text-brand-danger">
                  {activeLog.errorMessage}
                </p>
              ) : null}
            </div>

            {detail?.html ? (
              <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
                <div className="border-b border-brand-border px-4 py-3 text-sm font-semibold text-brand-navy">
                  Email content
                </div>
                <iframe
                  title="Sent email preview"
                  srcDoc={detail.html}
                  className="h-[min(70vh,720px)] w-full bg-white"
                  sandbox=""
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p className="mx-4 rounded-xl border border-brand-danger/20 bg-brand-danger/5 px-4 py-3 text-sm text-brand-danger">
            {error}
          </p>
        ) : null}

        <SheetFooter className="border-t border-brand-border">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={isPending || !log}
            className="text-brand-danger hover:text-brand-danger"
          >
            <Trash2 className="size-4" />
            Delete log
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
