import Link from "next/link";

import { StatCard } from "@/components/ui-kit/stat-card";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { Settings, Shield, Users, Wallet } from "lucide-react";

export const metadata = {
  title: "Chief Lending Officer Dashboard | Orbit Lending",
};

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-8 md:space-y-9">
      <section className="card-surface overflow-hidden">
        <div className="border-b border-brand-border bg-brand-navy px-6 py-8 text-white md:px-8">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-white/45 uppercase">
            Chief Lending Officer Portal
          </p>
          <h1 className="heading-primary-light mt-2 text-3xl md:text-4xl">
            Chief Lending Officer Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
            Full platform oversight including staff roles, credit management,
            and loan operations.
          </p>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Staff & Roles"
          value="—"
          description="Manage staff accounts and role assignments."
          icon={Users}
          variant="featured"
        />
        <StatCard
          title="Credit Manager Portal"
          value="Active"
          description="Credit management and lending oversight tools."
          icon={Shield}
          variant="default"
        />
        <StatCard
          title="Loan Officer Portal"
          value="Active"
          description="Loan funding and withdrawal approvals."
          icon={Wallet}
          variant="success"
        />
        <StatCard
          title="Configuration"
          value="—"
          description="System-wide platform settings."
          icon={Settings}
          variant="warning"
        />
      </section>

      <SectionHeader
        title="Portal Access"
        description="Navigate to all lending institution administration areas."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink href="/super-admin/staff" label="Staff & Roles" />
        <QuickLink href="/admin" label="Credit Manager Portal" />
        <QuickLink href="/finance/dashboard" label="Loan Officer Portal" />
        <QuickLink href="/super-admin/settings" label="System Config" />
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="card-surface px-5 py-4 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-background/60 hover:text-brand-blue"
    >
      {label} →
    </Link>
  );
}
