"use client";

import { useMemo, useState, useTransition } from "react";

import {
  fetchCommunicationCenterDataAction,
  sendAdminCommunicationAction,
  type AdminCommunicationActionState,
} from "@/lib/email/admin-actions";
import {
  ADMIN_SENDABLE_TEMPLATES,
  EMAIL_TEMPLATE_DEFAULT_HEADLINES,
  EMAIL_TEMPLATE_DEFAULT_SUBJECTS,
  EMAIL_TEMPLATE_LABELS,
  getEmailTemplateLabel,
  resolveTemplateDepartment,
} from "@/lib/email/templates/catalog";
import type { EmailCommunicationLog, EmailDepartment } from "@/lib/email/types";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { formatApplicationDate } from "@/lib/applications/status-utils";

type CommunicationUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type RecipientMode = "single" | "multiple" | "all";
type Audience = "clients" | "all";

type CommunicationCenterProps = {
  initialUsers: CommunicationUser[];
  initialLogs: EmailCommunicationLog[];
  clientCount?: number;
  memberCount?: number;
  senderName?: string;
  senderTitle?: string;
};

const BROADCAST_TEMPLATE = "account_notification" as const;

const DEPARTMENT_OPTIONS: Array<{ value: EmailDepartment; label: string }> = [
  { value: "system", label: "Orbit Mortgage System" },
  { value: "loan_officer", label: "Loan Officer Department" },
  { value: "underwriting", label: "Underwriting Department" },
  { value: "funding", label: "Funding Department" },
  { value: "closings", label: "Closing Department" },
  { value: "support", label: "Client Support" },
  { value: "executive", label: "Chief Lending Officer" },
];

function applyBroadcastDefaults(
  setDepartment: (value: EmailDepartment) => void,
  setTemplate: (value: typeof BROADCAST_TEMPLATE) => void,
  setSubject: (value: string) => void,
  setHeadline: (value: string) => void,
) {
  setDepartment("system");
  setTemplate(BROADCAST_TEMPLATE);
  setSubject(
    EMAIL_TEMPLATE_DEFAULT_SUBJECTS[BROADCAST_TEMPLATE] ??
      EMAIL_TEMPLATE_LABELS[BROADCAST_TEMPLATE] ??
      "",
  );
  setHeadline(EMAIL_TEMPLATE_DEFAULT_HEADLINES[BROADCAST_TEMPLATE] ?? "");
}

