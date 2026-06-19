import { NextResponse } from "next/server";

import {
  sendSupabaseAuthEmailFromHook,
  type SupabaseSendEmailHookPayload,
} from "@/lib/auth/auth-email-delivery";
import { verifySupabaseAuthHookRequest } from "@/lib/auth/verify-webhook";

export async function POST(request: Request) {
  const payloadText = await request.text();

  if (!verifySupabaseAuthHookRequest(request, payloadText)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: SupabaseSendEmailHookPayload;
  try {
    payload = JSON.parse(payloadText) as SupabaseSendEmailHookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await sendSupabaseAuthEmailFromHook(payload);
  if (!result.ok) {
    console.error("[auth/send-email-hook] Delivery failed:", result.error);
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({});
}
