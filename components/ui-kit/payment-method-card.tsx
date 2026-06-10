import { Building2, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PaymentMethod as PaymentMethodData } from "@/types/dashboard";

type PaymentMethodCardProps = PaymentMethodData & {
  className?: string;
};

export function PaymentMethodCard({
  bankName,
  accountLabel,
  accountType,
  accountLastFour,
  verified,
  autoPayEnabled,
  className,
}: PaymentMethodCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-brand-success/20 bg-brand-success/[0.03] p-6 shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] md:p-7",
        className,
      )}
    >
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            Payment Method
          </p>
          <p className="mt-3 text-lg font-bold tracking-tight text-brand-navy">
            {bankName}
          </p>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            {accountLabel}
          </p>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-success/10 text-brand-success ring-1 ring-brand-success/15">
          <Building2 className="size-5" strokeWidth={1.75} />
        </div>
      </div>

      <div className="relative mt-5 space-y-1">
        <p className="text-sm font-medium text-brand-navy">{accountType}</p>
        <p className="text-sm tabular-nums text-muted-foreground">
          **** {accountLastFour}
        </p>
      </div>

      <div className="relative mt-5 flex flex-wrap gap-2">
        {verified ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-success/20 bg-brand-success/10 px-2.5 py-1 text-[11px] font-semibold text-brand-success">
            <CheckCircle2 className="size-3" strokeWidth={2} />
            Verified
          </span>
        ) : null}
        {autoPayEnabled ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-blue/20 bg-brand-blue/10 px-2.5 py-1 text-[11px] font-semibold text-brand-blue">
            <Zap className="size-3" strokeWidth={2} />
            AutoPay Enabled
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          <ShieldCheck className="size-3" strokeWidth={2} />
          Secure
        </span>
      </div>

      <p className="relative mt-4 text-xs font-medium text-brand-success">
        Your repayment method is configured and secure.
      </p>
    </div>
  );
}
