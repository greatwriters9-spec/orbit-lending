import type { ComponentType } from "react";
import Link from "next/link";

import { StatCard } from "@/components/ui-kit/stat-card";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { LayoutDashboard, Settings, Users, Wallet } from "lucide-react";

export const metadata = {
  title: "Credit Manager Dashboard | Orbit Mortgage",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 md:space-y-9">
      <section className="card-surface overflow-hidden">
        <div className="border-b border-brand-border bg-brand-navy px-6 py-8 text-white md:px-8">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-white/45 uppercase">
            Credit Manager Portal
          </p>
          <h1 className="heading-primary-light mt-2 text-3xl md:text-4xl">
            Credit Manager Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
            Manage platform users, oversee mortgage operations, and access loan
            officer tools.
          </p>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="User Management"
          value="—"
          description="Manage client and staff accounts."
          icon={Users}
          variant="featured"
        />
        <StatCard
          title="Loan Officer Portal"
          value="Active"
          description="Access funding and withdrawal workflows."
          icon={Wallet}
          variant="success"
        />
        <StatCard
          title="System Settings"
          value="—"
          description="Configure platform operations."
          icon={Settings}
          variant="default"
        />
      </section>

      <SectionHeader
        title="Quick Access"
        description="Credit management tools and cross-portal navigation."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PortalLink
          href="/admin/users"
          title="User Management"
          description="View and manage user accounts and roles."
          icon={Users}
        />
        <PortalLink
          href="/finance/dashboard"
          title="Loan Officer Portal"
          description="Review applications, fund mortgages, and approve withdrawals."
          icon={Wallet}
        />
        <PortalLink
          href="/admin/settings"
          title="Settings"
          description="Platform configuration and preferences."
          icon={LayoutDashboard}
        />
      </div>
    </div>
  );
}

function PortalLink({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="card-surface group flex flex-col gap-3 p-6 transition-shadow hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className="font-semibold text-brand-navy group-hover:text-brand-blue">
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

