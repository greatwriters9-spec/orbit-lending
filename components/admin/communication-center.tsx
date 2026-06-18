"use client";

import { useMemo, useState, useTransition } from "react";

import {
  fetchCommunicationCenterDataAction,
  sendAdminCommunicationAction,
  type AdminCommunicationActionState,
} from "@/lib/email/admin-actions";
import {
  ADMIN_SENDABLE_TEMPLATES,
  EMAIL_TEMPLATE_LABELS,
  resolveTemplateDepartment,
} from "@/lib/email/templates/catalog";
import type { EmailCommunicationLog, EmailDepartment } from "@/lib/email/types";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import { getEmailTemplateLabel } from "@/lib/email/queries";

type CommunicationUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type CommunicationCenterProps = {
  initialUsers: CommunicationUser[];
  initialLogs: EmailCommunicationLog[];
};

const DEPARTMENT_OPTIONS: Array<{ value: EmailDepartment; label: string }> = [
  { value: "system", label: "Orbit Mortgage System" },
  { value: "loan_officer", label: "Orbit Mortgage Loan Officer" },
  { value: "lending", label: "Chief Lending Officer - Orbit Mortgage" },
  { value: "funding", label: "Orbit Mortgage Funding Department" },
  { value: "closings", label: "Orbit Mortgage Closings Department" },
  { value: "support", label: "Orbit Mortgage Support" },
];

export function CommunicationCenter({
  initialUsers,
  initialLogs,
}: CommunicationCenterProps) {
  const [users] = useState(initialUsers);
  const [logs, setLogs] = useState(initialLogs);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [department, setDepartment] = useState<EmailDepartment>("loan_officer");
  const [template, setTemplate] = useState(ADMIN_SENDABLE_TEMPLATES[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<AdminCommunicationActionState | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  function handleUserChange(userId: string) {
    setSelectedUserId(userId);
    const user = users.find((entry) => entry.id === userId);
    if (user) {
      setRecipientEmail(user.email);
    }
  }

  function handleTemplateChange(nextTemplate: string) {
    setTemplate(nextTemplate as typeof template);
    setDepartment(resolveTemplateDepartment(nextTemplate as typeof template));
    if (!subject.trim()) {
      setSubject(EMAIL_TEMPLATE_LABELS[nextTemplate as typeof template] ?? "");
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await sendAdminCommunicationAction({
        recipientEmail,
        userId: selectedUserId || undefined,
        department,
        template,
        subject,
        message,
      });

      setFeedback(result);

      if (result.success) {
        const refreshed = await fetchCommunicationCenterDataAction();
        setLogs(refreshed.logs);
        setMessage("");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="card-surface p-6 md:p-8">
        <h2 className="heading-primary text-2xl">Communication Center</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Send institutional mortgage communications from the appropriate Orbit
          Mortgage department. All messages are logged automatically.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brand-navy">Recipient</span>
              <select
                value={selectedUserId}
                onChange={(event) => handleUserChange(event.target.value)}
                className="h-11 w-full rounded-xl border border-brand-border bg-white px-3 text-sm"
              >
                <option value="">Select a client (optional)</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brand-navy">Recipient Email</span>
              <Input
                type="email"
                required
                value={recipientEmail}
                onChange={(event) => setRecipientEmail(event.target.value)}
                placeholder="client@example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brand-navy">Department</span>
              <select
                value={department}
                onChange={(event) =>
                  setDepartment(event.target.value as EmailDepartment)
                }
                className="h-11 w-full rounded-xl border border-brand-border bg-white px-3 text-sm"
              >
                {DEPARTMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brand-navy">Template</span>
              <select
                value={template}
                onChange={(event) => handleTemplateChange(event.target.value)}
                className="h-11 w-full rounded-xl border border-brand-border bg-white px-3 text-sm"
              >
                {ADMIN_SENDABLE_TEMPLATES.map((key) => (
                  <option key={key} value={key}>
                    {EMAIL_TEMPLATE_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-brand-navy">Subject</span>
            <Input
              required
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Email subject line"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-brand-navy">Message</span>
            <textarea
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              className="w-full rounded-xl border border-brand-border bg-white px-3 py-3 text-sm"
              placeholder="Write the client-facing message body..."
            />
          </label>

          {selectedUser ? (
            <p className="text-sm text-muted-foreground">
              Sending to {selectedUser.name} as{" "}
              {DEPARTMENT_OPTIONS.find((option) => option.value === department)?.label}.
            </p>
          ) : null}

          {feedback?.error ? (
            <p className="rounded-xl border border-brand-danger/20 bg-brand-danger/5 px-4 py-3 text-sm text-brand-danger">
              {feedback.error}
            </p>
          ) : null}

          {feedback?.success ? (
            <p className="rounded-xl border border-brand-success/20 bg-brand-success/5 px-4 py-3 text-sm text-brand-navy">
              {feedback.success}
            </p>
          ) : null}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Sending..." : "Send Email"}
          </Button>
        </form>
      </div>

      <div className="card-surface p-6 md:p-8">
        <h3 className="text-lg font-semibold text-brand-navy">Recent Email Activity</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Recipient</th>
                <th className="px-3 py-3">Department</th>
                <th className="px-3 py-3">Template</th>
                <th className="px-3 py-3">Subject</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-muted-foreground">
                    No emails logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-brand-border/70">
                    <td className="px-3 py-3 whitespace-nowrap">
                      {formatApplicationDate(log.createdAt)}
                    </td>
                    <td className="px-3 py-3">{log.recipientEmail}</td>
                    <td className="px-3 py-3 capitalize">
                      {log.senderDisplayName}
                    </td>
                    <td className="px-3 py-3">
                      {getEmailTemplateLabel(log.templateKey)}
                    </td>
                    <td className="px-3 py-3">{log.subject}</td>
                    <td className="px-3 py-3 capitalize">{log.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
