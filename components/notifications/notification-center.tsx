"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import { NotificationCard } from "@/components/ui-kit/notification-card";
import { Button } from "@/components/ui-kit/button";
import {
  NOTIFICATION_CATEGORY_LABELS,
  type ClientNotification,
  type NotificationCategory,
} from "@/types/notifications";

type NotificationCenterProps = {
  notifications: ClientNotification[];
};

const CATEGORIES: Array<NotificationCategory | "all"> = [
  "all",
  "application_update",
  "finance_message",
  "wallet_activity",
  "security",
  "repayment",
  "support",
];

function mapPriority(priority: ClientNotification["priority"]) {
  if (priority === "critical" || priority === "high") return "warning" as const;
  if (priority === "informational") return "default" as const;
  return "default" as const;
}

export function NotificationCenter({ notifications }: NotificationCenterProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationCategory | "all">("all");
  const [isPending, startTransition] = useTransition();

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.category === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      router.refresh();
    });
  }

  function markRead(id: string) {
    startTransition(async () => {
      await markNotificationReadAction(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="heading-primary text-2xl">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 ? (
          <Button
            variant="outline"
            disabled={isPending}
            onClick={markAllRead}
            className="h-9"
          >
            Mark All Read
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === cat
                ? "bg-brand-blue text-white"
                : "bg-brand-background text-muted-foreground hover:text-brand-navy"
            }`}
          >
            {cat === "all" ? "All" : NOTIFICATION_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card-surface p-8 text-center text-sm text-muted-foreground">
            No notifications in this category.
          </div>
        ) : (
          filtered.map((n) => (
            <div key={n.id} className="relative">
              {n.actionUrl ? (
                <Link href={n.actionUrl} onClick={() => !n.read && markRead(n.id)}>
                  <NotificationCard
                    title={n.title}
                    message={n.message}
                    timestamp={new Date(n.createdAt).toLocaleString()}
                    priority={mapPriority(n.priority)}
                    unread={!n.read}
                  />
                </Link>
              ) : (
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => !n.read && markRead(n.id)}
                >
                  <NotificationCard
                    title={n.title}
                    message={n.message}
                    timestamp={new Date(n.createdAt).toLocaleString()}
                    priority={mapPriority(n.priority)}
                    unread={!n.read}
                  />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
