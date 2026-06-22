"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  markAdminNotificationReadAction,
  markAllAdminNotificationsReadAction,
} from "@/lib/notifications/admin-actions";
import { formatAdminNotificationDate } from "@/lib/notifications/admin-format";
import { cn } from "@/lib/utils";
import type { AdminNotificationRecord } from "@/types/admin-notifications";

type AdminNotificationCenterProps = {
  notifications: AdminNotificationRecord[];
  notificationsHref: string;
};

const SEVERITY_STYLES: Record<AdminNotificationRecord["severity"], string> = {
  critical: "bg-brand-danger/10 text-brand-danger",
  high: "bg-brand-warning/10 text-brand-warning",
  normal: "bg-brand-blue/10 text-brand-blue",
  informational: "bg-brand-background text-muted-foreground",
};

export function AdminNotificationCenter({
  notifications,
  notificationsHref,
}: AdminNotificationCenterProps) {
  const [items, setItems] = useState(notifications);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function markRead(id: string) {
    startTransition(async () => {
      const result = await markAdminNotificationReadAction(id);
      setFeedback(result.error ?? result.success ?? null);
      if (!result.error) {
        setItems((current) =>
          current.map((item) =>
            item.id === id ? { ...item, read: true } : item,
          ),
        );
      }
    });
  }

  function markAllRead() {
    startTransition(async () => {
      const result = await markAllAdminNotificationsReadAction();
      setFeedback(result.error ?? result.success ?? null);
      if (!result.error) {
        setItems((current) => current.map((item) => ({ ...item, read: true })));
      }
    });
  }

  return (
    <section className="card-surface p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Admin Alerts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Centralized operational notifications for staff attention.
          </p>
        </div>
        <button
          type="button"
          disabled={isPending || items.every((item) => item.read)}
          onClick={markAllRead}
          className="h-10 rounded-lg border border-brand-border px-4 text-sm font-semibold text-brand-navy hover:bg-brand-background"
        >
          Mark all read
        </button>
      </div>

      {feedback ? (
        <p className="mb-4 text-sm text-muted-foreground">{feedback}</p>
      ) : null}

      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="rounded-xl border border-dashed border-brand-border px-4 py-8 text-center text-sm text-muted-foreground">
            No admin alerts yet.
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "rounded-xl border border-brand-border px-4 py-4",
                !item.read && "bg-brand-blue/[0.03]",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-brand-navy">{item.title}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                        SEVERITY_STYLES[item.severity],
                      )}
                    >
                      {item.severity}
                    </span>
                    {!item.read ? (
                      <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[11px] font-semibold text-white">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatAdminNotificationDate(item.createdAt)}
                    {item.entityType && item.entityId
                      ? ` · ${item.entityType} #${item.entityId}`
                      : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.dashboardUrl ? (
                    <Link
                      href={item.dashboardUrl}
                      className="inline-flex h-9 items-center rounded-lg border border-brand-border px-3 text-sm font-medium text-brand-navy hover:bg-brand-background"
                    >
                      Open
                    </Link>
                  ) : null}
                  {!item.read ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => markRead(item.id)}
                      className="inline-flex h-9 items-center rounded-lg bg-brand-navy px-3 text-sm font-medium text-white hover:bg-brand-navy/90"
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      <p className="mt-6 text-xs text-muted-foreground">
        Listening for live updates on{" "}
        <Link href={notificationsHref} className="font-medium text-brand-blue">
          {notificationsHref}
        </Link>
        .
      </p>
    </section>
  );
}
