import type { EmailCommunicationLog } from "@/lib/email/types";
import { getEmailTemplateLabel } from "@/lib/email/templates/catalog";
import { formatApplicationDate } from "@/lib/applications/status-utils";

type UserCommunicationHistoryProps = {
  logs: EmailCommunicationLog[];
};

export function UserCommunicationHistory({ logs }: UserCommunicationHistoryProps) {
  return (
    <div className="card-surface p-6 md:p-8">
      <h3 className="text-lg font-semibold text-brand-navy">Communication History</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Institutional emails sent to this client from Orbit Mortgage departments.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Email Type</th>
              <th className="px-3 py-3">Sender Department</th>
              <th className="px-3 py-3">Subject</th>
              <th className="px-3 py-3">Delivery Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-muted-foreground">
                  No communication history yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-brand-border/70">
                  <td className="px-3 py-3 whitespace-nowrap">
                    {formatApplicationDate(log.createdAt)}
                  </td>
                  <td className="px-3 py-3">{getEmailTemplateLabel(log.templateKey)}</td>
                  <td className="px-3 py-3">{log.senderDisplayName}</td>
                  <td className="px-3 py-3">{log.subject}</td>
                  <td className="px-3 py-3 capitalize">{log.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
