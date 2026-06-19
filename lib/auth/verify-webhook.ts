import { createHmac, timingSafeEqual } from "crypto";

import { cleanEnv } from "@/lib/env";

const WEBHOOK_TOLERANCE_SECONDS = 300;

export function normalizeHookSecret(rawSecret: string): string {
  return rawSecret.replace(/^v1,whsec_/, "").trim();
}

export function getSupabaseAuthHookSecret(): string | null {
  const secret =
    cleanEnv(process.env.SUPABASE_AUTH_HOOK_SECRET) ||
    cleanEnv(process.env.SEND_EMAIL_HOOK_SECRET);

  if (!secret) {
    return null;
  }

  return normalizeHookSecret(secret);
}

function decodeSecretBytes(secret: string): Buffer {
  return Buffer.from(secret, "base64");
}

function verifySignature(
  expectedSignature: string,
  providedSignature: string,
): boolean {
  try {
    const expected = Buffer.from(expectedSignature, "base64");
    const provided = Buffer.from(providedSignature, "base64");

    if (expected.length !== provided.length) {
      return false;
    }

    return timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

export function verifyStandardWebhookRequest(input: {
  payload: string;
  headers: Headers;
  secret: string;
}): boolean {
  const webhookId = input.headers.get("webhook-id");
  const webhookTimestamp = input.headers.get("webhook-timestamp");
  const webhookSignature = input.headers.get("webhook-signature");

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return false;
  }

  const timestamp = Number.parseInt(webhookTimestamp, 10);
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > WEBHOOK_TOLERANCE_SECONDS) {
    return false;
  }

  const signedContent = `${webhookId}.${webhookTimestamp}.${input.payload}`;
  const expected = createHmac("sha256", decodeSecretBytes(input.secret))
    .update(signedContent)
    .digest("base64");

  return webhookSignature
    .split(" ")
    .some((entry) => {
      const [version, signature] = entry.split(",");
      return version === "v1" && verifySignature(expected, signature ?? "");
    });
}

export function verifySupabaseAuthHookRequest(
  request: Request,
  payload: string,
): boolean {
  const secret = getSupabaseAuthHookSecret();
  if (!secret) {
    return false;
  }

  if (
    verifyStandardWebhookRequest({
      payload,
      headers: request.headers,
      secret,
    })
  ) {
    return true;
  }

  const rawSecret =
    cleanEnv(process.env.SUPABASE_AUTH_HOOK_SECRET) ||
    cleanEnv(process.env.SEND_EMAIL_HOOK_SECRET);
  const authorization = request.headers.get("authorization") ?? "";
  const bearer = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : authorization.trim();

  return (
    bearer.length > 0 &&
    (bearer === secret || bearer === rawSecret || bearer === normalizeHookSecret(rawSecret))
  );
}
