import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Clock,
  Landmark,
  Shield,
  Wallet as WalletIcon,
} from "lucide-react";

import { StatCard } from "@/components/ui-kit/stat-card";
import { formatCurrency } from "@/lib/loans/queries";
import { PATHWARD_BANK, type Wallet } from "@/types/wallet";

type WalletSummaryProps = {
  wallet: Wallet;
};

export function WalletSummary({ wallet }: WalletSummaryProps) {
  const totalBalance =
    wallet.availableBalance + wallet.pendingBalance + wallet.reservedBalance;

  return (
    <div className="space-y-6">
      <section className="card-surface overflow-hidden">
        <div className="border-b border-brand-border bg-brand-navy px-6 py-8 text-white md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-white/45 uppercase">
                Orbit Lending Wallet
              </p>
              <h1 className="heading-primary-light mt-2 text-3xl md:text-4xl">
                {formatCurrency(totalBalance)}
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Total wallet balance across all accounts
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand-blue/20">
                  <Building2 className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.08em] text-white/45 uppercase">
                    {PATHWARD_BANK.infrastructure}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {PATHWARD_BANK.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-brand-border sm:grid-cols-3">
          <BalanceCell
            label="Available"
            value={formatCurrency(wallet.availableBalance)}
            description="Ready for withdrawal"
            highlight
          />
          <BalanceCell
            label="Pending"
            value={formatCurrency(wallet.pendingBalance)}
            description="Awaiting approval"
          />
          <BalanceCell
            label="Reserved"
            value={formatCurrency(wallet.reservedBalance)}
            description="Held for repayments"
          />
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Funded"
          value={formatCurrency(wallet.totalFunded)}
          description="Lifetime loan disbursements"
          icon={ArrowDownLeft}
          variant="success"
        />
        <StatCard
          title="Total Withdrawn"
          value={formatCurrency(wallet.totalWithdrawn)}
          description="Processed withdrawals"
          icon={ArrowUpRight}
          variant="default"
        />
        <StatCard
          title="Total Repaid"
          value={formatCurrency(wallet.totalRepaid)}
          description="Repayments received"
          icon={Landmark}
          variant="growth"
        />
        <StatCard
          title="Loan Exposure"
          value={formatCurrency(wallet.currentLoanExposure)}
          description="Current outstanding loan"
          icon={Shield}
          variant="warning"
        />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/wallet/withdraw"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90"
        >
          <WalletIcon className="size-4" />
          Request Withdrawal
        </Link>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {PATHWARD_BANK.tagline}
        </p>
      </div>
    </div>
  );
}

function BalanceCell({
  label,
  value,
  description,
  highlight,
}: {
  label: string;
  value: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white px-6 py-5">
      <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums ${highlight ? "text-brand-blue" : "text-brand-navy"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
