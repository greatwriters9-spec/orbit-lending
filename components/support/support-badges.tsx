import type {
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/types/support";
import { cn } from "@/lib/utils";
import {
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
} from "@/lib/support/constants";

const statusStyles: Record<SupportTicketStatus, string> = {
  open: "border-brand-blue/20 bg-brand-blue/10 text-brand-blue",
  assigned: "border-brand-blue/20 bg-brand-blue/10 text-brand-blue",
  in_progress: "border-brand-warning/20 bg-brand-warning/10 text-brand-warning",
  waiting_for_client:
    "border-brand-warning/20 bg-brand-warning/10 text-brand-warning",
  escalated: "border-brand-danger/20 bg-brand-danger/10 text-brand-danger",
  resolved: "border-brand-success/20 bg-brand-success/10 text-brand-success",
  closed: "border-brand-border bg-brand-background text-muted-foreground",
};

const priorityStyles: Record<SupportTicketPriority, string> = {
  low: "border-brand-border bg-brand-background text-muted-foreground",
  normal: "border-brand-blue/20 bg-brand-blue/10 text-brand-blue",
  high: "border-brand-warning/20 bg-brand-warning/10 text-brand-warning",
  urgent: "border-brand-danger/20 bg-brand-danger/10 text-brand-danger",
  critical: "border-brand-danger/30 bg-brand-danger/15 text-brand-danger",
};

export function SupportStatusBadge({
  status,
  className,
}: {
  status: SupportTicketStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        statusStyles[status],
        className,
      )}
    >
      {TICKET_STATUS_LABELS[status]}
    </span>
  );
}

export function SupportPriorityBadge({
  priority,
  className,
}: {
  priority: SupportTicketPriority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        priorityStyles[priority],
        className,
      )}
    >
      {TICKET_PRIORITY_LABELS[priority]}
    </span>
  );
}
