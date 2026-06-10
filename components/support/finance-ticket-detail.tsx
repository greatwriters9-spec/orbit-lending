"use client";

import { useState, useTransition } from "react";

import {
  SupportPriorityBadge,
  SupportStatusBadge,
} from "@/components/support/support-badges";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import {
  escalateTicketAction,
  staffReplyToTicketAction,
  updateTicketStatusAction,
} from "@/lib/support/actions";
import { TICKET_CATEGORY_LABELS } from "@/lib/support/constants";
import type {
  SupportTicket,
  SupportTicketMessage,
  SupportTimelineEvent,
} from "@/types/support";

type FinanceTicketDetailProps = {
  ticket: SupportTicket;
  messages: SupportTicketMessage[];
  timeline: SupportTimelineEvent[];
};

export function FinanceTicketDetail({
  ticket,
  messages,
  timeline,
}: FinanceTicketDetailProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleReply(event: React.FormEvent<HTMLFormElement>, isInternal = false) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("ticketId", ticket.id);
    formData.set("isInternal", String(isInternal));

    startTransition(async () => {
      const result = await staffReplyToTicketAction(formData);
      setFeedback(result.error ?? result.success ?? null);
      if (result.success && !isInternal) {
        event.currentTarget.reset();
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</p>
            <h1 className="mt-1 text-2xl font-bold text-brand-navy">{ticket.subject}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {ticket.borrowerName} · {TICKET_CATEGORY_LABELS[ticket.category]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SupportStatusBadge status={ticket.status} />
            <SupportPriorityBadge priority={ticket.priority} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await updateTicketStatusAction({
                  ticketId: ticket.id,
                  status: "in_progress",
                });
                setFeedback(result.success ?? result.error ?? null);
              })
            }
          >
            Mark In Progress
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await escalateTicketAction({
                  ticketId: ticket.id,
                  level: "credit_manager",
                  reason: "Manual escalation",
                });
                setFeedback(result.success ?? result.error ?? null);
              })
            }
          >
            Escalate
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await updateTicketStatusAction({
                  ticketId: ticket.id,
                  status: "resolved",
                });
                setFeedback(result.success ?? result.error ?? null);
              })
            }
            className="bg-brand-blue text-white"
          >
            Resolve
          </Button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-[var(--shadow-card)]">
          <h2 className="heading-secondary text-lg">Conversation</h2>
          <div className="mt-5 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-xl border p-4 ${
                  message.isInternal
                    ? "border-brand-warning/30 bg-brand-warning/5"
                    : message.senderRole === "staff"
                      ? "border-brand-blue/20 bg-brand-blue/5"
                      : "border-brand-border bg-brand-background/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-brand-navy">
                    {message.senderName}
                    {message.isInternal ? " (Internal)" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatApplicationDate(message.createdAt)}
                  </p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {message.message}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={(event) => handleReply(event, false)} className="mt-6 space-y-3 border-t border-brand-border pt-6">
            <textarea
              name="message"
              required
              rows={4}
              placeholder="Reply to client..."
              className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
            />
            <Button type="submit" disabled={isPending} className="bg-brand-blue text-white">
              Send to Client
            </Button>
          </form>

          <form onSubmit={(event) => handleReply(event, true)} className="mt-4 space-y-3">
            <textarea
              name="message"
              required
              rows={3}
              placeholder="Internal note (staff only)..."
              className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
            />
            <Button type="submit" disabled={isPending} variant="outline">
              Add Internal Note
            </Button>
          </form>

          {feedback ? <p className="mt-3 text-sm text-muted-foreground">{feedback}</p> : null}
        </section>

        <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-[var(--shadow-card)]">
          <h2 className="heading-secondary text-lg">Timeline</h2>
          <div className="mt-4 space-y-4">
            {timeline.map((event, index) => (
              <div key={event.id} className="relative pl-6">
                {index < timeline.length - 1 ? (
                  <span className="absolute top-2 left-[7px] h-full w-px bg-brand-border" />
                ) : null}
                <span className="absolute top-1.5 left-0 size-3 rounded-full bg-brand-blue" />
                <p className="text-sm font-medium text-brand-navy">{event.title}</p>
                {event.description ? (
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {formatApplicationDate(event.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
