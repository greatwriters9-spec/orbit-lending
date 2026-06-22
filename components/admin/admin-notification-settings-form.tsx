"use client";

import { useState, useTransition } from "react";

import {
  sendAdminTestNotificationAction,
  updateAdminNotificationSettingsAction,
} from "@/lib/notifications/admin-settings-actions";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import type { AdminNotificationSettings } from "@/types/admin-notifications";

type AdminNotificationSettingsFormProps = {
  initialSettings: AdminNotificationSettings;
};

export function AdminNotificationSettingsForm({
  initialSettings,
}: AdminNotificationSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof AdminNotificationSettings>(
    key: K,
    value: AdminNotificationSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function saveSettings() {
    startTransition(async () => {
      const result = await updateAdminNotificationSettingsAction(settings);
      setFeedback(result.error ?? result.success ?? null);
    });
  }

  function sendTest() {
    startTransition(async () => {
      const result = await sendAdminTestNotificationAction();
      setFeedback(result.error ?? result.success ?? null);
    });
  }

  return (
    <section className="card-surface space-y-5 p-6">
      <div>
        <h3 className="text-sm font-semibold text-brand-navy">
          Admin Notification Engine
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure email, Telegram, and in-app alerts for operational events.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-brand-navy">Primary Email</span>
          <Input
            value={settings.primaryEmail}
            onChange={(event) => updateField("primaryEmail", event.target.value)}
            placeholder="alerts@orbittmortgage.com"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-brand-navy">Secondary Email</span>
          <Input
            value={settings.secondaryEmail}
            onChange={(event) => updateField("secondaryEmail", event.target.value)}
            placeholder="backup@orbittmortgage.com"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-brand-navy">Telegram Chat ID</span>
          <Input
            value={settings.telegramChatId}
            onChange={(event) => updateField("telegramChatId", event.target.value)}
            placeholder="-1001234567890"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-brand-navy">Telegram Bot Token</span>
          <Input
            type="password"
            value={settings.telegramBotToken}
            onChange={(event) => updateField("telegramBotToken", event.target.value)}
            placeholder="Optional if TELEGRAM_BOT_TOKEN is set in env"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.emailEnabled}
            onChange={(event) => updateField("emailEnabled", event.target.checked)}
          />
          Email notifications enabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.inAppEnabled}
            onChange={(event) => updateField("inAppEnabled", event.target.checked)}
          />
          In-app notifications enabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.telegramEnabled}
            onChange={(event) => updateField("telegramEnabled", event.target.checked)}
          />
          Telegram notifications enabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.notificationMode === "critical_only"}
            onChange={(event) =>
              updateField(
                "notificationMode",
                event.target.checked ? "critical_only" : "all",
              )
            }
          />
          Critical alerts only
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={isPending}
          onClick={saveSettings}
          className="bg-brand-navy text-white hover:bg-brand-navy/90"
        >
          Save Notification Settings
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={sendTest}
          className="border-brand-border"
        >
          Send Test Notification
        </Button>
      </div>

      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
    </section>
  );
}
