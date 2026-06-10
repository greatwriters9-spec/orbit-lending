"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Star } from "lucide-react";

import {
  SupportPriorityBadge,
  SupportStatusBadge,
} from "@/components/support/support-badges";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import { markSupportTicketNotificationsReadAction } from "@/lib/notifications/actions";
import {
  replyToTicketAction,
  submitTicketSatisfactionAction,
} from "@/lib/support/actions";
import { TICKET_CATEGORY_LABELS } from "@/lib/support/constants";
import type {
  SupportTicket,
  SupportTicketAttachment,
  SupportTicketMessage,
  SupportTimelineEvent,
} from "@/types/support";

type ClientTicketDetailProps = {
  ticket: SupportTicket;
  messages: SupportTicketMessage[];
  timeline: SupportTimelineEvent[];
  attachments: SupportTicketAttachment[];
  satisfaction: { rating: number; feedback: string | null } | null;
};

export function ClientTicketDetail({
  ticket,
  messages,
  timeline,
  attachments,
  satisfaction,
}: ClientTicketDetailProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);

  useEffect(() => {
    void markSupportTicketNotificationsReadAction(ticket.id).then(() => {
      router.refresh();
    });
  }, [ticket.id, router]);

  function handleReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("ticketId", ticket.id);

    startTransition(async () => {
      const result = await replyToTicketAction(formData);
      setError(result.error ?? null);
      setSuccess(result.success ?? null);
      if (result.success) {
        event.currentTarget.reset();
      }
    });
  }

  function handleSatisfaction() {
    startTransition(async () => {
      const result = await submitTicketSatisfactionAction({
        ticketId: ticket.id,
        rating,
        feedback:
          (document.getElementById("feedback") as HTMLTextAreaElement | null)
            ?.value ?? undefined,
      });
      setError(result.error ?? null);
      setSuccess(result.success ?? null);
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-muted-foreground">
              {ticket.ticketNumber}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-brand-navy">
              {ticket.subject}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {TICKET_CATEGORY_LABELS[ticket.category]} · Created{" "}
              {formatApplicationDate(ticket.createdAt)}
            </p>
            {ticket.assignedStaffName ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Assigned to {ticket.assignedStaffName}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <SupportStatusBadge status={ticket.status} />
            <SupportPriorityBadge priority={ticket.priority} />
          </div>
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
                  message.senderRole === "client"
                    ? "border-brand-blue/20 bg-brand-blue/5"
                    : "border-brand-border bg-brand-background/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-brand-navy">
                    {message.senderName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatApplicationDate(message.createdAt)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  {message.message}
                </p>
                {message.attachments?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.downloadUrl ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-brand-border px-2 py-1 text-xs"
                      >
                        <Download className="size-3" />
                        {attachment.fileName}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {!["closed"].includes(ticket.status) ? (
            <form onSubmit={handleReply} className="mt-6 space-y-3 border-t border-brand-border pt-6">
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Write your reply..."
                className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
              />
              <Input
                name="attachment"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                className="h-10"
              />
              <Button type="submit" disabled={isPending} className="bg-brand-blue text-white">
                Send Reply
              </Button>
            </form>
          ) : null}

          {error ? <p className="mt-3 text-sm text-brand-danger">{error}</p> : null}
          {success ? <p className="mt-3 text-sm text-brand-success">{success}</p> : null}
        </section>

        <div className="space-y-6">
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

          {attachments.length ? (
            <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-[var(--shadow-card)]">
              <h2 className="heading-secondary text-lg">Attachments</h2>
              <div className="mt-3 space-y-2">
                {attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.downloadUrl ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-brand-blue"
                  >
                    <Download className="size-4" />
                    {attachment.fileName}
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {["resolved", "closed"].includes(ticket.status) && !satisfaction ? (
            <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-[var(--shadow-card)]">
              <h2 className="heading-secondary text-lg">Rate Your Experience</h2>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="rounded p-1"
                  >
                    <Star
                      className={`size-5 ${value <= rating ? "fill-brand-warning text-brand-warning" : "text-brand-border"}`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                id="feedback"
                rows={3}
                placeholder="Optional feedback..."
                className="mt-3 w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
              />
              <Button
                type="button"
                disabled={isPending}
                onClick={handleSatisfaction}
                className="mt-3 bg-brand-blue text-white"
              >
                Submit Feedback
              </Button>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
