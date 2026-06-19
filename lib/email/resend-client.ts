import { getDevFallbackFrom, getReplyToEmail, getResendApiKey } from "@/lib/email/config";

export type ResendDeliveryInput = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type ResendDeliveryResult =
  | { ok: true; id: string }
  | { ok: false; error: string; status?: number };

export async function deliverResendEmail(
  input: ResendDeliveryInput,
): Promise<ResendDeliveryResult> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo ?? getReplyToEmail(),
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

export async function deliverResendEmailWithDevFallback(
  input: ResendDeliveryInput,
): Promise<ResendDeliveryResult> {
  let result = await deliverResendEmail(input);

  const domainNotVerified =
    !result.ok && result.error.toLowerCase().includes("domain is not verified");

  if (
    domainNotVerified &&
    input.from !== getDevFallbackFrom() &&
    process.env.NODE_ENV !== "production"
  ) {
    result = await deliverResendEmail({
      ...input,
      from: getDevFallbackFrom(),
    });
  }

  return result;
}
