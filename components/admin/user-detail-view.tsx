import Link from "next/link";

import { UserCommunicationHistory } from "@/components/admin/user-communication-history";
import { AccountStatusPanel } from "@/components/admin/user-management";
import { DownPaymentReviewPanel } from "@/components/finance/down-payment-review-panel";
import { extractPreQualification } from "@/lib/onboarding/parse-application";
import { RoleBadge } from "@/components/ui-kit/role-badge";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { ACCOUNT_STATUS_LABELS } from "@/lib/auth/account-status";
import { getRoleLabel } from "@/lib/auth/roles";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import { formatCurrency } from "@/lib/loans/queries";
import type { EmailCommunicationLog } from "@/lib/email/types";
import type {
  AdminUserApplication,
  AdminUserDetail,
  AdminUserFundingApplication,
  AdminUserMessage,
  AdminUserTransaction,
  AdminUserWallet,
} from "@/types/admin";
import type { UserRole } from "@/types/profile";

type UserDetailViewProps = {
  user: AdminUserDetail;
  applications: AdminUserApplication[];
  loans: AdminUserApplication[];
  wallet: AdminUserWallet | null;
  transactions: AdminUserTransaction[];
  messages: AdminUserMessage[];
  emailLogs?: EmailCommunicationLog[];
  canManageStatus: boolean;
  canChangeRole: boolean;
  usersBasePath: string;
  activeTab?: string;
  fundingApplication?: AdminUserFundingApplication | null;
};

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "applications", label: "Applications" },
  { id: "loans", label: "Loans" },
  { id: "wallet", label: "Funding Account" },
  { id: "transactions", label: "Transactions" },
  { id: "messages", label: "Messages" },
  { id: "communications", label: "Communications" },
] as const;

export function UserDetailView({
  user,
  applications,
  loans,
  wallet,
  transactions,
  messages,
  emailLogs = [],
  canManageStatus,
  canChangeRole,
  usersBasePath,
  activeTab = "profile",
  fundingApplication = null,
}: UserDetailViewProps) {
  const name =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email;

  return (
    <div className="space-y-6">
      <Link
        href={usersBasePath}
        className="text-sm font-medium text-brand-blue hover:text-brand-blue/80"
      >
        ← Back to users
      </Link>

      <div className="card-surface p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="heading-primary text-2xl md:text-3xl">{name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RoleBadge role={user.role as UserRole} />
            <span className="rounded-md border border-brand-border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
              {ACCOUNT_STATUS_LABELS[
                user.accountStatus as keyof typeof ACCOUNT_STATUS_LABELS
              ] ?? user.accountStatus}
            </span>
          </div>
        </div>
      </div>

      {(canManageStatus || canChangeRole) && (
        <AccountStatusPanel
          user={user}
          canManageStatus={canManageStatus}
          canChangeRole={canChangeRole}
          usersBasePath={usersBasePath}
        />
      )}

      {canManageStatus && fundingApplication ? (
        <DownPaymentReviewPanel
          applicationId={fundingApplication.id}
          personalInfo={fundingApplication.personalInfo}
          pathwardBalance={user.pathwardAccountBalance}
          fallbackDownPayment={
            extractPreQualification(fundingApplication.personalInfo)
              ?.estimatedDownPayment ?? 0
          }
        />
      ) : null}

      <nav className="flex flex-wrap gap-2 border-b border-brand-border pb-1">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={`${usersBasePath}/${user.id}?tab=${tab.id}`}
            className={
              activeTab === tab.id
                ? "border-b-2 border-brand-blue px-3 py-2 text-sm font-semibold text-brand-blue"
                : "px-3 py-2 text-sm font-medium text-muted-foreground hover:text-brand-navy"
            }
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {activeTab === "profile" && <ProfileTab user={user} />}
      {activeTab === "applications" && <ApplicationsTab items={applications} />}
      {activeTab === "loans" && <ApplicationsTab items={loans} emptyLabel="No active mortgages." />}
      {activeTab === "wallet" && <WalletTab wallet={wallet} />}
      {activeTab === "transactions" && <TransactionsTab items={transactions} />}
      {activeTab === "messages" && <MessagesTab items={messages} />}
      {activeTab === "communications" && (
        <UserCommunicationHistory logs={emailLogs} />
      )}
    </div>
  );
}

