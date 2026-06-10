"use server";

import { headers } from "next/headers";

import { requireClient, requireFinanceStaff } from "@/lib/auth/guards";
import { notifyWalletEvent } from "@/lib/notifications/service";
import { fetchTransactions } from "@/lib/transactions/queries";
import { TRANSACTION_TYPE_LABELS } from "@/lib/transactions/constants";
import { formatCurrency } from "@/lib/loans/queries";
import type { TransactionActionState, TransactionFilters } from "@/types/transactions";

function buildCsv(rows: Awaited<ReturnType<typeof fetchTransactions>>): string {
  const header = [
    "Date",
    "Transaction Number",
    "Type",
    "Description",
    "Direction",
    "Amount",
    "Status",
    "Reference Number",
    "Loan Number",
  ];

  const lines = rows.map((row) =>
    [
      row.createdAt,
      row.transactionNumber,
      TRANSACTION_TYPE_LABELS[row.transactionType],
      `"${row.description.replace(/"/g, '""')}"`,
      row.direction,
      row.amount.toFixed(2),
      row.status,
      row.referenceNumber,
      row.loanNumber ?? "",
    ].join(","),
  );

  return [header.join(","), ...lines].join("\n");
}

function buildStatementHtml(input: {
  customerName: string;
  accountNumber: string;
  loanNumber?: string;
  openingBalance: number;
  closingBalance: number;
  rows: Awaited<ReturnType<typeof fetchTransactions>>;
  generatedAt: string;
}) {
  const rowsHtml = input.rows
    .map(
      (row) => `
      <tr>
        <td>${new Date(row.createdAt).toLocaleDateString()}</td>
        <td>${row.transactionNumber}</td>
        <td>${TRANSACTION_TYPE_LABELS[row.transactionType]}</td>
        <td>${row.description}</td>
        <td style="text-align:right">${row.direction === "credit" ? "+" : "−"}${formatCurrency(row.amount)}</td>
        <td>${row.status}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Orbit Lending Account Statement</title>
<style>
body{font-family:Arial,sans-serif;color:#111827;padding:40px}
.header{border-bottom:2px solid #2563EB;padding-bottom:16px;margin-bottom:24px}
.brand{font-size:24px;font-weight:800;color:#201747}
.notice{margin-top:24px;padding:12px;background:#F8FAFC;border:1px solid #E5E7EB;border-radius:8px;font-size:12px;color:#4B5563}
table{width:100%;border-collapse:collapse;margin-top:24px;font-size:13px}
th,td{border-bottom:1px solid #E5E7EB;padding:10px;text-align:left}
th{font-size:11px;text-transform:uppercase;color:#6B7280}
.summary{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:16px}
.card{background:#F8FAFC;border:1px solid #E5E7EB;border-radius:8px;padding:12px}
</style></head>
<body>
  <div class="header">
    <div class="brand">Orbit Lending</div>
    <div>Account Statement</div>
  </div>
  <div class="summary">
    <div class="card"><strong>Customer</strong><br>${input.customerName}</div>
    <div class="card"><strong>Account Number</strong><br>${input.accountNumber}</div>
    <div class="card"><strong>Opening Balance</strong><br>${formatCurrency(input.openingBalance)}</div>
    <div class="card"><strong>Closing Balance</strong><br>${formatCurrency(input.closingBalance)}</div>
    ${input.loanNumber ? `<div class="card"><strong>Loan Number</strong><br>${input.loanNumber}</div>` : ""}
    <div class="card"><strong>Generated</strong><br>${input.generatedAt}</div>
  </div>
  <table>
    <thead><tr><th>Date</th><th>Transaction ID</th><th>Type</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <div class="notice">Banking Infrastructure Powered by Pathward National Bank. This statement is generated electronically and is valid without signature.</div>
</body></html>`;
}

export async function exportTransactionsCsvAction(
  filters?: TransactionFilters,
): Promise<{ csv?: string; error?: string }> {
  const ctx = await requireClient();
  const rows = await fetchTransactions({
    borrowerId: ctx.user.id,
    filters,
    limit: 1000,
  });

  return { csv: buildCsv(rows) };
}

export async function exportFinanceTransactionsCsvAction(
  filters?: TransactionFilters,
): Promise<{ csv?: string; error?: string }> {
  await requireFinanceStaff();
  const rows = await fetchTransactions({ filters, limit: 5000 });
  return { csv: buildCsv(rows) };
}

export async function generateAccountStatementAction(input?: {
  dateFrom?: string;
  dateTo?: string;
  loanNumber?: string;
}): Promise<{ html?: string; error?: string }> {
  const ctx = await requireClient();
  const rows = await fetchTransactions({
    borrowerId: ctx.user.id,
    filters: {
      dateFrom: input?.dateFrom,
      dateTo: input?.dateTo,
      loanNumber: input?.loanNumber,
    },
    limit: 1000,
  });

  const name =
    `${ctx.profile?.first_name ?? ""} ${ctx.profile?.last_name ?? ""}`.trim() ||
    ctx.user.email ||
    "Client";

  const openingBalance = rows.length
    ? rows[rows.length - 1]?.previousBalance ?? 0
    : 0;
  const closingBalance = rows[0]?.newBalance ?? openingBalance;

  const html = buildStatementHtml({
    customerName: name,
    accountNumber: ctx.user.id.slice(0, 8).toUpperCase(),
    loanNumber: input?.loanNumber,
    openingBalance,
    closingBalance,
    rows,
    generatedAt: new Date().toLocaleString(),
  });

  await notifyWalletEvent(ctx.user.id, {
    title: "Statement Generated",
    message: "Your Orbit Lending account statement has been generated.",
    type: "general",
    actionUrl: "/dashboard/transactions",
  });

  return { html };
}

export async function notifyTransactionEvent(
  userId: string,
  title: string,
  message: string,
) {
  await notifyWalletEvent(userId, {
    title,
    message,
    type: "general",
    actionUrl: "/dashboard/transactions",
    priority: "high",
  });
}

export async function softDeleteTransactionAction(
  transactionId: string,
  reason: string,
): Promise<TransactionActionState> {
  const ctx = await requireFinanceStaff();
  const { createClient } = await import("@/lib/supabase/server");
  const { logAuditEntry } = await import("@/lib/finance/audit");
  const supabase = await createClient();

  const { data: tx } = await supabase
    .from("platform_transactions")
    .select("*")
    .eq("id", transactionId)
    .maybeSingle();

  if (!tx || tx.deleted_at) {
    return { error: "Transaction not found." };
  }

  await supabase
    .from("platform_transactions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", transactionId);

  await logAuditEntry({
    action: "transaction.soft_deleted",
    entityType: "platform_transaction",
    entityId: transactionId,
    oldValues: { deleted_at: null },
    newValues: { deleted_at: new Date().toISOString(), reason },
  });

  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  await supabase.from("transaction_timeline_events").insert({
    transaction_id: transactionId,
    event_type: "soft_deleted",
    title: "Soft Deleted",
    description: reason,
    actor_id: ctx.user.id,
    metadata: { ipAddress },
  });

  return { success: "Transaction archived (soft delete)." };
}
