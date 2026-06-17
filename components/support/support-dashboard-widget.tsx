import Link from "next/link";
import { Headphones, HelpCircle, MessageSquare, Ticket } from "lucide-react";
import type { SupportSummary } from "@/types/support";

type SupportDashboardWidgetProps = {
  summary: SupportSummary;
};

export function SupportDashboardWidget({ summary }: SupportDashboardWidgetProps) {
  return (
    <section className="dashboard-card p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/8 ring-1 ring-brand-border">
            <HelpCircle className="size-5 text-brand-blue" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-navy">Support</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Get help from your mortgage team and support specialists.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="dashboard-info-panel">
          <div className="flex items-center gap-2 text-brand-navy">
            <Ticket className="size-4 text-brand-blue" />
            <span className="text-sm font-medium">Open Tickets</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-brand-navy">{summary.openTickets}</p>
        </div>
        <div className="dashboard-info-panel">
          <div className="flex items-center gap-2 text-brand-navy">
            <MessageSquare className="size-4 text-brand-blue" />
            <span className="text-sm font-medium">Awaiting You</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-brand-navy">{summary.awaitingClient}</p>
        </div>
        <div className="dashboard-info-panel">
          <div className="flex items-center gap-2 text-brand-navy">
            <HelpCircle className="size-4 text-brand-blue" />
            <span className="text-sm font-medium">Unread Updates</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-brand-navy">
            {summary.unreadSupportNotifications}
          </p>
        </div>
      </div>

      {summary.awaitingClient > 0 ? (
        <div className="mt-4 rounded-2xl border border-brand-warning/20 bg-brand-warning/5 px-4 py-3 text-sm text-brand-warning">
          You have {summary.awaitingClient} ticket
          {summary.awaitingClient === 1 ? "" : "s"} waiting for your response.
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/messages"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 text-sm font-semibold text-white hover:bg-brand-blue/90"
        >
          <MessageSquare className="size-4" />
          Contact Mortgage Officer
        </Link>
        <Link
          href="/dashboard/support/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-4 text-sm font-semibold text-brand-navy hover:bg-brand-background"
        >
          <Ticket className="size-4" />
          Open Support Ticket
        </Link>
        <Link
          href="/dashboard/support"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-4 text-sm font-semibold text-brand-navy hover:bg-brand-background"
        >
          <Headphones className="size-4" />
          Message Support
        </Link>
      </div>
    </section>
  );
}
