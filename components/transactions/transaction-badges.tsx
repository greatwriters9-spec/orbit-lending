import { cn } from "@/lib/utils";
import {
  STATUS_BADGE_TONE,
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/transactions/constants";
import type {
  PlatformTransactionStatus,
  PlatformTransactionType,
} from "@/types/transactions";

const toneClasses = {
  success: "bg-brand-success/10 text-brand-success border-brand-success/20",
  info: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
};

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
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase",
        toneClasses[tone],
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
