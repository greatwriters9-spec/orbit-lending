import Link from "next/link";

import { NotificationTimeline } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import type { MortgageMessageItem } from "@/types/mortgage-dashboard";

type MessagesWidgetProps = {
  messages: MortgageMessageItem[];
  className?: string;
};

const CATEGORY_LABELS = {
  advisor: "Mortgage Advisor",
  underwriting: "Underwriting Team",
  support: "Support",
  system: "System",
} as const;

export function MessagesWidget({ messages, className }: MessagesWidgetProps) {
  const timeline = messages.map((msg) => ({
    id: msg.id,
    title: `${CATEGORY_LABELS[msg.category]} · ${msg.senderName}`,
    message: msg.message,
    timestamp: msg.timestamp,
    priority: "default" as const,
    unread: false,
  }));

  return (
    <section className={cn("dashboard-card p-6 md:p-8", className)}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold leading-tight text-brand-navy">Messages</h2>
          <p className="type-body mt-1 text-muted-foreground">
            Mortgage advisor, underwriting, and support communications.
          </p>
        </div>
        <Link
          href="/dashboard/messages"
          className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
        >
          View all
        </Link>
      </div>

      {timeline.length ? (
        <NotificationTimeline notifications={timeline} />
      ) : (
        <p className="text-sm text-muted-foreground">
          No messages yet. Your mortgage team will reach out here.
        </p>
      )}
    </section>
  );
}
