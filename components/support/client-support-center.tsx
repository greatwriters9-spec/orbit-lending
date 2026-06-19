"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  CreditCard,
  FileText,
  Headphones,
  HelpCircle,
  MessageCircle,
  Search,
  Shield,
  Ticket,
  Wallet,
} from "lucide-react";

import { OpenTicketFlow } from "@/components/support/open-ticket-flow";
import { SupportStatusBadge } from "@/components/support/support-badges";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import {
  buildHelpCenterItems,
  getHelpCategoryLabel,
  groupHelpCenterItems,
} from "@/lib/support/help-center-content";
import { TICKET_CATEGORY_LABELS } from "@/lib/support/constants";
import type {
  SupportKnowledgeArticle,
  SupportSummary,
  SupportTicket,
} from "@/types/support";
import type { SupportTicketCategory } from "@/types/support";
import { cn } from "@/lib/utils";

type ClientSupportCenterProps = {
  tickets: SupportTicket[];
  articles: SupportKnowledgeArticle[];
  summary: SupportSummary;
  initialOpenTicket?: boolean;
  initialCategory?: SupportTicketCategory;
};

const articleIcons: Record<string, typeof HelpCircle> = {
  getting_started: HelpCircle,
  applying_for_financing: FileText,
  loan_status_tracking: Ticket,
  repayments: CreditCard,
  wallet_management: Wallet,
  transactions: CreditCard,
  document_uploads: FileText,
  account_security: Shield,
  faq: BookOpen,
  application_faqs: FileText,
};

function isActiveTicket(ticket: SupportTicket) {
  return !["resolved", "closed"].includes(ticket.status);
}

export function ClientSupportCenter({
  tickets,
  articles,
  summary,
  initialOpenTicket = false,
  initialCategory,
}: ClientSupportCenterProps) {
  const [articleSearch, setArticleSearch] = useState("");
  const [showTicketFlow, setShowTicketFlow] = useState(initialOpenTicket);

  const helpItems = useMemo(() => buildHelpCenterItems(articles), [articles]);

  const filteredHelpItems = useMemo(() => {
    if (!articleSearch.trim()) {
      return helpItems;
    }

    const query = articleSearch.toLowerCase();
    return helpItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [articleSearch, helpItems]);

  const groupedArticles = useMemo(
    () => groupHelpCenterItems(filteredHelpItems),
    [filteredHelpItems],
  );

  const activeTickets = tickets.filter(isActiveTicket);
  const awaitingReply = summary.awaitingClient > 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-[var(--shadow-card)] md:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                <Headphones className="size-5" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-brand-navy md:text-3xl">
                  Support
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse answers below or open a ticket to chat with our team.
                </p>
              </div>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setShowTicketFlow(true)}
            className="h-12 shrink-0 gap-2 rounded-xl bg-brand-blue px-6 text-base font-semibold text-white hover:bg-brand-blue/90"
          >
            <MessageCircle className="size-5" />
            Open a Ticket
          </Button>
        </div>

        {awaitingReply ? (
          <div className="mt-5 rounded-xl border border-brand-warning/25 bg-brand-warning/8 px-4 py-3 text-sm text-brand-navy">
            You have {summary.awaitingClient} active conversation
            {summary.awaitingClient === 1 ? "" : "s"} waiting for your reply.
          </div>
        ) : null}
      </section>

      {showTicketFlow ? (
        <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-[var(--shadow-card)] md:p-8">
          <OpenTicketFlow
            embedded
            initialCategory={initialCategory}
            onClose={() => setShowTicketFlow(false)}
          />
        </section>
      ) : null}

      {activeTickets.length > 0 ? (
        <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-[var(--shadow-card)] md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">Your Conversations</h2>
              <p className="text-sm text-muted-foreground">
                Continue chatting with our support team.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {activeTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/support/${ticket.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-brand-border/80 p-4 transition hover:border-brand-blue/35 hover:bg-brand-blue/[0.03]"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-brand-navy">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {TICKET_CATEGORY_LABELS[ticket.category]} · Updated{" "}
                    {formatApplicationDate(ticket.updatedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <SupportStatusBadge status={ticket.status} />
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {!showTicketFlow ? (
        <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-[var(--shadow-card)] md:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-brand-navy">Help Center</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search our FAQs and guides — your answer may already be here.
            </p>
          </div>

          <div className="relative max-w-xl">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={articleSearch}
              onChange={(event) => setArticleSearch(event.target.value)}
              placeholder="Search help articles and FAQs..."
              className="h-11 pl-9"
            />
          </div>

          <div className="mt-6 space-y-8">
            {groupedArticles.length ? (
              groupedArticles.map(([category, items]) => {
                const Icon = articleIcons[category] ?? BookOpen;
                return (
                  <div key={category}>
                    <div className="mb-3 flex items-center gap-2">
                      <Icon className="size-4 text-brand-blue" />
                      <h3 className="text-sm font-semibold text-brand-navy">
                        {getHelpCategoryLabel(category)}
                      </h3>
                      <span className="text-xs text-muted-foreground">({items.length})</span>
                    </div>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <details
                          key={item.id}
                          className="group rounded-xl border border-brand-border/70 bg-brand-background/20 open:bg-brand-background/40"
                        >
                          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-brand-navy marker:content-none">
                            <span className="flex items-center justify-between gap-3">
                              {item.title}
                              <span className="text-xs font-normal text-brand-blue group-open:hidden">
                                View answer
                              </span>
                            </span>
                          </summary>
                          <p className="border-t border-brand-border/60 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                            {item.content}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No articles match your search.
              </p>
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-brand-blue/15 bg-brand-blue/[0.04] p-5 text-center">
            <p className="text-sm font-medium text-brand-navy">
              Didn&apos;t find what you need?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Open a ticket and a support agent will help you directly.
            </p>
            <Button
              type="button"
              onClick={() => setShowTicketFlow(true)}
              className={cn(
                "mt-4 h-11 gap-2 bg-brand-blue px-5 text-white hover:bg-brand-blue/90",
              )}
            >
              <MessageCircle className="size-4" />
              Open a Ticket
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
