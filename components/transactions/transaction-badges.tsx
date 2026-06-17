import { cn } from "@/lib/utils";
import {
  STATUS_BADGE_BASE,
  statusBadgeClasses,
} from "@/lib/status-colors";
import {
  STATUS_BADGE_TONE,
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/transactions/constants";
import type {
  PlatformTransactionStatus,
  PlatformTransactionType,
} from "@/types/transactions";

export function TransactionStatusBadge({
  status,
  className,
}: {
  status: PlatformTransactionStatus;
  className?: string;
}) {
  const tone = STATUS_BADGE_TONE[status];
  return (
    <span
      className={cn(
        STATUS_BADGE_BASE,
        "uppercase",
        statusBadgeClasses(tone),
        className,
      )}
    >
      {TRANSACTION_STATUS_LABELS[status]}
    </span>
  );
}

export function TransactionTypeLabel({
  type,
  className,
}: {
  type: PlatformTransactionType;
  className?: string;
}) {
  return (
    <span className={cn("font-medium text-brand-navy", className)}>
      {TRANSACTION_TYPE_LABELS[type]}
    </span>
  );
}
