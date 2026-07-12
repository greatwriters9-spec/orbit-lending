"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";

import { useCompany } from "@/components/providers/company-provider";
import { formatCurrency } from "@/lib/loans/queries";
import { cn } from "@/lib/utils";
import { PATHWARD_BANK, type PathwardLinkedAccount } from "@/types/wallet";

type PathwardAccountStatCardProps = {
  linkedAccount: PathwardLinkedAccount | null;
  withdrawableBalance: number;
  className?: string;
};

export function PathwardAccountStatCard({
  linkedAccount,
  withdrawableBalance,
  className,
}: PathwardAccountStatCardProps) {
  const { branding } = useCompany();

  if (!linkedAccount) {
    return (
      <div
        className={cn(
          "group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-brand-blue/20 bg-brand-navy p-6 shadow-[var(--shadow-elevated)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] md:p-7",
          className,
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-8 -right-8 size-32 rounded-full bg-brand-blue/10"
        />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-wider text-white/55 uppercase">
              Linked Pathward Account
            </p>
            <p className="mt-3 text-[28px] font-bold leading-[1.1] text-white">Not linked</p>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/20 text-white ring-1 ring-white/10">
            <Building2 className="size-5" strokeWidth={1.75} />
          </div>
        </div>
        <p className="relative mt-4 flex-1 text-sm leading-relaxed text-white/60">
          Your funding account will appear here once {branding.institutionName} activates it.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-brand-blue/20 bg-brand-navy p-6 shadow-[var(--shadow-elevated)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] md:p-7",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-8 -right-8 size-32 rounded-full bg-brand-blue/10"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-wider text-white/55 uppercase">
            Linked Pathward Account
          </p>
          <p className="mt-3 text-[28px] font-bold leading-[1.1] tabular-nums text-white">
            {formatCurrency(linkedAccount.accountBalance)}
          </p>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/20 text-white ring-1 ring-white/10">
          <Building2 className="size-5" strokeWidth={1.75} />
        </div>
      </div>

      <p className="relative mt-4 text-sm leading-relaxed text-white/60">
        {PATHWARD_BANK.name}
      </p>

      <div className="relative mt-4 space-y-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3">
        <DetailRow label="Routing" value={linkedAccount.routingNumber} />
        <DetailRow
          label="Account"
          value={`••••${linkedAccount.accountNumberLast4}`}
        />
        <DetailRow label="Holder" value={linkedAccount.accountHolderName} />
      </div>

      <div className="relative mt-3 flex items-center justify-between gap-2 text-xs font-semibold text-blue-200">
        <span>{formatCurrency(withdrawableBalance)} withdrawable</span>
        <Link href="/wallet" className="hover:text-white">
          Manage →
        </Link>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-white/45">{label}</span>
      <span className="truncate font-medium text-white/85">{value}</span>
    </div>
  );
}
