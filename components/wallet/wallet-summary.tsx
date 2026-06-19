import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Clock,
  Copy,
  Landmark,
  Shield,
  Wallet as WalletIcon,
} from "lucide-react";

import { StatCard } from "@/components/ui-kit/stat-card";
import { formatCurrency } from "@/lib/loans/queries";
import {
  PATHWARD_BANK,
  type PathwardLinkedAccount,
  type Wallet,
} from "@/types/wallet";

type WalletSummaryProps = {
  wallet: Wallet;
  linkedAccount: PathwardLinkedAccount | null;
};

export function WalletSummary({ wallet, linkedAccount }: WalletSummaryProps) {
  const accountBalance = linkedAccount?.accountBalance ?? 0;
  const withdrawableReleased = Boolean(linkedAccount?.withdrawableApprovedAt);
  const totalBalance =
    accountBalance + wallet.pendingBalance + wallet.reservedBalance;

  return (
    <div className="space-y-6">
      <section className="card-surface overflow-hidden">
        <div className="border-b border-brand-border bg-brand-navy px-6 py-8 text-white md:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-white/45 uppercase">
                Account Balance
              </p>
              <h1 className="heading-primary-light mt-2 text-3xl md:text-4xl">
                {formatCurrency(accountBalance)}
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Linked funding account for your mortgage closing and disbursements.
              </p>

              <div className="mt-5 rounded-xl border border-white/12 bg-white/5 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-brand-blue/20">
                    <Building2 className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.08em] text-white/45 uppercase">
                      Linked Pathward Account
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {PATHWARD_BANK.name}
                    </p>
                  </div>
                </div>

                {linkedAccount ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <AccountDetail
                      label="Account Holder"
                      value={linkedAccount.accountHolderName}
                    />
                    <AccountDetail
                      label="Routing Number"
                      value={linkedAccount.routingNumber}
                    />
                    <AccountDetail
                      label="Account Number"
                      value={`••••${linkedAccount.accountNumberLast4}`}
                    />
                    <AccountDetail
                      label="Linked On"
                      value={
                        linkedAccount.linkedAt
                          ? new Date(linkedAccount.linkedAt).toLocaleDateString()
                          : "—"
                      }
                    />
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-white/70">
                    Your funding account isn&apos;t linked yet. Our team will set this up once your mortgage is approved.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/12 bg-white/6 px-5 py-5">
              <p className="text-[10px] font-semibold tracking-[0.08em] text-white/45 uppercase">
                Withdrawable Balance
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                {formatCurrency(wallet.availableBalance)}
              </p>
              <p className="mt-1 text-xs text-white/60">
                {withdrawableReleased
                  ? "Available now for withdrawal requests."
                  : "Available after your mortgage is approved and funds are released."}
              </p>
              <div className="mt-4 rounded-lg border border-white/10 bg-black/15 px-3.5 py-3">
                <p className="text-[10px] font-semibold tracking-wide text-white/50 uppercase">
                  Banking Partner
                </p>
                <p className="mt-1 text-sm font-medium text-white/90">
                  {PATHWARD_BANK.infrastructure}
                </p>
                <p className="mt-2 text-xs text-white/55">{PATHWARD_BANK.tagline}</p>
              </div>
              {linkedAccount ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-white/15 px-2.5 py-1.5 text-xs text-white/75">
                  <Copy className="size-3.5" />
                  Account ending in {linkedAccount.accountNumberLast4}
                </div>
              ) : null}
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
          description="Lifetime mortgage disbursements"
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
          title="Mortgage Exposure"
          value={formatCurrency(wallet.currentLoanExposure)}
          description="Current outstanding mortgage"
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

function AccountDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/10 px-3 py-2.5">
      <p className="text-[10px] font-semibold tracking-wide text-white/45 uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-white/90">{value}</p>
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

