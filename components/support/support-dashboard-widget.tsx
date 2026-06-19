import Link from "next/link";
import { Headphones, MessageCircle } from "lucide-react";
import type { SupportSummary } from "@/types/support";

type SupportDashboardWidgetProps = {
  summary: SupportSummary;
};

export function SupportDashboardWidget({ summary }: SupportDashboardWidgetProps) {
  return (
    <section className="dashboard-card p-6 md:p-8">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/8 ring-1 ring-brand-border">
          <Headphones className="size-5 text-brand-blue" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-brand-navy">Need Help?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse FAQs or open a ticket to chat with support.
          </p>
        </div>
      </div>

      {summary.awaitingClient > 0 ? (
        <div className="mt-4 rounded-2xl border border-brand-warning/20 bg-brand-warning/5 px-4 py-3 text-sm text-brand-navy">
          {summary.awaitingClient} conversation
          {summary.awaitingClient === 1 ? " is" : "s are"} waiting for your reply.
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/support?open=ticket"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 text-sm font-semibold text-white hover:bg-brand-blue/90"
        >
          <MessageCircle className="size-4" />
          Open a Ticket
        </Link>
        <Link
          href="/dashboard/support"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-5 text-sm font-semibold text-brand-navy hover:bg-brand-background"
        >
          <Headphones className="size-4" />
          Help Center
        </Link>
      </div>
    </section>
  );
}
