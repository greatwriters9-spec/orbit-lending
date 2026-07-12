"use client";

import Link from "next/link";
import { Building2, Wallet } from "lucide-react";

import { useCompany } from "@/components/providers/company-provider";
import { formatCurrency } from "@/lib/loans/queries";
import { PATHWARD_BANK, type PathwardLinkedAccount } from "@/types/wallet";

type PathwardAccountCardProps = {
  linkedAccount: PathwardLinkedAccount | null;
  withdrawableBalance: number;
};

export function PathwardAccountCard({
  linkedAccount,
  withdrawableBalance,
}: PathwardAccountCardProps) {
  const { branding } = useCompany();

  if (!linkedAccount) {
    return (
      <section className="card-surface overflow-hidden">
        <div className="border-b border-brand-border bg-brand-navy px-6 py-6 text-white md:px-8">
          <p className="type-section-label text-white/50">Pathward Account</p>
          <h2 className="mt-2 text-xl font-bold leading-tight text-white">No linked account yet</h2>
          <p className="type-body mt-2 max-w-2xl text-white/60">
            Your funding account will appear here once {branding.institutionName} activates it after approval.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="card-surface overflow-hidden">
      <div className="border-b border-brand-border bg-brand-navy px-6 py-8 text-white md:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-brand-blue/20">
                <Building2 className="size-5 text-white" />
              </div>
              <div>
                <p className="type-section-label text-white/50">
                  Linked Pathward Account
                </p>
                <p className="type-body-medium mt-1 text-white">{PATHWARD_BANK.name}</p>
              </div>
            </div>

            <p className="type-section-label mt-6 text-white/50">Account Balance</p>
            <p className="mt-2 text-[28px] font-bold leading-[1.1] tabular-nums text-white">
              {formatCurrency(linkedAccount.accountBalance)}
            </p>
            <p className="type-body mt-2 text-white/60">
              Updated when deposits are posted to your Pathward account.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Detail label="Account Holder" value={linkedAccount.accountHolderName} />
              <Detail label="Routing Number" value={linkedAccount.routingNumber} />
              <Detail
                label="Account Number"
                value={`••••${linkedAccount.accountNumberLast4}`}
              />
              <Detail
                label="Linked On"
                value={
                  linkedAccount.linkedAt
                    ? new Date(linkedAccount.linkedAt).toLocaleDateString()
                    : "—"
                }
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/12 bg-white/6 px-5 py-5">
            <div className="flex items-center gap-2 text-white/70">
              <Wallet className="size-4" />
              <p className="type-section-label text-white/50">Withdrawable Balance</p>
            </div>
            <p className="type-data-value mt-2 text-white">
              {formatCurrency(withdrawableBalance)}
            </p>
            <p className="mt-1 text-xs text-white/60">
              Available for withdrawal requests.
            </p>
            <Link
              href="/wallet"
              className="mt-4 inline-flex text-xs font-semibold text-brand-blue hover:text-brand-blue/80"
            >
              Manage funding account →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/10 px-3 py-2.5">
      <p className="type-section-label text-white/50">{label}</p>
      <p className="type-body-medium mt-1 text-white/90">{value}</p>
    </div>
  );
}
