"use client";

import { useState, useTransition } from "react";

import { formatApplicationDate } from "@/lib/applications/status-utils";
import { updateGuestConcernStatusAction } from "@/lib/support/guest-concern-actions";
import { Button } from "@/components/ui-kit/button";
import type { GuestConcernStatus, GuestSupportConcern } from "@/types/guest-support";

const STATUS_LABELS: Record<GuestConcernStatus, string> = {
  open: "Open",
  in_review: "In Review",
  resolved: "Resolved",
  closed: "Closed",
};

type GuestConcernsPanelProps = {
  concerns: GuestSupportConcern[];
};

export function GuestConcernsPanel({ concerns }: GuestConcernsPanelProps) {
  const [isPending, startTransition] = useTransition();

  function updateStatus(concernId: string, status: GuestConcernStatus) {
    startTransition(async () => {
      await updateGuestConcernStatusAction({ concernId, status });
    });
  }

  if (concerns.length === 0) {
    return (
      <div className="card-surface p-8 text-center text-sm text-muted-foreground">
        No guest concerns yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {concerns.map((concern) => (
        <article key={concern.id} className="card-surface p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-brand-blue uppercase">
                {concern.referenceNumber}
              </p>
              <h2 className="heading-primary mt-1 text-lg">{concern.fullName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {concern.email} · {concern.phone}
              </p>
            </div>
            <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
              {STATUS_LABELS[concern.status]}
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-brand-navy/85">
            {concern.concern}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-4">
            <p className="text-xs text-muted-foreground">
              Submitted {formatApplicationDate(concern.createdAt)}
              {concern.source ? ` · ${concern.source}` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {concern.status === "open" ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending}
                  onClick={() => updateStatus(concern.id, "in_review")}
                  className="bg-brand-blue text-white hover:bg-brand-blue/90"
                >
                  Mark in review
                </Button>
              ) : null}
              {concern.status !== "resolved" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => updateStatus(concern.id, "resolved")}
                >
                  Resolve
                </Button>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
