import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { WithdrawalForm } from "@/components/wallet";
import { requireClient } from "@/lib/auth/guards";
import { fetchWalletForUser } from "@/lib/wallet/queries";
import { PATHWARD_BANK } from "@/types/wallet";

export const metadata = {
  title: "Request Withdrawal | Orbit Mortgage",
};

export default async function WithdrawPage() {
  const { user } = await requireClient();
  const wallet = await fetchWalletForUser(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/wallet"
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-blue/80"
      >
        <ArrowLeft className="size-4" />
        Back to Funding Account
      </Link>

      <div className="rounded-lg border border-brand-border bg-brand-background/50 px-4 py-3 text-xs text-muted-foreground">
        Withdrawals are processed through {PATHWARD_BANK.name}. Funds remain in
        pending balance until loan officer approval.
      </div>

      <WithdrawalForm wallet={wallet} />
    </div>
  );
}

