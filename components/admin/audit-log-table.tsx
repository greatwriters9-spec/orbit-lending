import { formatApplicationDate } from "@/lib/applications/status-utils";
import type { PlatformAuditLog } from "@/types/admin";

export function AuditLogTable({ logs }: { logs: PlatformAuditLog[] }) {
  return (
    <div className="card-surface overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-brand-border bg-brand-background/60 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-semibold">When</th>
            <th className="px-6 py-3 font-semibold">Actor</th>
            <th className="px-6 py-3 font-semibold">Action</th>
            <th className="px-6 py-3 font-semibold">Entity</th>
            <th className="px-6 py-3 font-semibold">Changes</th>
            <th className="px-6 py-3 font-semibold">Reason</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {logs.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                No audit entries recorded yet.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="align-top hover:bg-brand-background/40">
                <td className="px-6 py-4 text-muted-foreground">
                  {formatApplicationDate(log.createdAt)}
                </td>
                <td className="px-6 py-4 text-brand-navy">
                  {log.actorName ?? "System"}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-brand-blue">
                  {log.action}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {log.entityType}
                  <span className="mt-0.5 block font-mono text-[11px]">
                    {log.entityId.slice(0, 12)}…
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-muted-foreground">
                  {log.oldValues ? (
                    <p>
                      <span className="font-semibold text-brand-navy">From:</span>{" "}
                      {JSON.stringify(log.oldValues)}
                    </p>
                  ) : null}
                  {log.newValues ? (
                    <p className="mt-1">
                      <span className="font-semibold text-brand-navy">To:</span>{" "}
                      {JSON.stringify(log.newValues)}
                    </p>
                  ) : null}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{log.reason ?? "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
