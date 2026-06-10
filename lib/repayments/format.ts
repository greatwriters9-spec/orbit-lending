import { formatCurrency } from "@/lib/loans/queries";

export function formatRepaymentCurrency(amount: number): string {
  return formatCurrency(amount);
}

export function daysUntilDue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
