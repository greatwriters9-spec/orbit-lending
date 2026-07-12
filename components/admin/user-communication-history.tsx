"use client";

import type { EmailCommunicationLog } from "@/lib/email/types";
import {
  getClientEmailTemplateLabel,
  getEmailTemplateLabel,
} from "@/lib/email/templates/catalog-labels";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import { useCompany } from "@/components/providers/company-provider";

type UserCommunicationHistoryProps = {
  logs: EmailCommunicationLog[];
  /** Use "client" when shown on the borrower's own profile page. */
  variant?: "admin" | "client";
};

function formatDeliveryStatus(status: string, variant: "admin" | "client") {
  if (variant === "admin") {
    return status;
  }

  switch (status) {
    case "sent":
      return "Delivered";
    case "pending":
      return "Sending";
    case "failed":
      return "Not delivered";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export function UserCommunicationHistory({
  logs,
  variant = "admin",
}: UserCommunicationHistoryProps) {
  const { branding } = useCompany();
  const isClient = variant === "client";

  return (
    <div className="card-surface p-6 md:p-8">
      <h3 className="text-lg font-semibold text-brand-navy">
        {isClient ? `Messages from ${branding.institutionName}` : "Communication History"}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {isClient
          ? "Emails we've sent you about your mortgage and account."
          : `Emails sent to this client from ${branding.institutionName}.`}
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">{isClient ? "Type" : "Email Type"}</th>
              {!isClient ? (
                <th className="px-3 py-3">Sender Department</th>
              ) : null}
              <th className="px-3 py-3">Subject</th>
              <th className="px-3 py-3">{isClient ? "Status" : "Delivery Status"}</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={isClient ? 4 : 5}
                  className="px-3 py-6 text-muted-foreground"
                >
                  {isClient
                    ? "No messages yet. We'll email you when there are updates on your mortgage."
                    : "No communication history yet."}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-brand-border/70">
                  <td className="px-3 py-3 whitespace-nowrap">
                    {formatApplicationDate(log.createdAt)}
                  </td>
                  <td className="px-3 py-3">
                    {isClient
                      ? getClientEmailTemplateLabel(log.templateKey)
                      : getEmailTemplateLabel(log.templateKey)}
                  </td>
                  {!isClient ? (
                    <td className="px-3 py-3">{log.senderDisplayName}</td>
                  ) : null}
                  <td className="px-3 py-3">{log.subject}</td>
                  <td className="px-3 py-3 capitalize">
                    {formatDeliveryStatus(log.status, variant)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
