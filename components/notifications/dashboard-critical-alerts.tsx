"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AlertTriangle, X } from "lucide-react";

import { dismissAlertModalAction } from "@/lib/notifications/actions";
import { Button } from "@/components/ui-kit/button";
import type { ClientNotification } from "@/types/notifications";

type DashboardCriticalAlertsProps = {
  alerts: ClientNotification[];
};

export function DashboardCriticalAlerts({ alerts }: DashboardCriticalAlertsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (alerts.length === 0) {
    return null;
  }

  const alert = alerts[0];

  function dismiss() {
    startTransition(async () => {
      await dismissAlertModalAction(alert.id);
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/40 p-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-labelledby="critical-alert-title"
        className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-xl"
      >
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-warning/10 text-brand-warning">
            <AlertTriangle className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="critical-alert-title"
              className="heading-secondary text-lg"
            >
              {alert.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {alert.message}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            disabled={isPending}
            className="text-muted-foreground hover:text-brand-navy"
            aria-label="Dismiss alert"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {alert.actionUrl ? (
            <Button
              render={<Link href={alert.actionUrl} />}
              className="h-10 flex-1 bg-brand-blue text-white hover:bg-brand-blue/90"
              onClick={dismiss}
            >
              View Details
            </Button>
          ) : null}
          <Button
            variant="outline"
            disabled={isPending}
            onClick={dismiss}
            className="h-10 flex-1"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
