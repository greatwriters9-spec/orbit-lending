"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Search } from "lucide-react";

import { formatApplicationDate } from "@/lib/applications/status-utils";
import { Input } from "@/components/ui-kit/input";
import { StatCard } from "@/components/ui-kit/stat-card";
import type { ClientDocument, ClientDocumentSource } from "@/types/documents";

const SOURCE_LABELS: Record<ClientDocumentSource, string> = {
  application: "Loan Application",
  document_request: "Officer Request",
  payment_proof: "Payment Proof",
};

type ClientDocumentsCenterProps = {
  documents: ClientDocument[];
};

export function ClientDocumentsCenter({ documents }: ClientDocumentsCenterProps) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      if (sourceFilter !== "all" && doc.source !== sourceFilter) {
        return false;
      }

      if (!search.trim()) {
        return true;
      }

      const query = search.toLowerCase();
      return [
        doc.documentName,
        doc.fileName,
        doc.applicationNumber ?? "",
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [documents, search, sourceFilter]);

  const applicationCount = new Set(
    documents.map((doc) => doc.applicationId).filter(Boolean),
  ).size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-primary text-3xl">Documents</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          All documents submitted across your loan applications, officer requests,
          and payment proofs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Documents"
          value={String(documents.length)}
          description="Saved to your account"
          icon={FileText}
        />
        <StatCard
          title="Applications"
          value={String(applicationCount)}
          description="With uploaded files"
          icon={FileText}
        />
        <StatCard
          title="Latest Upload"
          value={
            documents[0]
              ? formatApplicationDate(documents[0].uploadedAt)
              : "—"
          }
          description="Most recent submission"
          icon={FileText}
        />
      </div>

      <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search documents"
              className="h-10 pl-9"
            />
          </div>
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            className="h-10 rounded-lg border border-brand-border px-3 text-sm"
          >
            <option value="all">All sources</option>
            {Object.entries(SOURCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-background/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Document</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Application</th>
                <th className="px-6 py-3">File</th>
                <th className="px-6 py-3">Uploaded</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={`${doc.source}-${doc.id}`} className="border-t border-brand-border/70">
                  <td className="px-6 py-4 font-medium text-brand-navy">
                    {doc.documentName}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {SOURCE_LABELS[doc.source]}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {doc.applicationNumber ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{doc.fileName}</td>
                  <td className="px-6 py-4">
                    {formatApplicationDate(doc.uploadedAt)}
                  </td>
                  <td className="px-6 py-4">
                    {doc.downloadUrl ? (
                      <a
                        href={doc.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted"
                      >
                        <Download className="size-3.5" />
                        Download
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Metadata only
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filtered.length ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            {documents.length
              ? "No documents match your filters."
              : "No documents uploaded yet. Files from loan applications, officer requests, and payment proofs will appear here."}
          </div>
        ) : null}
      </div>
    </div>
  );
}
