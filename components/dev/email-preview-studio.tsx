"use client";

import { useMemo, useState } from "react";

import {
  COMMUNICATION_CLASS_LABELS,
  EMAIL_TEMPLATE_LABELS,
  getTemplateCommunicationClassLabel,
} from "@/lib/email/templates/catalog-labels";
import { resolveTemplateCommunicationClass } from "@/lib/email/registry";
import type { EmailCommunicationClass, EmailTemplateKey } from "@/lib/email/types";

type EmailPreviewStudioProps = {
  templates: Array<{ key: EmailTemplateKey; label: string }>;
};

const CLASS_FILTERS: Array<{ value: "all" | EmailCommunicationClass; label: string }> = [
  { value: "all", label: "All Templates" },
  { value: "automated", label: COMMUNICATION_CLASS_LABELS.automated },
  { value: "department", label: COMMUNICATION_CLASS_LABELS.department },
  { value: "executive", label: COMMUNICATION_CLASS_LABELS.executive },
];

export function EmailPreviewStudio({ templates }: EmailPreviewStudioProps) {
  const [template, setTemplate] = useState<EmailTemplateKey>(
    "mortgage_closed_successfully",
  );
  const [classFilter, setClassFilter] = useState<"all" | EmailCommunicationClass>("all");
  const [message, setMessage] = useState(
    "Congratulations on completing your home purchase. The funds have been released to the seller.",
  );

  const filteredTemplates = useMemo(() => {
    if (classFilter === "all") return templates;
    return templates.filter(
      (item) => resolveTemplateCommunicationClass(item.key) === classFilter,
    );
  }, [classFilter, templates]);

  const previewSrc = useMemo(() => {
    const params = new URLSearchParams({
      template,
      message,
      applicationNumber: "ORB-2026-128972",
      approvedAmount: "503920",
      closingAmount: "629900",
      propertyAddress: "1050 Woodward Ave, Detroit, MI 48226",
    });
    return `/dev/email-preview/render?${params.toString()}`;
  }, [template, message]);

  return (
    <div className="min-h-screen bg-[#E2E8F0]">
      <div className="border-b border-brand-border bg-white px-4 py-4 shadow-sm md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
              Development only
            </p>
            <h1 className="mt-1 text-2xl font-bold text-brand-navy">
              Institutional Email Preview
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Automated, department, and executive layouts — mockup source of truth.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-2xl">
            <label className="flex flex-1 flex-col gap-1.5 text-sm">
              <span className="font-semibold text-brand-navy">Class</span>
              <select
                value={classFilter}
                onChange={(event) =>
                  setClassFilter(event.target.value as typeof classFilter)
                }
                className="h-11 rounded-xl border border-brand-border bg-white px-3"
              >
                {CLASS_FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-[2] flex-col gap-1.5 text-sm">
              <span className="font-semibold text-brand-navy">Template</span>
              <select
                value={template}
                onChange={(event) =>
                  setTemplate(event.target.value as EmailTemplateKey)
                }
                className="h-11 rounded-xl border border-brand-border bg-white px-3"
              >
                {filteredTemplates.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label} ({getTemplateCommunicationClassLabel(item.key)})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <label className="mx-auto mt-4 block max-w-6xl text-sm">
          <span className="font-semibold text-brand-navy">Body message</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={2}
            className="mt-1.5 w-full rounded-xl border border-brand-border bg-white px-3 py-2.5"
          />
        </label>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-brand-border bg-[#F8FAFC] px-4 py-3 text-xs text-muted-foreground">
            <span>
              {getTemplateCommunicationClassLabel(template)} — 600px institutional layout
            </span>
            <a
              href={previewSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-blue hover:underline"
            >
              Open full HTML
            </a>
          </div>
          <iframe
            key={previewSrc}
            title="Email preview"
            src={previewSrc}
            className="h-[920px] w-full bg-[#F1F5F9]"
          />
        </div>
      </div>
    </div>
  );
}
