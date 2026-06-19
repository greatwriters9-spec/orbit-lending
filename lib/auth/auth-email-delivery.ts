import { cleanEnv } from "@/lib/env";
import { sendEmail } from "@/lib/email/service";
import { resolveTemplateDepartment } from "@/lib/email/templates/catalog";
import type { EmailTemplateKey } from "@/lib/email/types";

export type SupabaseAuthEmailActionType =
  | "signup"
  | "recovery"
  | "magiclink"
  | "invite"
  | "email"
  | "email_change"
  | "reauthentication"
  | "password_changed_notification"
  | "email_changed_notification"
  | "phone_changed_notification"
  | "identity_linked_notification"
  | "identity_unlinked_notification"
  | "mfa_factor_enrolled_notification"
  | "mfa_factor_unenrolled_notification";

export type SupabaseAuthEmailUser = {
  id: string;
  email?: string;
  new_email?: string;
  user_metadata?: Record<string, unknown>;
};

export type SupabaseAuthEmailData = {
  token?: string;
  token_hash?: string;
  token_new?: string;
  token_hash_new?: string;
  redirect_to?: string;
  email_action_type: SupabaseAuthEmailActionType | string;
  site_url?: string;
};

export type SupabaseSendEmailHookPayload = {
  user: SupabaseAuthEmailUser;
  email_data: SupabaseAuthEmailData;
};

type AuthEmailDelivery = {
  recipient: string;
  template: EmailTemplateKey;
  data: Record<string, string | undefined>;
};

function getFirstName(metadata?: Record<string, unknown>): string | undefined {
  const firstName = metadata?.first_name;
  return typeof firstName === "string" && firstName.trim() ? firstName.trim() : undefined;
}

export function buildSupabaseAuthActionLink(input: {
  token: string;
  tokenHash: string;
  type: string;
  redirectTo?: string;
}): string | null {
  const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!supabaseUrl || !input.token || !input.tokenHash || !input.type) {
    return null;
  }

  const params = new URLSearchParams({
    token: input.tokenHash,
    type: input.type,
  });

  if (input.redirectTo) {
    params.set("redirect_to", input.redirectTo);
  }

  return `${supabaseUrl.replace(/\/$/, "")}/auth/v1/verify?${params.toString()}`;
}

function resolveAuthEmailTemplate(
  actionType: string,
): EmailTemplateKey {
  switch (actionType) {
    case "signup":
    case "invite":
      return "verify_email";
    case "recovery":
      return "password_reset";
    case "magiclink":
    case "email":
      return "magic_link";
    case "email_change":
      return "verify_email";
    case "reauthentication":
      return "auth_verification_code";
    case "password_changed_notification":
    case "email_changed_notification":
    case "phone_changed_notification":
    case "identity_linked_notification":
    case "identity_unlinked_notification":
    case "mfa_factor_enrolled_notification":
    case "mfa_factor_unenrolled_notification":
      return "account_notification";
    default:
      return "account_notification";
  }
}

function resolveNotificationCopy(actionType: string): {
  headline: string;
  message: string;
} {
  switch (actionType) {
    case "password_changed_notification":
      return {
        headline: "Your password was changed",
        message:
          "Your Orbitt Mortgage account password was updated. If you did not make this change, contact support immediately.",
      };
    case "email_changed_notification":
      return {
        headline: "Your email address was changed",
        message:
          "The email address on your Orbitt Mortgage account was updated. If you did not authorize this change, contact support immediately.",
      };
    case "phone_changed_notification":
      return {
        headline: "Your phone number was changed",
        message:
          "The phone number on your Orbitt Mortgage account was updated. If you did not authorize this change, contact support immediately.",
      };
    case "identity_linked_notification":
      return {
        headline: "A sign-in method was linked",
        message:
          "A new sign-in method was linked to your Orbitt Mortgage account. If this wasn't you, contact support immediately.",
      };
    case "identity_unlinked_notification":
      return {
        headline: "A sign-in method was removed",
        message:
          "A sign-in method was removed from your Orbitt Mortgage account. If this wasn't you, contact support immediately.",
      };
    case "mfa_factor_enrolled_notification":
      return {
        headline: "Multi-factor authentication enabled",
        message:
          "A new multi-factor authentication method was added to your Orbitt Mortgage account.",
      };
    case "mfa_factor_unenrolled_notification":
      return {
        headline: "Multi-factor authentication removed",
        message:
          "A multi-factor authentication method was removed from your Orbitt Mortgage account.",
      };
    default:
      return {
        headline: "Account update",
        message: "You have a new security update on your Orbitt Mortgage account.",
      };
  }
}

