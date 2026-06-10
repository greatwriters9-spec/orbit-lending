import Link from "next/link";
import { HelpCircle, MessageSquare, Ticket } from "lucide-react";
import type { SupportSummary } from "@/types/support";

type SupportDashboardWidgetProps = {
  summary: SupportSummary;
};

export function SupportDashboardWidget({ summary }: SupportDashboardWidgetProps) {
  return (
    <section className="card-surface p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="heading-secondary text-lg">Support Center</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Get help, track tickets, and contact your loan team.
          </p>
        </div>
        <HelpCircle className="size-5 text-brand-blue" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-brand-border/70 bg-brand-background/40 p-4">
          <div className="flex items-center gap-2 text-brand-navy">
            <Ticket className="size-4" />
            <span className="text-sm font-medium">Open Tickets</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-brand-navy">
            {summary.openTickets}
          </p>
        </div>
        <div className="rounded-xl border border-brand-border/70 bg-brand-background/40 p-4">
          <div className="flex items-center gap-2 text-brand-navy">
            <MessageSquare className="size-4" />
            <span className="text-sm font-medium">Awaiting You</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-brand-navy">
            {summary.awaitingClient}
          </p>
        </div>
        <div className="rounded-xl border border-brand-border/70 bg-brand-background/40 p-4">
          <div className="flex items-center gap-2 text-brand-navy">
            <HelpCircle className="size-4" />
            <span className="text-sm font-medium">Unread Updates</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-brand-navy">
            {summary.unreadSupportNotifications}
          </p>
        </div>
      </div>

      {summary.awaitingClient > 0 ? (
        <div className="mt-4 rounded-lg border border-brand-warning/20 bg-brand-warning/5 px-4 py-3 text-sm text-brand-warning">
          You have {summary.awaitingClient} ticket
          {summary.awaitingClient === 1 ? "" : "s"} waiting for your response.
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/dashboard/support"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-brand-blue px-3 text-sm font-medium text-white hover:bg-brand-blue/90"
        >
          Contact Support
        </Link>
        <Link
          href="/dashboard/support/new"
          className="inline-flex h-8 items-center justify-center rounded-lg border border-brand-border bg-background px-3 text-sm font-medium hover:bg-muted"
        >
          Open New Ticket
        </Link>
        <Link
          href="/dashboard/messages"
          className="inline-flex h-8 items-center justify-center rounded-lg border border-brand-border bg-background px-3 text-sm font-medium hover:bg-muted"
        >
          Message Loan Officer
        </Link>
      </div>
    </section>
  );
}
