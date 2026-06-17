import Link from "next/link";
import { FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DocumentCenterItem } from "@/types/mortgage-dashboard";

type DocumentCenterWidgetProps = {
  documents: DocumentCenterItem[];
  className?: string;
};

const STATUS_STYLES = {
  approved: "bg-brand-success/10 text-brand-success",
  pending: "bg-brand-blue/10 text-brand-blue",
  required: "bg-brand-warning/10 text-brand-warning",
  rejected: "bg-brand-danger/10 text-brand-danger",
} as const;

export function DocumentCenterWidget({
  documents,
  className,
}: DocumentCenterWidgetProps) {
  return (
    <section className={cn("dashboard-card flex h-full flex-col p-6 md:p-8", className)}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/8 ring-1 ring-brand-border">
            <FileText className="size-5 text-brand-blue" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-navy">Documents</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Mortgage documents, disclosures, and closing files.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/documents"
          className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
        >
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-brand-border bg-brand-background/60 px-4 py-3.5"
          >
            <span className="text-sm font-medium text-brand-navy">{doc.name}</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                STATUS_STYLES[doc.status],
              )}
            >
              {doc.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
