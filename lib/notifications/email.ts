import { cleanEnv } from "@/lib/env";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type EmailSendResult =
  | { ok: true; id: string }
  | { ok: false; error: string; status?: number };

function getFromAddress(): string {
  return (
    process.env.EMAIL_FROM ??
    process.env.RESEND_FROM ??
    "Orbit Mortgage <onboarding@resend.dev>"
  );
}

function getDevFallbackFrom(): string {
  return process.env.RESEND_DEV_FROM ?? "Orbit Mortgage <onboarding@resend.dev>";
}

export async function sendTransactionalEmail(
  payload: EmailPayload,
): Promise<EmailSendResult> {
  const apiKey = cleanEnv(process.env.RESEND_API_KEY);
  const from = getFromAddress();

  const testOverride = cleanEnv(process.env.RESEND_TEST_TO);
  const effectivePayload =
    testOverride && process.env.NODE_ENV !== "production"
      ? {
          ...payload,
          subject: `[DEV → ${payload.to}] ${payload.subject}`,
          to: testOverride,
        }
      : payload;

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email:dev] RESEND_API_KEY not set — skipped send", {
        to: payload.to,
        subject: payload.subject,
      });
    }
    return { ok: false, error: "RESEND_API_KEY is not configured." };
  }

  let result = await postResendEmail(apiKey, from, effectivePayload);

  const domainNotVerified =
    !result.ok &&
    result.error.toLowerCase().includes("domain is not verified");

  if (domainNotVerified && from !== getDevFallbackFrom()) {
    console.warn(
      `[email] Sender "${from}" domain not verified in Resend. Retrying with ${getDevFallbackFrom()}`,
    );
    result = await postResendEmail(apiKey, getDevFallbackFrom(), effectivePayload);
  }

  if (!result.ok) {
    console.error("[email] Send failed:", {
      to: effectivePayload.to,
      intendedTo: payload.to,
      subject: payload.subject,
      from,
      status: result.status,
      error: result.error,
    });
  }

  return result;
}

async function postResendEmail(
  apiKey: string,
  from: string,
  payload: EmailPayload,
): Promise<EmailSendResult> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  const body = await response.text();

  if (!response.ok) {
    let message = body;
    try {
      const parsed = JSON.parse(body) as { message?: string };
      message = parsed.message ?? body;
    } catch {
      // keep raw body
    }
    return { ok: false, error: message, status: response.status };
  }

  try {
    const parsed = JSON.parse(body) as { id?: string };
    return { ok: true, id: parsed.id ?? "unknown" };
  } catch {
    return { ok: true, id: "unknown" };
  }
}

export function buildEmailHtml(title: string, message: string, actionUrl?: string) {
  const actionBlock = actionUrl
    ? `<p style="margin-top:24px"><a href="${actionUrl}" style="background:#2563EB;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">View in Orbit Mortgage</a></p>`
    : "";

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
      <h1 style="color:#0F172A;font-size:20px;margin:0 0 12px">${title}</h1>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0">${message}</p>
      ${actionBlock}
      <p style="color:#94A3B8;font-size:12px;margin-top:32px">Orbit Mortgage · Secure Client Portal</p>
    </div>
  `;
}

