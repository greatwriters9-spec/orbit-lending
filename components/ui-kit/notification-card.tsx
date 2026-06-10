import { AlertCircle, Bell, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import type { NotificationPriority } from "@/types/dashboard";

type NotificationCardProps = {
  title: string;
  message: string;
  timestamp: string;
  priority?: NotificationPriority;
  unread?: boolean;
  className?: string;
};

const priorityConfig: Record<
  NotificationPriority,
  { icon: typeof Bell; accent: string; iconClass: string }
> = {
  default: {
    icon: Info,
    accent: "border-l-brand-blue",
    iconClass: "bg-brand-blue/10 text-brand-blue",
  },
  warning: {
    icon: AlertCircle,
    accent: "border-l-brand-warning",
    iconClass: "bg-brand-warning/10 text-brand-warning",
  },
  success: {
    icon: CheckCircle2,
    accent: "border-l-brand-success",
    iconClass: "bg-brand-success/10 text-brand-success",
  },
};

export function NotificationCard({
  title,
  message,
  timestamp,
  priority = "default",
  unread = false,
  className,
}: NotificationCardProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-brand-border border-l-4 bg-white px-4 py-3.5 transition-colors hover:bg-brand-background/60",
        config.accent,
        unread && "ring-1 ring-brand-blue/10",
        className,
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          config.iconClass,
        )}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-brand-navy">{title}</p>
          {unread ? (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-blue" />
          ) : null}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
        <p className="mt-2 text-xs font-medium text-muted-foreground/80">
          {timestamp}
        </p>
      </div>
    </div>
  );
}
