import type {
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/types/support";
import { cn } from "@/lib/utils";
import {
  STATUS_BADGE_BASE,
  statusBadgeClasses,
  type StatusColorVariant,
} from "@/lib/status-colors";
import {
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
} from "@/lib/support/constants";

const statusVariants: Record<SupportTicketStatus, StatusColorVariant> = {
  open: "pending",
  assigned: "pending",
  in_progress: "pending",
  waiting_for_client: "pending",
  escalated: "danger",
  resolved: "success",
  closed: "neutral",
};

const priorityVariants: Record<SupportTicketPriority, StatusColorVariant> = {
  low: "neutral",
  normal: "prequalified",
  high: "pending",
  urgent: "danger",
  critical: "danger",
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
        STATUS_BADGE_BASE,
        "uppercase",
        statusBadgeClasses(statusVariants[status]),
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
        STATUS_BADGE_BASE,
        "uppercase",
        statusBadgeClasses(priorityVariants[priority]),
        className,
      )}
    >
      {TICKET_PRIORITY_LABELS[priority]}
    </span>
  );
}
