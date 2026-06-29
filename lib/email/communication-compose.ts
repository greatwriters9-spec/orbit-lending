import {
  EMAIL_TEMPLATE_LABELS,
  renderEmailFromTemplate,
  resolveTemplateDepartment,
} from "@/lib/email/templates/catalog";
import {
  sanitizeEmailCompositionHtml,
  stripHtmlToText,
} from "@/lib/email/sanitize-html";
import type { EmailDepartment, EmailTemplateKey } from "@/lib/email/types";

export type CommunicationRecipient = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type CommunicationComposeInput = {
  recipientMode: "single" | "multiple" | "all";
  audience: "clients" | "all";
  recipientEmail?: string;
  userId?: string;
  userIds?: string[];
  department: EmailDepartment;
  template: string;
  subject: string;
  headline?: string;
  staffName?: string;
  staffTitle?: string;
  message: string;
};

export type CommunicationPreviewCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail?: string;
};

export type CommunicationPreviewResult = {
  html: string;
  text: string;
  subject: string;
  headline: string;
  department: EmailDepartment;
  template: EmailTemplateKey;
  templateLabel: string;
  recipientCount: number;
  recipientPreview: string[];
  checks: CommunicationPreviewCheck[];
  readyToSend: boolean;
};

export function sanitizeCommunicationMessage(message: string) {
  return sanitizeEmailCompositionHtml(message);
}

export function buildCommunicationEmailData(
  input: CommunicationComposeInput,
  sanitizedMessage: string,
) {
  return {
    subject: input.subject,
    headline: input.headline?.trim() || input.subject,
    message: sanitizedMessage,
    staffName: input.staffName?.trim() || undefined,
    staffTitle: input.staffTitle?.trim() || undefined,
    department: input.department,
  };
}

export function buildCommunicationChecks(input: {
  compose: CommunicationComposeInput;
  sanitizedMessage: string;
  recipients: CommunicationRecipient[];
}): CommunicationPreviewCheck[] {
  const messageText = stripHtmlToText(input.sanitizedMessage);
  const subject = input.compose.subject.trim();

  return [
    {
      id: "subject",
      label: "Subject line",
      ok: subject.length >= 3,
      detail: subject || "Missing subject",
    },
    {
      id: "message",
      label: "Message body",
      ok: messageText.length >= 10,
      detail:
        messageText.length >= 10
          ? `${messageText.length} characters`
          : "Message is too short",
    },
    {
      id: "recipients",
      label: "Recipients",
      ok: input.recipients.length > 0,
      detail:
        input.recipients.length > 0
          ? `${input.recipients.length} recipient${input.recipients.length === 1 ? "" : "s"}`
          : "No recipients selected",
    },
    {
      id: "headline",
      label: "Email headline",
      ok: Boolean(input.compose.headline?.trim() || subject),
      detail: input.compose.headline?.trim() || subject || "Missing headline",
    },
    {
      id: "sender",
      label: "Sender details",
      ok: Boolean(input.compose.staffName?.trim()),
      detail: input.compose.staffName?.trim() || "Add a sender name",
    },
  ];
}

export async function renderCommunicationPreview(input: {
  compose: CommunicationComposeInput;
  sanitizedMessage: string;
  recipients: CommunicationRecipient[];
}): Promise<CommunicationPreviewResult> {
  const template = input.compose.template as EmailTemplateKey;
  const emailData = buildCommunicationEmailData(input.compose, input.sanitizedMessage);
  const rendered = await renderEmailFromTemplate(template, emailData, {
    subject: input.compose.subject,
    customMessage: input.sanitizedMessage,
  });

  const checks = buildCommunicationChecks(input);

  return {
    html: rendered.html,
    text: rendered.text,
    subject: input.compose.subject,
    headline: emailData.headline,
    department: input.compose.department,
    template,
    templateLabel: EMAIL_TEMPLATE_LABELS[template] ?? template,
    recipientCount: input.recipients.length,
    recipientPreview: input.recipients.slice(0, 8).map((recipient) => recipient.email),
    checks,
    readyToSend: checks.every((check) => check.ok),
  };
}

export function buildCommunicationLogMetadata(input: {
  compose: CommunicationComposeInput;
  sanitizedMessage: string;
  renderedHtml: string;
  recipientCount: number;
}) {
  return {
    source: "admin_communication_center",
    recipientMode: input.compose.recipientMode,
    audience: input.compose.audience,
    broadcast: input.compose.recipientMode !== "single",
    messageFormat: "html",
    renderedHtml: input.renderedHtml,
    composition: {
      subject: input.compose.subject,
      headline: input.compose.headline?.trim() || input.compose.subject,
      messageHtml: input.sanitizedMessage,
      staffName: input.compose.staffName?.trim() || null,
      staffTitle: input.compose.staffTitle?.trim() || null,
      department: input.compose.department,
      template: input.compose.template,
      templateLabel:
        EMAIL_TEMPLATE_LABELS[input.compose.template as EmailTemplateKey] ??
        input.compose.template,
      templateDepartment: resolveTemplateDepartment(
        input.compose.template as EmailTemplateKey,
      ),
      recipientCount: input.recipientCount,
    },
  };
}
