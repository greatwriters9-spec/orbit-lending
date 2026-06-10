import {
  Bell,
  CreditCard,
  FileUp,
  LayoutDashboard,
  MessageSquare,
  Wallet,
} from "lucide-react";

import { LANDING_DASHBOARD_FEATURES } from "@/lib/landing/content";

import { SectionHeading, SectionShell } from "./shared/section-shell";

export function DashboardPreview() {
  return (
    <SectionShell tone="white">
      <SectionHeading
        eyebrow="Client Portal"
        title="Manage Everything In One Place"
        subtitle="Track applications, repayments, documents, messages, and funding activity from a single dashboard."
      />

      <div className="relative mt-14">
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-[#F8FAFC] to-white shadow-[0_24px_64px_rgba(15,23,42,0.1)]">
          <div className="border-b border-[#E5E7EB] bg-brand-navy px-6 py-4">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="size-5 text-white/80" />
              <div>
                <p className="text-xs font-semibold tracking-[0.08em] text-white/45 uppercase">
                  Orbit Client Portal
                </p>
                <p className="heading-primary-light text-base">Application Dashboard</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[420px] p-6 md:min-h-[480px] md:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              <DashboardPanel
                icon={CreditCard}
                title="Application Status"
                value="Under Review"
                detail="68% complete · Docs verified"
              />
              <DashboardPanel
                icon={Wallet}
                title="Wallet Balance"
                value="$12,450"
                detail="Available after funding"
              />
              <DashboardPanel
                icon={Bell}
                title="Notifications"
                value="3 New"
                detail="Approval update pending"
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <div className="flex items-center gap-2 text-brand-blue">
                  <MessageSquare className="size-4" />
                  <p className="text-sm font-semibold text-brand-navy">Messages</p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Your lending officer replied regarding income verification.
                </p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <div className="flex items-center gap-2 text-brand-blue">
                  <FileUp className="size-4" />
                  <p className="text-sm font-semibold text-brand-navy">Documents</p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  2 of 3 required documents uploaded and verified.
                </p>
              </div>
            </div>

            {LANDING_DASHBOARD_FEATURES.map((feature) => (
              <div
                key={feature.id}
                className="absolute hidden max-w-[180px] rounded-xl border border-brand-blue/20 bg-white/95 px-3 py-2.5 shadow-[0_8px_24px_rgba(37,99,235,0.12)] backdrop-blur-sm lg:block"
                style={{ top: feature.position.top, left: feature.position.left }}
              >
                <p className="text-[11px] font-semibold text-brand-blue">{feature.label}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:hidden">
          {LANDING_DASHBOARD_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3"
            >
              <p className="text-sm font-semibold text-brand-navy">{feature.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function DashboardPanel({
  icon: Icon,
  title,
  value,
  detail,
}: {
  icon: typeof CreditCard;
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-brand-blue" strokeWidth={1.75} />
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </p>
      </div>
      <p className="heading-primary mt-3 text-xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
