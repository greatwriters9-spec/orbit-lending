import { cleanEnv } from "@/lib/env";
import type { EmailDepartment } from "@/lib/email/types";

/** Public-facing brand name used in email From headers and templates. */
export const BRAND_DISPLAY_NAME = "Orbitt Mortgage";

/** Verified Resend sending address for all outbound mail. */
export const PRIMARY_SENDER_EMAIL = "support@orbittmortgage.com";

/** Reply-To address for all outbound mail. */
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
  return getReplyToEmail();
}

export function getReplyToEmail(): string {
  return (
    cleanEnv(process.env.EMAIL_REPLY_TO) ||
    cleanEnv(process.env.EMAIL_FROM_SUPPORT) ||
    cleanEnv(process.env.EMAIL_FROM) ||
    PRIMARY_REPLY_TO_EMAIL
  );
}

export function getBrandedSender(): {
  address: string;
  displayName: string;
  from: string;
} {
  const address =
    cleanEnv(process.env.EMAIL_FROM) ||
    cleanEnv(process.env.EMAIL_FROM_SUPPORT) ||
    PRIMARY_SENDER_EMAIL;
  const displayName =
    cleanEnv(process.env.EMAIL_NAME) ||
    cleanEnv(process.env.EMAIL_NAME_SUPPORT) ||
    BRAND_DISPLAY_NAME;

  return {
    address,
    displayName,
    from: `${displayName} <${address}>`,
  };
}

/** All outbound email uses the unified Orbitt Mortgage sender. */
export function resolveDepartmentSender(_department: EmailDepartment): {
  address: string;
  displayName: string;
  from: string;
} {
  return getBrandedSender();
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
