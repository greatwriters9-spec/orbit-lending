import Link from "next/link";
import { Wallet } from "lucide-react";

import { formatCurrency } from "@/lib/loans/queries";
import { cn } from "@/lib/utils";

type WithdrawableBalanceStatCardProps = {
  withdrawableBalance: number;
  mortgageApproved: boolean;
  withdrawableReleased: boolean;
  pendingAccountBalance: number;
  className?: string;
};

export function WithdrawableBalanceStatCard({
  withdrawableBalance,
  mortgageApproved,
  withdrawableReleased,
  pendingAccountBalance,
  className,
}: WithdrawableBalanceStatCardProps) {
  const description = !mortgageApproved
    ? "Available after your mortgage is approved."
    : !withdrawableReleased
      ? "Pending admin approval to release funds from your account balance."
      : "Available for withdrawal requests.";

  const trend = !mortgageApproved
    ? "Mortgage approval required"
    : !withdrawableReleased && pendingAccountBalance > 0
      ? `${formatCurrency(pendingAccountBalance)} awaiting release`
      : withdrawableBalance > 0
        ? "Released to your funding account"
        : "No withdrawable funds yet";

  return (
    <div
      className={cn(
        "group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-brand-success/20 bg-brand-success/[0.03] p-6 shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] md:p-7",
        className,
      )}
    >
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Withdrawable Balance
          </p>
          <p className="mt-3 text-[28px] font-bold leading-[1.1] tabular-nums text-brand-navy">
            {formatCurrency(withdrawableBalance)}
          </p>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-success/10 text-brand-success ring-1 ring-brand-success/15">
          <Wallet className="size-5" strokeWidth={1.75} />
        </div>
      </div>

      <p className="relative mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      <div className="relative mt-3 flex items-center justify-between gap-2 text-xs font-semibold text-brand-blue">
        <span>{trend}</span>
        {withdrawableReleased ? (
          <Link href="/wallet" className="hover:text-brand-blue/80">
            Manage →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
