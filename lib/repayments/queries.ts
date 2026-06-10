import { createClient } from "@/lib/supabase/server";
import {
  calculateLoanHealth,
  calculateRepaymentProgress,
} from "@/lib/repayments/health";
import type {
  FinanceRepaymentQueueItem,
  LoanRepayment,
  LoanRepaymentSummary,
  PaymentSubmission,
} from "@/types/repayments";

export { daysUntilDue, formatRepaymentCurrency } from "@/lib/repayments/format";

function mapRepayment(row: Record<string, unknown>): LoanRepayment {
  return {
    id: row.id as string,
    loan_id: row.loan_id as string,
    borrower_id: row.borrower_id as string,
    installment_number: Number(row.installment_number),
    due_date: row.due_date as string,
    principal_amount: Number(row.principal_amount),
    interest_amount: Number(row.interest_amount),
    installment_amount: Number(row.installment_amount),
    remaining_balance_before: Number(row.remaining_balance_before),
    remaining_balance_after: Number(row.remaining_balance_after),
    status: row.status as LoanRepayment["status"],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapSubmission(row: Record<string, unknown>): PaymentSubmission {
  return {
    id: row.id as string,
    repayment_id: row.repayment_id as string,
    borrower_id: row.borrower_id as string,
    payment_method: row.payment_method as PaymentSubmission["payment_method"],
    amount: Number(row.amount),
    reference_number: row.reference_number as string,
    proof_document_url: (row.proof_document_url as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    submitted_at: row.submitted_at as string,
    reviewed_by: (row.reviewed_by as string | null) ?? null,
    reviewed_at: (row.reviewed_at as string | null) ?? null,
    review_notes: (row.review_notes as string | null) ?? null,
    status: row.status as PaymentSubmission["status"],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function fetchActiveLoanForUser(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("loans")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  return data;
}

export async function fetchClientRepaymentSummary(
  userId: string,
): Promise<LoanRepaymentSummary | null> {
  const supabase = await createClient();
  const loan = await fetchActiveLoanForUser(userId);

  if (!loan) {
    return null;
  }

  const [{ data: scheduleRows }, { data: submissionRows }] = await Promise.all([
    supabase
      .from("loan_repayments")
      .select("*")
      .eq("loan_id", loan.id)
      .order("installment_number", { ascending: true }),
    supabase
      .from("payment_submissions")
      .select("*")
      .eq("borrower_id", userId)
      .eq("status", "pending")
      .order("submitted_at", { ascending: false }),
  ]);

  const schedule = (scheduleRows ?? []).map(mapRepayment);
  const pendingSubmissions = (submissionRows ?? []).map(mapSubmission);
  const nextPayment =
    schedule.find((item) =>
      ["upcoming", "due_today", "late", "overdue", "pending_verification"].includes(
        item.status,
      ),
    ) ?? null;

  const remainingInstallments = schedule.filter(
    (item) => !["paid", "waived"].includes(item.status),
  ).length;

  const health = calculateLoanHealth({ schedule });

  return {
    loanId: loan.id,
    loanNumber: loan.loan_number ?? loan.application_id.slice(0, 8).toUpperCase(),
    applicationId: loan.application_id,
    outstandingBalance: Number(loan.remaining_balance),
    totalPaid: Number(loan.total_paid_amount ?? 0),
    nextPayment,
    remainingInstallments,
    repaymentProgressPercent: Number(loan.repayment_progress_percent ?? 0),
    loanHealthRating: loan.loan_health_rating ?? health.rating,
    loanHealthScore: Number(loan.loan_health_score ?? health.score),
    schedule,
    pendingSubmissions,
  };
}

export async function fetchFinanceRepaymentQueue(): Promise<
  FinanceRepaymentQueueItem[]
> {
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from("payment_submissions")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });

  if (!submissions?.length) {
    return [];
  }

  const repaymentIds = submissions.map((item) => item.repayment_id);
  const { data: repayments } = await supabase
    .from("loan_repayments")
    .select("*")
    .in("id", repaymentIds);

  const repaymentMap = new Map(
    (repayments ?? []).map((item) => [item.id, mapRepayment(item)]),
  );

  const loanIds = [...new Set((repayments ?? []).map((item) => item.loan_id))];
  const { data: loans } = await supabase
    .from("loans")
    .select("id, loan_number, application_id, user_id")
    .in("id", loanIds);

  const loanMap = new Map((loans ?? []).map((item) => [item.id, item]));
  const userIds = [...new Set((loans ?? []).map((item) => item.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((item) => [item.id, item]));

  return submissions
    .map((row) => {
      const submission = mapSubmission(row);
      const repayment = repaymentMap.get(submission.repayment_id);
      if (!repayment) {
        return null;
      }

      const loan = loanMap.get(repayment.loan_id);
      const profile = loan ? profileMap.get(loan.user_id) : null;
      const borrowerName = profile
        ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
        : "Borrower";

      return {
        submission,
        repayment,
        loanNumber:
          loan?.loan_number ??
          loan?.application_id.slice(0, 8).toUpperCase() ??
          "—",
        borrowerName: borrowerName || "Borrower",
        borrowerEmail: profile?.email ?? "—",
        installmentNumber: repayment.installment_number,
        dueDate: repayment.due_date,
      };
    })
    .filter((item): item is FinanceRepaymentQueueItem => item !== null);
}