function resolveAuthEmailData(input: {
  template: EmailTemplateKey;
  actionType: string;
  actionUrl?: string;
  otpCode?: string;
  firstName?: string;
}): Record<string, string | undefined> {
  const { template, actionType, actionUrl, otpCode, firstName } = input;

  switch (template) {
    case "verify_email":
      return {
        verifyUrl: actionUrl,
        firstName,
        headline:
          actionType === "invite"
            ? "You've been invited to Orbitt Mortgage"
            : actionType === "email_change"
              ? "Confirm your new email address"
              : undefined,
        message:
          actionType === "invite"
            ? "You've been invited to join Orbitt Mortgage. Confirm your email address to activate your account."
            : actionType === "email_change"
              ? "Please confirm this email change to keep your Orbitt Mortgage account secure."
              : undefined,
      };
    case "password_reset":
      return { resetUrl: actionUrl, firstName };
    case "magic_link":
      return { magicLinkUrl: actionUrl, firstName };
    case "auth_verification_code":
      return {
        otpCode,
        firstName,
        headline: "Your verification code",
        message: `Use this one-time verification code to continue: ${otpCode ?? "------"}`,
      };
    case "account_notification": {
      const copy = resolveNotificationCopy(actionType);
      return {
        headline: copy.headline,
        message: copy.message,
        actionUrl,
        firstName,
      };
    }
    default:
      return {
        headline: "Account update",
        message: "Please use the secure link below to continue.",
        actionUrl,
        firstName,
      };
  }
}