function ProfileTab({ user }: { user: AdminUserDetail }) {
  return (
    <div className="card-surface grid gap-4 p-6 sm:grid-cols-2">
      <Info label="Role" value={getRoleLabel(user.role)} />
      <Info label="Profile Status" value={user.profileStatus} />
      <Info label="Phone" value={user.phone ?? "—"} />
      <Info label="Country" value={user.country ?? "—"} />
      <Info label="Member Since" value={formatApplicationDate(user.createdAt)} />
      <Info
        label="Status Changed"
        value={
          user.accountStatusChangedAt
            ? formatApplicationDate(user.accountStatusChangedAt)
            : "—"
        }
      />
      <Info
        label="Pathward Routing Number"
        value={user.pathwardRoutingNumber ?? "—"}
      />
      <Info
        label="Pathward Account Number"
        value={
          user.pathwardAccountNumber
            ? `••••${user.pathwardAccountNumber.slice(-4)}`
            : "—"
        }
      />
      <Info
        label="Linked Account Holder"
        value={user.pathwardAccountHolderName ?? "—"}
      />
      <Info
        label="Pathward Account Balance"
        value={formatCurrency(user.pathwardAccountBalance)}
      />
      <Info
        label="Linked On"
        value={user.pathwardLinkedAt ? formatApplicationDate(user.pathwardLinkedAt) : "—"}
      />
      {user.accountStatusReason ? (
        <div className="sm:col-span-2">
          <Info label="Status Reason" value={user.accountStatusReason} />
        </div>
      ) : null}
    </div>
  );
}

function ApplicationsTab({
  items,
  emptyLabel = "No applications found.",
}: {
  items: AdminUserApplication[];
  emptyLabel?: string;
}) {
  if (!items.length) {
    return <EmptyState message={emptyLabel} />;
  }

  return (
    <div className="card-surface overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-brand-border bg-brand-background/60 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-6 py-3">Application</th>
            <th className="px-6 py-3">Product</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 font-medium text-brand-navy">
                {item.applicationNumber}
              </td>
              <td className="px-6 py-4 text-muted-foreground">{item.productSlug}</td>
              <td className="px-6 py-4 text-muted-foreground">
                {formatCurrency(item.requestedAmount)}
              </td>
              <td className="px-6 py-4 capitalize text-muted-foreground">
                {item.status.replace(/_/g, " ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WalletTab({ wallet }: { wallet: AdminUserWallet | null }) {
  if (!wallet) {
    return <EmptyState message="No funding account on file for this user." />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Stat label="Available Balance" value={formatCurrency(wallet.availableBalance)} />
      <Stat label="Pending Balance" value={formatCurrency(wallet.pendingBalance)} />
    </div>
  );
}

function TransactionsTab({ items }: { items: AdminUserTransaction[] }) {
  if (!items.length) {
    return <EmptyState message="No transactions recorded." />;
  }

  return (
    <div className="card-surface overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-brand-border bg-brand-background/60 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Description</th>
            <th className="px-6 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 capitalize text-brand-navy">{item.type}</td>
              <td className="px-6 py-4 text-muted-foreground">
                {formatCurrency(item.amount)}
              </td>
              <td className="px-6 py-4 text-muted-foreground">{item.description}</td>
              <td className="px-6 py-4 text-muted-foreground">
                {formatApplicationDate(item.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MessagesTab({ items }: { items: AdminUserMessage[] }) {
  if (!items.length) {
    return <EmptyState message="No messages on record." />;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="card-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-brand-navy">
              {item.senderName} · {item.applicationNumber}
            </p>
            <time className="text-xs text-muted-foreground">
              {formatApplicationDate(item.createdAt)}
            </time>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{item.message}</p>
        </div>
      ))}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-brand-navy">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-brand-navy">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="card-surface px-6 py-12 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
