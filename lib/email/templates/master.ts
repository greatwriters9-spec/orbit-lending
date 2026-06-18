import type { EmailStatusTone } from "@/lib/email/types";
import { getAppOrigin, getSupportEmailAddress } from "@/lib/email/config";

const COLORS = {
  primary: "#1E4ED8",
  approved: "#16A34A",
  pending: "#F59E0B",
  rejected: "#DC2626",
  text: "#1E293B",
  muted: "#64748B",
  border: "#E2E8F0",
  background: "#F8FAFC",
} as const;

function toneColor(tone: EmailStatusTone): string {
  switch (tone) {
    case "approved":
      return COLORS.approved;
    case "pending":
      return COLORS.pending;
    case "rejected":
      return COLORS.rejected;
    default:
      return COLORS.primary;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatParagraphs(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${COLORS.text}">${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`,
    )
    .join("");
}

function buildLogoBlock(): string {
  const origin = getAppOrigin();
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 8px">
      <tr>
        <td style="padding-right:10px;vertical-align:middle">
          <div style="width:36px;height:36px;position:relative">
            <span style="position:absolute;top:0;left:0;width:22px;height:22px;background:#1a4a96;border-radius:3px;display:block"></span>
            <span style="position:absolute;right:0;bottom:0;width:22px;height:22px;background:#3d7dd6;border-radius:3px;display:block"></span>
            <span style="position:absolute;top:50%;left:50%;width:10px;height:10px;margin:-5px 0 0 -5px;background:#0a2463;border-radius:2px;display:block"></span>
          </div>
        </td>
        <td style="vertical-align:middle;font-family:Inter,Arial,sans-serif;font-size:20px;font-weight:700;color:${COLORS.text};letter-spacing:-0.02em">
          Orbit Mortgage
        </td>
      </tr>
    </table>
    <p style="margin:0 0 24px;font-family:Inter,Arial,sans-serif;font-size:12px;color:${COLORS.muted};text-align:center">
      Institutional Mortgage Banking
    </p>
    <img src="${origin}/favicon.ico" alt="" width="1" height="1" style="display:none" />
  `;
}

export type MasterEmailContent = {
  headline: string;
  body: string;
  tone?: EmailStatusTone;
  badge?: string;
  detailRows?: Array<{ label: string; value: string }>;
  ctaLabel?: string;
  ctaUrl?: string;
  departmentLabel?: string;
};

export function renderMasterEmail(content: MasterEmailContent): {
  html: string;
  text: string;
} {
  const tone = content.tone ?? "neutral";
  const accent = toneColor(tone);
  const supportEmail = getSupportEmailAddress();

  const badgeBlock = content.badge
    ? `<p style="margin:0 0 20px"><span style="display:inline-block;padding:6px 12px;border-radius:999px;background:${accent}14;color:${accent};font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase">${escapeHtml(content.badge)}</span></p>`
    : "";

  const detailBlock =
    content.detailRows && content.detailRows.length > 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid ${COLORS.border};border-radius:12px;overflow:hidden">
          ${content.detailRows
            .map(
              (row, index) => `
            <tr>
              <td style="padding:12px 16px;background:${index % 2 === 0 ? "#FFFFFF" : COLORS.background};font-family:Inter,Arial,sans-serif;font-size:13px;color:${COLORS.muted};width:42%;border-top:${index === 0 ? "none" : `1px solid ${COLORS.border}`}">${escapeHtml(row.label)}</td>
              <td style="padding:12px 16px;background:${index % 2 === 0 ? "#FFFFFF" : COLORS.background};font-family:Inter,Arial,sans-serif;font-size:14px;font-weight:600;color:${COLORS.text};border-top:${index === 0 ? "none" : `1px solid ${COLORS.border}`}">${escapeHtml(row.value)}</td>
            </tr>`,
            )
            .join("")}
        </table>`
      : "";

  const ctaBlock =
    content.ctaLabel && content.ctaUrl
      ? `<p style="margin:28px 0 0;text-align:center">
          <a href="${escapeHtml(content.ctaUrl)}" style="display:inline-block;background:${COLORS.primary};color:#FFFFFF;text-decoration:none;font-family:Inter,Arial,sans-serif;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px">${escapeHtml(content.ctaLabel)}</a>
        </p>`
      : "";

  const departmentBlock = content.departmentLabel
    ? `<p style="margin:0 0 18px;font-family:Inter,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${COLORS.muted}">${escapeHtml(content.departmentLabel)}</p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(content.headline)}</title>
  </head>
  <body style="margin:0;padding:0;background:${COLORS.background}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.background};padding:32px 16px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid ${COLORS.border};border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,0.06)">
            <tr>
              <td style="height:4px;background:linear-gradient(90deg, ${COLORS.primary}, #3B82F6)"></td>
            </tr>
            <tr>
              <td style="padding:32px 28px 12px;text-align:center">
                ${buildLogoBlock()}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 32px;font-family:Inter,Arial,sans-serif">
                ${departmentBlock}
                ${badgeBlock}
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:${COLORS.text};letter-spacing:-0.02em">${escapeHtml(content.headline)}</h1>
                ${formatParagraphs(content.body)}
                ${detailBlock}
                ${ctaBlock}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;background:${COLORS.background};border-top:1px solid ${COLORS.border};font-family:Inter,Arial,sans-serif;text-align:center">
                <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${COLORS.text}">Orbit Mortgage</p>
                <p style="margin:0 0 12px;font-size:12px;color:${COLORS.muted}">Powered by Pathward National Bank</p>
                <p style="margin:0;font-size:12px"><a href="mailto:${escapeHtml(supportEmail)}" style="color:${COLORS.primary};text-decoration:none">${escapeHtml(supportEmail)}</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const detailText =
    content.detailRows && content.detailRows.length > 0
      ? `\n\n${content.detailRows.map((row) => `${row.label}: ${row.value}`).join("\n")}`
      : "";

  const text = `${content.headline}\n\n${content.body}${detailText}${
    content.ctaLabel && content.ctaUrl ? `\n\n${content.ctaLabel}: ${content.ctaUrl}` : ""
  }\n\n—\nOrbit Mortgage\nPowered by Pathward National Bank\n${supportEmail}`;

  return { html, text };
}