function buildDeliveriesForHookPayload(
  payload: SupabaseSendEmailHookPayload,
): AuthEmailDelivery[] {
  const actionType = payload.email_data.email_action_type;
  const template = resolveAuthEmailTemplate(actionType);
  const firstName = getFirstName(payload.user.user_metadata);
  const redirectTo = payload.email_data.redirect_to;
  const recipient = payload.user.email?.trim();

  if (
    template === "account_notification" &&
    actionType.endsWith("_notification")
  ) {
    if (!recipient) {
      return [];
    }

    return [
      {
        recipient,
        template,
        data: resolveAuthEmailData({
          template,
          actionType,
          firstName,
        }),
      },
    ];
  }

  if (actionType === "email_change") {
    const deliveries: AuthEmailDelivery[] = [];
    const currentEmail = payload.user.email?.trim();
    const newEmail = payload.user.new_email?.trim();

    if (
      currentEmail &&
      payload.email_data.token &&
      payload.email_data.token_hash_new
    ) {
      const actionUrl = buildSupabaseAuthActionLink({
        token: payload.email_data.token,
        tokenHash: payload.email_data.token_hash_new,
        type: actionType,
        redirectTo,
      });

      if (actionUrl) {
        deliveries.push({
          recipient: currentEmail,
          template: "verify_email",
          data: resolveAuthEmailData({
            template: "verify_email",
            actionType,
            actionUrl,
            firstName,
          }),
        });
      }
    }

    if (
      newEmail &&
      payload.email_data.token_new &&
      payload.email_data.token_hash
    ) {
      const actionUrl = buildSupabaseAuthActionLink({
        token: payload.email_data.token_new,
        tokenHash: payload.email_data.token_hash,
        type: actionType,
        redirectTo,
      });

      if (actionUrl) {
        deliveries.push({
          recipient: newEmail,
          template: "verify_email",
          data: resolveAuthEmailData({
            template: "verify_email",
            actionType,
            actionUrl,
            firstName,
          }),
        });
      }
    }

    if (deliveries.length > 0) {
      return deliveries;
    }

    const fallbackRecipient =
      payload.user.new_email?.trim() || payload.user.email?.trim();
    const fallbackToken =
      payload.email_data.token || payload.email_data.token_new;
    const fallbackTokenHash =
      payload.email_data.token_hash || payload.email_data.token_hash_new;

    if (fallbackRecipient && fallbackToken && fallbackTokenHash) {
      const actionUrl = buildSupabaseAuthActionLink({
        token: fallbackToken,
        tokenHash: fallbackTokenHash,
        type: actionType,
        redirectTo,
      });

      if (actionUrl) {
        return [
          {
            recipient: fallbackRecipient,
            template: "verify_email",
            data: resolveAuthEmailData({
              template: "verify_email",
              actionType,
              actionUrl,
              firstName,
            }),
          },
        ];
      }
    }
  }

  if (!recipient) {
    return [];
  }

  if (template === "auth_verification_code") {
    return [
      {
        recipient,
        template,
        data: resolveAuthEmailData({
          template,
          actionType,
          otpCode: payload.email_data.token,
          firstName,
        }),
      },
    ];
  }

  const tokenHash =
    payload.email_data.token_hash || payload.email_data.token_hash_new;
  if (!tokenHash) {
    return [];
  }

  const actionUrl = buildSupabaseAuthActionLink({
    token: tokenHash,
    tokenHash,
    type: actionType,
    redirectTo,
  });

  if (!actionUrl && template !== "account_notification") {
    return [];
  }

  return [
    {
      recipient,
      template,
      data: resolveAuthEmailData({
        template,
        actionType,
        actionUrl: actionUrl ?? undefined,
        firstName,
      }),
    },
  ];
}

export async function sendBrandedAuthEmail(input: {
  userId?: string;
  recipient: string;
  actionType: SupabaseAuthEmailActionType | string;
  actionUrl?: string;
  otpCode?: string;
  firstName?: string;
  metadata?: Record<string, unknown>;
}) {
  const template = resolveAuthEmailTemplate(input.actionType);
  const data = resolveAuthEmailData({
    template,
    actionType: input.actionType,
    actionUrl: input.actionUrl,
    otpCode: input.otpCode,
    firstName: input.firstName,
  });

  return sendEmail({
    department: resolveTemplateDepartment(template),
    template,
    recipient: input.recipient,
    userId: input.userId,
    data,
    metadata: {
      source: "auth_email_delivery",
      emailActionType: input.actionType,
      ...(input.metadata ?? {}),
    },
  });
}

export async function sendSupabaseAuthEmailFromHook(
  payload: SupabaseSendEmailHookPayload,
) {
  const deliveries = buildDeliveriesForHookPayload(payload);

  if (deliveries.length === 0) {
    return {
      ok: false as const,
      error: "Could not resolve branded auth email deliveries for hook payload.",
    };
  }

  for (const delivery of deliveries) {
    const result = await sendEmail({
      department: resolveTemplateDepartment(delivery.template),
      template: delivery.template,
      recipient: delivery.recipient,
      userId: payload.user.id,
      data: delivery.data,
      metadata: {
        source: "supabase_auth_hook",
        emailActionType: payload.email_data.email_action_type,
      },
    });

    if (!result.ok) {
      return result;
    }
  }

  return { ok: true as const };
}

export function actionLinkFromProperties(
  actionLink: string | undefined,
  actionType: SupabaseAuthEmailActionType | string,
  firstName?: string,
) {
  return {
    actionType,
    actionUrl: actionLink,
    firstName,
  };
}
