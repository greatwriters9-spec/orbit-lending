"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Search, Star, Ticket, Timer, TrendingUp, Users } from "lucide-react";

import {
  SupportPriorityBadge,
  SupportStatusBadge,
} from "@/components/support/support-badges";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { StatCard } from "@/components/ui-kit/stat-card";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import {
  assignTicketAction,
  updateTicketStatusAction,
} from "@/lib/support/actions";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
} from "@/lib/support/constants";
import type { SupportAnalytics, SupportTicket } from "@/types/support";

type FinanceSupportCenterProps = {
  tickets: SupportTicket[];
  analytics: SupportAnalytics;
  staffId: string;
};

export function FinanceSupportCenter({
  tickets,
  analytics,
  staffId,
}: FinanceSupportCenterProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return tickets.filter((ticket) => {
      if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        ticket.subject.toLowerCase().includes(q) ||
        ticket.ticketNumber.toLowerCase().includes(q) ||
        (ticket.borrowerName ?? "").toLowerCase().includes(q)
      );
    });
  }, [tickets, search, statusFilter]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-primary text-3xl">Support Center</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage client support tickets, assignments, and escalations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Open Tickets" value={String(analytics.openTickets)} description="Needs attention" icon={Ticket} />
        <StatCard
          title="Avg Resolution"
          value={`${analytics.averageResolutionHours.toFixed(1)}h`}
          description="Average time to resolve"
          icon={Timer}
        />
        <StatCard
          title="CSAT Score"
          value={analytics.satisfactionScore ? analytics.satisfactionScore.toFixed(1) : "—"}
          description="Customer satisfaction"
          icon={Star}
        />
        <StatCard
          title="Escalation Rate"
          value={`${(analytics.escalationRate * 100).toFixed(0)}%`}
          description="Tickets escalated"
          icon={TrendingUp}
        />
        <StatCard title="Total Tickets" value={String(tickets.length)} description="All time" icon={Users} />
      </div>

      <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tickets, clients..."
              className="h-10 pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-lg border border-brand-border px-3 text-sm"
          >
            <option value="all">All statuses</option>
            {Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[var(--shadow-card)]">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-background/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-6 py-3">Ticket</th>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Priority</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Updated</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticket) => (
              <tr key={ticket.id} className="border-t border-brand-border/70">
                <td className="px-6 py-4">
                  <Link
                    href={`/finance/support/${ticket.id}`}
                    className="font-medium text-brand-blue hover:underline"
                  >
                    {ticket.ticketNumber}
                  </Link>
                  <p className="text-muted-foreground">{ticket.subject}</p>
                </td>
                <td className="px-6 py-4">{ticket.borrowerName ?? "Client"}</td>
                <td className="px-6 py-4">{TICKET_CATEGORY_LABELS[ticket.category]}</td>
                <td className="px-6 py-4">
                  <SupportPriorityBadge priority={ticket.priority} />
                </td>
                <td className="px-6 py-4">
                  <SupportStatusBadge status={ticket.status} />
                </td>
                <td className="px-6 py-4">{formatApplicationDate(ticket.updatedAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          await assignTicketAction({
                            ticketId: ticket.id,
                            assigneeId: staffId,
                          });
                        })
                      }
                    >
                      Assign
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          await updateTicketStatusAction({
                            ticketId: ticket.id,
                            status: "resolved",
                          });
                        })
                      }
                    >
                      Resolve
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No support tickets match your filters.
          </p>
        ) : null}
      </div>
    </div>
  );
}
