"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Send, Star } from "lucide-react";

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
} from "@/types/support";
import { cn } from "@/lib/utils";

type ClientTicketDetailProps = {
  ticket: SupportTicket;
  messages: SupportTicketMessage[];
  attachments: SupportTicketAttachment[];
  satisfaction: { rating: number; feedback: string | null } | null;
};

function hasStaffReply(messages: SupportTicketMessage[]) {
  return messages.some((message) => message.senderRole === "staff");
}

function isWaitingForAgent(ticket: SupportTicket, messages: SupportTicketMessage[]) {
  if (["resolved", "closed"].includes(ticket.status)) {
    return false;
  }
  return !hasStaffReply(messages);
}

export function ClientTicketDetail({
  ticket,
  messages,
  attachments,
  satisfaction,
}: ClientTicketDetailProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);

  const waitingForAgent = isWaitingForAgent(ticket, messages);
  const chatClosed = ticket.status === "closed";

  useEffect(() => {
    void markSupportTicketNotificationsReadAction(ticket.id).then(() => {
      router.refresh();
    });
  }, [ticket.id, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatClosed || waitingForAgent) {
      return;
    }

    const interval = window.setInterval(() => {
      router.refresh();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [chatClosed, waitingForAgent, router]);

  function handleReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("ticketId", ticket.id);

    startTransition(async () => {
      const result = await replyToTicketAction(formData);
      setError(result.error ?? null);
      if (result.success) {
        event.currentTarget.reset();
        router.refresh();
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
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[var(--shadow-card)]">
      <header className="shrink-0 border-b border-brand-border px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/support"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-brand-border text-brand-navy hover:bg-brand-background"
            aria-label="Back to Support"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "size-2.5 rounded-full",
                  waitingForAgent
                    ? "animate-pulse bg-brand-warning"
                    : chatClosed
                      ? "bg-muted-foreground/40"
                      : "bg-brand-success",
                )}
              />
              <p className="text-sm font-semibold text-brand-navy">Live Support</p>
            </div>
            <h1 className="truncate text-lg font-bold text-brand-navy">{ticket.subject}</h1>
            <p className="text-xs text-muted-foreground">
              {TICKET_CATEGORY_LABELS[ticket.category]} · {ticket.ticketNumber}
            </p>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-6">
          {waitingForAgent ? (
            <div className="mx-auto max-w-md rounded-2xl border border-brand-blue/15 bg-brand-blue/[0.05] px-4 py-4 text-center">
              <p className="text-sm font-semibold text-brand-navy">
                A live support agent will be with you shortly
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;re connecting you with a support agent. Feel free to add more details below while you wait.
              </p>
            </div>
          ) : null}

          {messages.map((message) => {
            const isClient = message.senderRole === "client";
            const isSystem = message.senderRole === "system";

            if (isSystem) {
              return (
                <div key={message.id} className="flex justify-center">
                  <p className="rounded-full bg-brand-background px-4 py-1.5 text-xs text-muted-foreground">
                    {message.message}
                  </p>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={cn("flex", isClient ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%]",
                    isClient
                      ? "rounded-br-md bg-brand-blue text-white"
                      : "rounded-bl-md border border-brand-border bg-brand-background/60 text-brand-navy",
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        isClient ? "text-white/90" : "text-brand-navy",
                      )}
                    >
                      {isClient ? "You" : message.senderName || "Support Agent"}
                    </p>
                    <p
                      className={cn(
                        "text-[10px]",
                        isClient ? "text-white/70" : "text-muted-foreground",
                      )}
                    >
                      {formatApplicationDate(message.createdAt)}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "text-sm leading-relaxed whitespace-pre-wrap",
                      isClient ? "text-white" : "text-brand-navy/90",
                    )}
                  >
                    {message.message}
                  </p>
                  {message.attachments?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.downloadUrl ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
                            isClient
                              ? "bg-white/15 text-white"
                              : "border border-brand-border bg-white text-brand-navy",
                          )}
                        >
                          <Download className="size-3" />
                          {attachment.fileName}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {!chatClosed ? (
          <form
            onSubmit={handleReply}
            className="shrink-0 border-t border-brand-border bg-white px-4 py-4 md:px-6"
          >
            <div className="flex gap-2">
              <textarea
                name="message"
                required
                rows={2}
                placeholder="Type your message..."
                className="min-h-[44px] flex-1 resize-none rounded-xl border border-brand-border px-4 py-2.5 text-sm"
              />
              <Button
                type="submit"
                disabled={isPending}
                className="h-auto shrink-0 self-end bg-brand-blue px-4 text-white hover:bg-brand-blue/90"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
            <Input
              name="attachment"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              className="mt-2 h-9 text-xs"
            />
            {error ? <p className="mt-2 text-sm text-brand-danger">{error}</p> : null}
          </form>
        ) : (
          <div className="shrink-0 border-t border-brand-border bg-brand-background/40 px-4 py-4 text-center text-sm text-muted-foreground md:px-6">
            This conversation is closed. Open a new ticket if you need more help.
          </div>
        )}
      </div>

      {attachments.length ? (
        <div className="border-t border-brand-border px-4 py-3 md:px-6">
          <p className="text-xs font-semibold text-brand-navy">Attachments</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.downloadUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline"
              >
                <Download className="size-3" />
                {attachment.fileName}
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {["resolved", "closed"].includes(ticket.status) && !satisfaction ? (
        <div className="border-t border-brand-border px-4 py-4 md:px-6">
          <p className="text-sm font-semibold text-brand-navy">How was your support experience?</p>
          <div className="mt-2 flex gap-1">
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
            rows={2}
            placeholder="Optional feedback..."
            className="mt-3 w-full rounded-xl border border-brand-border px-3 py-2 text-sm"
          />
          <Button
            type="button"
            disabled={isPending}
            onClick={handleSatisfaction}
            className="mt-3 bg-brand-blue text-white"
          >
            Submit Feedback
          </Button>
        </div>
      ) : null}
    </div>
  );
}