export function CommunicationCenter({
  initialUsers,
  initialLogs,
  clientCount: initialClientCount = 0,
  memberCount: initialMemberCount = 0,
  senderName: initialSenderName = "",
  senderTitle: initialSenderTitle = "",
}: CommunicationCenterProps) {
  const [users] = useState(initialUsers);
  const [clientCount] = useState(initialClientCount);
  const [memberCount] = useState(initialMemberCount);
  const [logs, setLogs] = useState(initialLogs);
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("single");
  const [audience, setAudience] = useState<Audience>("clients");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [department, setDepartment] = useState<EmailDepartment>("loan_officer");
  const [template, setTemplate] = useState(ADMIN_SENDABLE_TEMPLATES[0]);
  const [subject, setSubject] = useState("");
  const [headline, setHeadline] = useState("");
  const [staffName, setStaffName] = useState(initialSenderName);
  const [staffTitle, setStaffTitle] = useState(initialSenderTitle);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<AdminCommunicationActionState | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [userSearch, users]);

  const recipientCount = useMemo(() => {
    if (recipientMode === "single") {
      return recipientEmail.trim() ? 1 : 0;
    }

    if (recipientMode === "multiple") {
      return selectedUserIds.length;
    }

    return audience === "clients" ? clientCount : memberCount;
  }, [
    audience,
    clientCount,
    memberCount,
    recipientEmail,
    recipientMode,
    selectedUserIds.length,
  ]);

  function handleRecipientModeChange(nextMode: RecipientMode) {
    setRecipientMode(nextMode);
    setFeedback(null);

    if (nextMode === "multiple") {
      setSelectedUserId("");
      setRecipientEmail("");
      applyBroadcastDefaults(setDepartment, setTemplate, setSubject, setHeadline);
      return;
    }

    if (nextMode === "all") {
      setSelectedUserId("");
      setSelectedUserIds([]);
      setRecipientEmail("");
      applyBroadcastDefaults(setDepartment, setTemplate, setSubject, setHeadline);
      return;
    }

    setSelectedUserIds([]);
  }

  function handleUserChange(userId: string) {
    setSelectedUserId(userId);
    const user = users.find((entry) => entry.id === userId);
    if (user) {
      setRecipientEmail(user.email);
    }
  }

  function toggleUserSelection(userId: string) {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  }

  function selectAllFilteredUsers() {
    setSelectedUserIds((current) => {
      const next = new Set(current);
      for (const user of filteredUsers) {
        next.add(user.id);
      }
      return Array.from(next);
    });
  }

  function clearSelectedUsers() {
    setSelectedUserIds([]);
  }

  function handleTemplateChange(nextTemplate: string) {
    const key = nextTemplate as typeof template;
    setTemplate(key);
    setDepartment(resolveTemplateDepartment(key));
    setSubject(
      EMAIL_TEMPLATE_DEFAULT_SUBJECTS[key] ?? EMAIL_TEMPLATE_LABELS[key] ?? "",
    );
    setHeadline(EMAIL_TEMPLATE_DEFAULT_HEADLINES[key] ?? "");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await sendAdminCommunicationAction({
        recipientMode,
        audience,
        recipientEmail:
          recipientMode === "single" ? recipientEmail : undefined,
        userId: recipientMode === "single" ? selectedUserId || undefined : undefined,
        userIds: recipientMode === "multiple" ? selectedUserIds : undefined,
        department,
        template,
        subject,
        headline,
        staffName,
        staffTitle,
        message,
      });

      setFeedback(result);

      if (result.success) {
        const refreshed = await fetchCommunicationCenterDataAction();
        setLogs(refreshed.logs);
        setMessage("");
        if (recipientMode === "multiple") {
          setSelectedUserIds([]);
        }
      }
    });
  }

  const submitLabel =
    recipientMode === "single"
      ? "Send Email"
      : recipientCount > 0
        ? `Send to ${recipientCount} recipient${recipientCount === 1 ? "" : "s"}`
        : "Send Broadcast";

  return (
    <div className="space-y-6">
      <div className="card-surface p-6 md:p-8">
        <h2 className="heading-primary text-2xl">Communication Center</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Send institutional mortgage communications from the appropriate Orbit
          Mortgage department. Broadcast announcements to all members or selected
          clients. All messages are logged automatically.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-brand-navy">
              Recipients
            </legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: "single", label: "Single recipient" },
                  { value: "multiple", label: "Multiple users" },
                  { value: "all", label: "All members" },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={`inline-flex cursor-pointer items-center rounded-full border px-4 py-2 text-sm transition-colors ${
                    recipientMode === option.value
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-brand-border bg-white text-brand-navy hover:border-brand-navy/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="recipientMode"
                    value={option.value}
                    checked={recipientMode === option.value}
                    onChange={() => handleRecipientModeChange(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          {recipientMode === "single" ? (
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-brand-navy">
                  Recipient
                </span>
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
                <span className="text-sm font-semibold text-brand-navy">
                  Recipient Email
                </span>
                <Input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  placeholder="client@example.com"
                />
              </label>
            </div>
          ) : null}

          {recipientMode === "multiple" ? (
            <div className="space-y-3 rounded-xl border border-brand-border bg-brand-surface/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-brand-navy">
                  Select recipients ({selectedUserIds.length} selected)
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllFilteredUsers}
                  >
                    Select all shown
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearSelectedUsers}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <Input
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Search by name or email..."
              />

              <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-brand-border bg-white p-3">
                {filteredUsers.length === 0 ? (
                  <p className="px-2 py-4 text-sm text-muted-foreground">
                    No users match your search.
                  </p>
                ) : (
                  filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-brand-surface/60"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="mt-1"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-brand-navy">
                          {user.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {user.email}
                          {user.role !== "client" ? ` · ${user.role}` : ""}
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {recipientMode === "all" ? (
            <div className="space-y-3 rounded-xl border border-brand-border bg-brand-surface/40 p-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-brand-navy">
                  Broadcast audience
                </span>
                <select
                  value={audience}
                  onChange={(event) => setAudience(event.target.value as Audience)}
                  className="h-11 w-full rounded-xl border border-brand-border bg-white px-3 text-sm"
                >
                  <option value="clients">
                    All clients ({clientCount} with email)
                  </option>
                  <option value="all">
                    All members ({memberCount} with email)
                  </option>
                </select>
              </label>
              <p className="text-sm text-muted-foreground">
                This will send the same announcement to every member in the
                selected audience using the Orbit Mortgage System department.
              </p>
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brand-navy">
                Department
              </span>
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
              <span className="text-sm font-semibold text-brand-navy">
                Template
              </span>
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
            <span className="text-sm font-semibold text-brand-navy">
              Email Subject
            </span>
            <Input
              required
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Subject line the client sees in their inbox"
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brand-navy">
                Email Headline
              </span>
              <Input
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                placeholder="Headline shown at the top of the email body"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brand-navy">
                Sender Title
              </span>
              <Input
                value={staffTitle}
                onChange={(event) => setStaffTitle(event.target.value)}
                placeholder="Senior Loan Officer"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-brand-navy">
              Sender Name
            </span>
            <Input
              value={staffName}
              onChange={(event) => setStaffName(event.target.value)}
              placeholder="Name shown in the email signature"
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

          {recipientMode === "single" && selectedUser ? (
            <p className="text-sm text-muted-foreground">
              Sending to {selectedUser.name} as{" "}
              {
                DEPARTMENT_OPTIONS.find((option) => option.value === department)
                  ?.label
              }
              .
            </p>
          ) : null}

          {recipientMode !== "single" && recipientCount > 0 ? (
            <p className="text-sm text-muted-foreground">
              Ready to broadcast to {recipientCount} recipient
              {recipientCount === 1 ? "" : "s"} from{" "}
              {
                DEPARTMENT_OPTIONS.find((option) => option.value === department)
                  ?.label
              }
              .
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
            {isPending ? "Sending..." : submitLabel}
          </Button>
        </form>
      </div>

      <div className="card-surface p-6 md:p-8">
        <h3 className="text-lg font-semibold text-brand-navy">
          Recent Email Activity
        </h3>
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
