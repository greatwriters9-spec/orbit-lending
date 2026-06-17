import Link from "next/link";

import { ApplicationsQueueTable } from "@/components/finance/applications-queue-table";
import { StatCard } from "@/components/ui-kit/stat-card";
import { SectionHeader } from "@/components/ui-kit/section-header";
import {
  fetchFinanceApplicationsQueue,
  fetchFinanceDashboardStats,
} from "@/lib/finance/queries";
import { ClipboardList, Clock, FileWarning, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Loan Officer Dashboard | Orbit Mortgage",
};

export default async function FinanceDashboardPage() {
  const [stats, recentApplications] = await Promise.all([
    fetchFinanceDashboardStats(),
    fetchFinanceApplicationsQueue(),
  ]);

  const preview = recentApplications.slice(0, 5);

  return (
    <div className="space-y-8 md:space-y-9">
      <section className="card-surface overflow-hidden">
        <div className="border-b border-brand-border bg-brand-navy px-6 py-8 text-white md:px-8">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-white/45 uppercase">
            Loan Officer Portal
          </p>
          <h1 className="heading-primary-light mt-2 text-3xl md:text-4xl">
            Loan Officer Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
            Review pre-approved applications, negotiate offers, request
            information, and approve funding before disbursement.
          </p>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Pending Review"
          value={String(stats.pendingReview)}
          description="Applications awaiting initial loan officer review."
          icon={Clock}
          variant="featured"
        />
        <StatCard
          title="Information Required"
          value={String(stats.informationRequired)}
          description="Awaiting applicant document uploads."
          icon={FileWarning}
          variant="warning"
        />
        <StatCard
          title="Pending Approval"
          value={String(stats.pendingApproval)}
          description="Offers accepted, awaiting final funding approval."
          icon={ClipboardList}
          variant="default"
        />
        <StatCard
          title="Approved Today"
          value={String(stats.approvedToday)}
          description="Applications approved for funding today."
          icon={CheckCircle2}
          variant="success"
        />
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          title="Recent Applications"
          description="Latest applications in the loan officer review queue."
        />
        <Link
          href="/finance/applications"
          className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
        >
          View full queue →
        </Link>
      </div>

      <ApplicationsQueueTable applications={preview} />
    </div>
  );
}

