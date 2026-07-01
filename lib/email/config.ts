import { cleanEnv } from "@/lib/env";
import {
  getEmailSender,
  getEmailSenderByDepartment,
} from "@/lib/email/emailRouter";
import type { EmailDepartment } from "@/lib/email/types";

/** Public-facing brand name used in legacy helpers and dev fallbacks. */
export const BRAND_DISPLAY_NAME = "Orbitt Mortgage";

/** @deprecated Use getEmailSender() — retained for env fallbacks only. */
export const PRIMARY_SENDER_EMAIL = "support@orbittmortgage.com";

/** @deprecated Use getEmailSender() — retained for env fallbacks only. */
export const PRIMARY_REPLY_TO_EMAIL = "support@orbittmortgage.com";

const DEPARTMENT_ENV_KEYS: Record<
  EmailDepartment,
  { address: string; displayName: string }
> = {
  system: {
    address: "EMAIL_FROM_SYSTEM",
    displayName: "EMAIL_NAME_SYSTEM",
  },
  loan_officer: {
    address: "EMAIL_FROM_LOAN_OFFICER",
    displayName: "EMAIL_NAME_LOAN_OFFICER",
  },
  underwriting: {
    address: "EMAIL_FROM_UNDERWRITING",
    displayName: "EMAIL_NAME_UNDERWRITING",
  },
  funding: {
    address: "EMAIL_FROM_FUNDING",
    displayName: "EMAIL_NAME_FUNDING",
  },
  closings: {
    address: "EMAIL_FROM_CLOSINGS",
    displayName: "EMAIL_NAME_CLOSINGS",
  },
  compliance: {
    address: "EMAIL_FROM_COMPLIANCE",
    displayName: "EMAIL_NAME_COMPLIANCE",
  },
  support: {
    address: "EMAIL_FROM_SUPPORT",
    displayName: "EMAIL_NAME_SUPPORT",
  },
  executive: {
    address: "EMAIL_FROM_EXECUTIVE",
    displayName: "EMAIL_NAME_EXECUTIVE",
  },
};

export function getAppOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function getWebsiteDomain(): string {
  return (
    process.env.NEXT_PUBLIC_WEBSITE_DOMAIN?.trim() ||
    "www.orbittmortgage.com"
  );
}

export function getWebsiteUrl(): string {
  const domain = getWebsiteDomain();
  if (domain.startsWith("http://") || domain.startsWith("https://")) {
    return domain.replace(/\/$/, "");
  }
  return `https://${domain}`;
}

export const ORBIT_MORTGAGE_TAGLINE = "Home financing made simple";

export function getSupportEmailAddress(): string {
  return getEmailSenderByDepartment("support").replyTo;
}

export function getReplyToEmail(): string {
  return (
    cleanEnv(process.env.EMAIL_REPLY_TO) ||
    getEmailSenderByDepartment("support").replyTo
  );
}

export function getBrandedSender(): {
  address: string;
  displayName: string;
  from: string;
  replyTo: string;
} {
  const sender = getEmailSender("support");
  return {
    address: sender.fromEmail,
    displayName: sender.fromName,
    from: sender.from,
    replyTo: sender.replyTo,
  };
}

/** Resolve sender identity for a department (Communication Center override). */
export function resolveDepartmentSender(department: EmailDepartment): {
  address: string;
  displayName: string;
  from: string;
  replyTo: string;
} {
  const sender = getEmailSenderByDepartment(department);
  return {
    address: sender.fromEmail,
    displayName: sender.fromName,
    from: sender.from,
    replyTo: sender.replyTo,
  };
}

export function getResendApiKey(): string | null {
  const key = cleanEnv(process.env.RESEND_API_KEY);
  return key || null;
}

export function getEmailTestOverride(): string | null {
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  const testTo = cleanEnv(process.env.RESEND_TEST_TO);
  return testTo || null;
}

export function getDevFallbackFrom(): string {
  const devFrom = cleanEnv(process.env.RESEND_DEV_FROM);
  if (devFrom) {
    return devFrom.includes("<") ? devFrom : `${BRAND_DISPLAY_NAME} <${devFrom}>`;
  }
  return `${BRAND_DISPLAY_NAME} <onboarding@resend.dev>`;
}

/** @deprecated Department-specific env keys are retained for compatibility only. */
export function getLegacyDepartmentEnvKeys(department: EmailDepartment) {
  return DEPARTMENT_ENV_KEYS[department];
}

export { getEmailSender, getEmailSenderByDepartment } from "@/lib/email/emailRouter";
