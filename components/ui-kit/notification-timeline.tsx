import { AlertCircle, Bell, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DashboardNotification, NotificationPriority } from "@/types/dashboard";

type NotificationTimelineProps = {
  notifications: DashboardNotification[];
  className?: string;
};

const priorityConfig: Record<
  NotificationPriority,
  { icon: typeof Bell; dotClass: string; iconClass: string }
> = {
  default: {
    icon: Info,
    dotClass: "bg-brand-blue ring-brand-blue/20",
    iconClass: "bg-brand-blue/10 text-brand-blue",
  },
  warning: {
    icon: AlertCircle,
    dotClass: "bg-brand-warning ring-brand-warning/20",
    iconClass: "bg-brand-warning/10 text-brand-warning",
  },
  success: {
    icon: CheckCircle2,
    dotClass: "bg-brand-success ring-brand-success/20",
    iconClass: "bg-brand-success/10 text-brand-success",
  },
};

export function NotificationTimeline({
  notifications,
  className,
}: NotificationTimelineProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="absolute top-4 bottom-4 left-[19px] w-px bg-brand-border"
      />

      <ul className="space-y-0">
        {notifications.map((notification, index) => {
          const priority = notification.priority ?? "default";
          const config = priorityConfig[priority];
          const Icon = config.icon;
          const isLast = index === notifications.length - 1;

          return (
            <li
              key={notification.id}
              className={cn("relative flex gap-5", !isLast && "pb-8")}
            >
              <div className="relative z-10 flex shrink-0 flex-col items-center">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full ring-4",
                    config.dotClass,
                    config.iconClass,
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                </div>
              </div>

              <div
                className={cn(
                  "min-w-0 flex-1 rounded-xl border border-brand-border bg-brand-background/40 px-5 py-4 transition-colors hover:bg-brand-background/80",
                  notification.unread && "border-brand-blue/20 bg-white",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-brand-navy">
                    {notification.title}
                  </p>
                  {notification.unread ? (
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-brand-blue" />
                  ) : null}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {notification.message}
                </p>
                <time className="mt-3 block text-xs font-medium text-muted-foreground/70">
                  {notification.timestamp}
                </time>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
