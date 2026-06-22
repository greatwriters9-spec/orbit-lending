import { cleanEnv } from "@/lib/env";

import { formatTelegramAlert } from "./templates";

export type TelegramNotificationInput = {
  title: string;
  message: string;
  severity?: string;
  entityType?: string;
  entityId?: string;
  dashboardUrl?: string;
  customBody?: string;
  botToken?: string;
  chatId?: string;
};

export type TelegramSendResult =
  | { ok: true }
  | { ok: false; error: string };

export async function sendTelegramNotification(
  input: TelegramNotificationInput,
): Promise<TelegramSendResult> {
  const botToken =
    input.botToken?.trim() || cleanEnv(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = input.chatId?.trim() || cleanEnv(process.env.TELEGRAM_CHAT_ID);

  if (!botToken || !chatId) {
    return { ok: false, error: "Telegram is not configured." };
  }

  const text = formatTelegramAlert({
    title: input.title,
    message: input.message,
    entityType: input.entityType,
    entityId: input.entityId,
    dashboardUrl: input.dashboardUrl,
    customBody: input.customBody,
  });

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        error: body || `Telegram API returned ${response.status}.`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Telegram request failed.",
    };
  }
}
