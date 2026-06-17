"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import type { ApplicationStatus } from "@/types/application-details";

type MessageThread = {
  applicationId: string;
  applicationNumber: string;
  productSlug: string;
  productName?: string;
  status: ApplicationStatus;
  lastMessage: string;
  lastSender: string;
  formattedDate: string;
  unreadCount?: number;
};

type MessageThreadsListProps = {
  threads: MessageThread[];
};

export function MessageThreadsList({ threads }: MessageThreadsListProps) {
  if (threads.length === 0) {
    return (
      <div className="card-surface p-10 text-center">
        <MessageSquare className="mx-auto size-10 text-muted-foreground/40" />
        <p className="mt-4 text-sm text-muted-foreground">
          No application messages yet. Messages appear here when you submit a
          mortgage application.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {threads.map((thread) => (
          <li key={thread.applicationId}>
            <Link
              href={`/dashboard/loans/${thread.applicationId}`}
              className="card-surface flex gap-4 p-5 transition-colors hover:border-brand-blue/30"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <MessageSquare className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-brand-navy">
                    {thread.applicationNumber}
                  </p>
                  <ApplicationStatusBadge status={thread.status} />
                  {thread.unreadCount ? (
                    <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[10px] font-semibold text-white">
                      {thread.unreadCount} new
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {thread.productName ?? thread.productSlug}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {thread.lastSender ? `${thread.lastSender}: ` : ""}
                  {thread.lastMessage}
                </p>
                <p className="mt-2 text-xs text-muted-foreground/80">
                  {thread.formattedDate}
                </p>
              </div>
            </Link>
          </li>
        ))}
    </ul>
  );
}
