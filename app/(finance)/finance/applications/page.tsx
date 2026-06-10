import Link from "next/link";

import { ApplicationsQueueTable } from "@/components/finance/applications-queue-table";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { fetchFinanceApplicationsQueue } from "@/lib/finance/queries";
import type { ApplicationStatus } from "@/types/application-details";

export const metadata = {
  title: "Applications Queue | Orbit Lending",
};

const FILTERS: Array<{ label: string; value?: ApplicationStatus }> = [
  { label: "All Active" },
  { label: "Submitted", value: "submitted" },
  { label: "Under Review", value: "under_review" },
  { label: "Info Required", value: "information_required" },
  { label: "Pre-Approved", value: "pre_approved" },
  { label: "Pending Approval", value: "pending_finance_approval" },
  { label: "Approved", value: "approved" },
];

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function FinanceApplicationsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const statusFilter = FILTERS.find((f) => f.value === status)?.value;
  const applications = await fetchFinanceApplicationsQueue(statusFilter);

  return (
    <div className="space-y-8">
      <section className="card-surface overflow-hidden">
        <div className="border-b border-brand-border bg-brand-navy px-6 py-8 text-white md:px-8">
          <h1 className="heading-primary-light text-3xl">Applications Queue</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            Review, negotiate, and manage loan applications through the finance
            approval workflow.
          </p>
        </div>
      </section>

      <SectionHeader
        title={`${applications.length} Application${applications.length === 1 ? "" : "s"}`}
        description="Filter by status to focus your review queue."
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const href = filter.value
            ? `/finance/applications?status=${filter.value}`
            : "/finance/applications";
          const isActive = statusFilter === filter.value || (!statusFilter && !filter.value);

          return (
            <Link
              key={filter.label}
              href={href}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-brand-blue bg-brand-blue text-white"
                  : "border-brand-border bg-white text-brand-navy hover:border-brand-blue/30"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <ApplicationsQueueTable applications={applications} />
    </div>
  );
}
