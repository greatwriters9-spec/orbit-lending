"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  CreditCard,
  FileText,
  HelpCircle,
  MessageSquare,
  Search,
  Shield,
  Ticket,
  Wallet,
} from "lucide-react";

import { SupportStatusBadge } from "@/components/support/support-badges";
import { Input } from "@/components/ui-kit/input";
import { StatCard } from "@/components/ui-kit/stat-card";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import {
  KNOWLEDGE_CATEGORY_LABELS,
  QUICK_ACTION_CATEGORIES,
  TICKET_CATEGORY_LABELS,
} from "@/lib/support/constants";
import type {
  SupportKnowledgeArticle,
  SupportSummary,
  SupportTicket,
} from "@/types/support";

type ClientSupportCenterProps = {
  tickets: SupportTicket[];
  articles: SupportKnowledgeArticle[];
  summary: SupportSummary;
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
};

export function ClientSupportCenter({
  tickets,
  articles,
  summary,
}: ClientSupportCenterProps) {
  const [search, setSearch] = useState("");
  const [articleSearch, setArticleSearch] = useState("");

  const filteredArticles = useMemo(() => {
    if (!articleSearch.trim()) return articles;
    const q = articleSearch.toLowerCase();
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [articles, articleSearch]);

  const groupedArticles = useMemo(() => {
    const groups = new Map<string, SupportKnowledgeArticle[]>();
    for (const article of filteredArticles) {
      const list = groups.get(article.category) ?? [];
      list.push(article);
      groups.set(article.category, list);
    }
    return groups;
  }, [filteredArticles]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-brand-border bg-gradient-to-br from-brand-navy to-brand-blue p-8 text-white shadow-[var(--shadow-card)]">
        <h1 className="text-3xl font-bold tracking-tight">How can we help today?</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          Search help articles, open a support ticket, or contact your loan team.
          Orbit Lending support is here for your financing journey.
        </p>
        <div className="relative mt-6 max-w-xl">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/60" />
          <Input
            value={articleSearch}
            onChange={(event) => setArticleSearch(event.target.value)}
            placeholder="Search support articles..."
            className="h-11 border-white/20 bg-white/10 pl-9 text-white placeholder:text-white/60"
          />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Open Tickets"
          value={String(summary.openTickets)}
          description="Active support requests"
          icon={Ticket}
        />
        <StatCard
          title="Awaiting You"
          value={String(summary.awaitingClient)}
          description="Tickets needing your response"
          icon={MessageSquare}
        />
        <StatCard
          title="Recent Activity"
          value={String(summary.recentResponses)}
          description="Updates in the last 7 days"
          icon={HelpCircle}
        />
        <StatCard
          title="Unread Updates"
          value={String(summary.unreadSupportNotifications)}
          description="Support notifications"
          icon={BookOpen}
          variant="featured"
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="heading-secondary text-lg">Quick Actions</h2>
          <Link
            href="/dashboard/support/new"
            className="inline-flex h-8 items-center justify-center rounded-lg bg-brand-blue px-3 text-sm font-medium text-white hover:bg-brand-blue/90"
          >
            Open New Ticket
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTION_CATEGORIES.map((action) => (
            <Link
              key={action.label}
              href={`/dashboard/support/new?category=${action.category}`}
              className="rounded-2xl border border-brand-border bg-white p-5 shadow-[var(--shadow-card)] transition hover:border-brand-blue/40 hover:shadow-md"
            >
              <p className="font-semibold text-brand-navy">{action.label}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="heading-secondary text-lg">Your Support Tickets</h2>
            <div className="relative w-48">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tickets"
                className="h-9 pl-9"
              />
            </div>
          </div>
          <div className="space-y-3">
            {tickets
              .filter(
                (ticket) =>
                  !search ||
                  ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
                  ticket.ticketNumber.toLowerCase().includes(search.toLowerCase()),
              )
              .map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/dashboard/support/${ticket.id}`}
                  className="block rounded-xl border border-brand-border/70 p-4 transition hover:border-brand-blue/30 hover:bg-brand-background/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {ticket.ticketNumber}
                      </p>
                      <p className="mt-1 font-semibold text-brand-navy">
                        {ticket.subject}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {TICKET_CATEGORY_LABELS[ticket.category]} · Updated{" "}
                        {formatApplicationDate(ticket.updatedAt)}
                      </p>
                    </div>
                    <SupportStatusBadge status={ticket.status} />
                  </div>
                </Link>
              ))}
            {!tickets.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No support tickets yet. Open a ticket if you need assistance.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-[var(--shadow-card)]">
          <h2 className="heading-secondary text-lg">Help Center</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Guides and answers for common questions.
          </p>
          <div className="mt-5 space-y-6">
            {[...groupedArticles.entries()].map(([category, items]) => {
              const Icon = articleIcons[category] ?? BookOpen;
              return (
                <div key={category}>
                  <div className="mb-3 flex items-center gap-2">
                    <Icon className="size-4 text-brand-blue" />
                    <h3 className="text-sm font-semibold text-brand-navy">
                      {KNOWLEDGE_CATEGORY_LABELS[category] ?? category}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {items.map((article) => (
                      <details
                        key={article.id}
                        className="rounded-lg border border-brand-border/70 bg-brand-background/30 p-3"
                      >
                        <summary className="cursor-pointer text-sm font-medium text-brand-navy">
                          {article.title}
                        </summary>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {article.content}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
