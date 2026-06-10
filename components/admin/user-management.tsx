"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  holdAccountAction,
  reactivateAccountAction,
  restrictAccountAction,
  suspendAccountAction,
  updateAccountStatusAction,
  updateUserRoleAction,
} from "@/lib/admin/users/actions";
import { RoleBadge } from "@/components/ui-kit/role-badge";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import {
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUSES,
} from "@/lib/auth/account-status";
import { getRoleLabel } from "@/lib/auth/roles";
import type { AdminUserDetail } from "@/types/admin";
import type { AccountStatus, UserRole } from "@/types/profile";

type AccountStatusPanelProps = {
  user: AdminUserDetail;
  canManageStatus: boolean;
  canChangeRole: boolean;
  usersBasePath: string;
};

export function AccountStatusPanel({
  user,
  canManageStatus,
  canChangeRole,
}: AccountStatusPanelProps) {
  const [reason, setReason] = useState("");
  const [newStatus, setNewStatus] = useState<AccountStatus>(
    user.accountStatus as AccountStatus,
  );
  const [newRole, setNewRole] = useState(user.role);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!canManageStatus && !canChangeRole) {
    return null;
  }

  function run(action: () => Promise<{ error?: string; success?: string }>) {
    startTransition(async () => {
      const result = await action();
      setFeedback(result.error ?? result.success ?? null);
    });
  }

  return (
    <section className="card-surface space-y-5 p-6">
      <div>
        <h3 className="text-sm font-semibold text-brand-navy">Account Controls</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Chief Lending Officer actions for account governance and role assignment.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <RoleBadge role={user.role as UserRole} />
        <span className="rounded-md border border-brand-border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-navy">
          {ACCOUNT_STATUS_LABELS[user.accountStatus as keyof typeof ACCOUNT_STATUS_LABELS] ??
            user.accountStatus}
        </span>
      </div>

      {user.accountStatusReason ? (
        <p className="text-sm text-muted-foreground">
          Current reason: {user.accountStatusReason}
        </p>
      ) : null}

      {canManageStatus ? (
        <div className="space-y-4 border-t border-brand-border pt-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-brand-navy">Reason *</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Document the reason for this administrative action..."
              className="w-full rounded-lg border border-brand-border bg-transparent px-3 py-2 text-sm"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <QuickAction
              label="Reactivate"
              disabled={isPending || !reason.trim()}
              onClick={() =>
                run(() => reactivateAccountAction(user.id, reason))
              }
            />
            <QuickAction
              label="Restrict"
              disabled={isPending || !reason.trim()}
              onClick={() => run(() => restrictAccountAction(user.id, reason))}
            />
            <QuickAction
              label="On Hold"
              disabled={isPending || !reason.trim()}
              onClick={() => run(() => holdAccountAction(user.id, reason))}
            />
            <QuickAction
              label="Suspend"
              tone="danger"
              disabled={isPending || !reason.trim()}
              onClick={() => run(() => suspendAccountAction(user.id, reason))}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as AccountStatus)}
              className="h-10 rounded-lg border border-brand-border bg-transparent px-3 text-sm"
            >
              {ACCOUNT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {ACCOUNT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <Button
              type="button"
              disabled={isPending || !reason.trim()}
              onClick={() =>
                run(() =>
                  updateAccountStatusAction({
                    userId: user.id,
                    accountStatus: newStatus,
                    reason,
                  }),
                )
              }
              className="h-10 bg-brand-navy text-white hover:bg-brand-navy/90"
            >
              Apply Status
            </Button>
          </div>
        </div>
      ) : null}

      {canChangeRole ? (
        <div className="space-y-3 border-t border-brand-border pt-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-brand-navy">Assign Role</span>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="h-10 w-full rounded-lg border border-brand-border bg-transparent px-3 text-sm"
            >
              {(["client", "finance_officer", "admin", "super_admin"] as UserRole[]).map(
                (role) => (
                  <option key={role} value={role}>
                    {getRoleLabel(role)}
                  </option>
                ),
              )}
            </select>
          </label>
          <Button
            type="button"
            disabled={isPending || !reason.trim()}
            onClick={() =>
              run(() =>
                updateUserRoleAction({
                  userId: user.id,
                  role: newRole as UserRole,
                  reason,
                }),
              )
            }
            className="h-10 bg-brand-blue text-white hover:bg-brand-blue/90"
          >
            Update Role
          </Button>
        </div>
      ) : null}

      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
    </section>
  );
}

function QuickAction({
  label,
  onClick,
  disabled,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        tone === "danger"
          ? "rounded-lg bg-brand-danger/10 px-3 py-1.5 text-xs font-semibold text-brand-danger disabled:opacity-50"
          : "rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-navy disabled:opacity-50"
      }
    >
      {label}
    </button>
  );
}

type UsersTableProps = {
  users: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    accountStatus: string;
    applicationCount: number;
  }>;
  basePath?: string;
};

export function UsersTable({ users, basePath = "/admin/users" }: UsersTableProps) {
  return (
    <div className="card-surface overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-brand-border bg-brand-background/60 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-semibold">User</th>
            <th className="px-6 py-3 font-semibold">Role</th>
            <th className="px-6 py-3 font-semibold">Account Status</th>
            <th className="px-6 py-3 font-semibold">Applications</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {users.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-brand-background/40">
                <td className="px-6 py-4">
                  <Link
                    href={`${basePath}/${user.id}`}
                    className="font-semibold text-brand-navy hover:text-brand-blue"
                  >
                    {user.firstName} {user.lastName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <RoleBadge role={user.role as UserRole} />
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {ACCOUNT_STATUS_LABELS[
                    user.accountStatus as keyof typeof ACCOUNT_STATUS_LABELS
                  ] ?? user.accountStatus}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {user.applicationCount}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function UserSearchForm({ basePath }: { basePath: string }) {
  return (
    <form method="get" className="flex flex-wrap gap-3">
      <Input
        name="search"
        placeholder="Search by name or email..."
        className="h-10 min-w-[220px] flex-1"
      />
      <select
        name="role"
        className="h-10 rounded-lg border border-brand-border bg-transparent px-3 text-sm"
        defaultValue=""
      >
        <option value="">All roles</option>
        <option value="client">Client</option>
        <option value="finance_officer">Loan Officer</option>
        <option value="admin">Credit Manager</option>
        <option value="super_admin">Chief Lending Officer</option>
      </select>
      <select
        name="accountStatus"
        className="h-10 rounded-lg border border-brand-border bg-transparent px-3 text-sm"
        defaultValue=""
      >
        <option value="">All statuses</option>
        {ACCOUNT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {ACCOUNT_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      <Button type="submit" className="h-10 bg-brand-navy text-white">
        Filter
      </Button>
      <Link
        href={basePath}
        className="inline-flex h-10 items-center px-4 text-sm font-medium text-brand-blue"
      >
        Clear
      </Link>
    </form>
  );
}
