"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, User } from "lucide-react";

import { sendApplicationMessageAction } from "@/lib/applications/actions";
import { markApplicationMessagesReadAction } from "@/lib/notifications/actions";
import { getMessageSenderRoleLabel } from "@/lib/auth/roles";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import { Button } from "@/components/ui-kit/button";
import { cn } from "@/lib/utils";
import type { ApplicationMessage } from "@/types/application-details";

type ApplicationMessagesPanelProps = {
  applicationId: string;
  messages: ApplicationMessage[];
  className?: string;
};

const roleStyles = {
  client: "ml-auto bg-brand-blue text-white",
  officer: "bg-brand-background text-brand-navy border border-brand-border",
  finance: "bg-brand-navy text-white",
  system: "bg-brand-success/10 text-brand-navy border border-brand-success/20",
};

export function ApplicationMessagesPanel({
  applicationId,
  messages,
  className,
}: ApplicationMessagesPanelProps) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void markApplicationMessagesReadAction(applicationId).then(() => {
      router.refresh();
    });
  }, [applicationId, router]);

  function handleSend() {
    startTransition(async () => {
      const result = await sendApplicationMessageAction(applicationId, reply);
      if (result.error) {
        setFeedback(result.error);
        return;
      }
      setReply("");
      setFeedback(result.success ?? "Message sent.");
    });
  }

  return (
    <section className={cn("card-surface p-6 md:p-8", className)}>
      <div className="mb-6">
        <h2 className="heading-secondary text-lg">Messages</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Communicate with your loan officer about this application.
        </p>
      </div>

      <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
        {messages.map((message) => {
          const isClient = message.senderRole === "client";

          return (
            <div
              key={message.id}
              className={cn("flex gap-3", isClient && "flex-row-reverse")}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                <User className="size-4" strokeWidth={1.75} />
              </div>
              <div className={cn("max-w-[85%] rounded-xl px-4 py-3", roleStyles[message.senderRole])}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{message.senderName}</p>
                  <span className="text-[10px] uppercase opacity-70">
                    {getMessageSenderRoleLabel(message.senderRole)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{message.message}</p>
                <time className="mt-2 block text-[11px] opacity-70">
                  {formatApplicationDate(message.createdAt)}
                </time>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 space-y-3 border-t border-brand-border pt-6">
        <textarea
          rows={3}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Write a message to your loan officer..."
          className="w-full rounded-xl border border-brand-border bg-brand-background px-4 py-3 text-sm focus-visible:border-brand-blue/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/15"
        />
        {feedback ? (
          <p className="text-sm text-muted-foreground">{feedback}</p>
        ) : null}
        <Button
          type="button"
          disabled={isPending || !reply.trim()}
          onClick={handleSend}
          className="h-10 bg-brand-blue text-white hover:bg-brand-blue/90"
        >
          <Send className="size-4" />
          {isPending ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </section>
  );
}
