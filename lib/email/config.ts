import type { EmailDepartment } from "@/lib/email/types";

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

const DEFAULT_SENDERS: Record<EmailDepartment, { address: string; name: string }> =
  {
    system: {
      address: "noreply@orbitmortgage.com",
      name: "Orbit Mortgage System",
    },
    loan_officer: {
      address: "loanofficer@orbitmortgage.com",
      name: "Orbit Mortgage Loan Officer",
    },
    underwriting: {
      address: "underwriting@orbitmortgage.com",
      name: "Orbit Mortgage Underwriting",
    },
    funding: {
      address: "funding@orbitmortgage.com",
      name: "Orbit Mortgage Funding Department",
    },
    closings: {
      address: "closing@orbitmortgage.com",
      name: "Orbit Mortgage Closings Department",
    },
    support: {
      address: "support@orbitmortgage.com",
      name: "Orbit Mortgage Support",
    },
    executive: {
      address: "chief.lending.officer@orbitmortgage.com",
      name: "Chief Lending Officer — Orbit Mortgage",
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
  return (
    process.env.EMAIL_FROM_SUPPORT?.trim() ||
    DEFAULT_SENDERS.support.address
  );
}

export function resolveDepartmentSender(department: EmailDepartment): {
  address: string;
  displayName: string;
  from: string;
} {
  const keys = DEPARTMENT_ENV_KEYS[department];
  const defaults = DEFAULT_SENDERS[department];
  const address =
    process.env[keys.address]?.trim() || defaults.address;
  const displayName =
    process.env[keys.displayName]?.trim() || defaults.name;

  return {
    address,
    displayName,
    from: `${displayName} <${address}>`,
  };
}

export function getResendApiKey(): string | null {
  const key = process.env.RESEND_API_KEY?.trim();
  return key || null;
}

export function getEmailTestOverride(): string | null {
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  const testTo = process.env.RESEND_TEST_TO?.trim();
  return testTo || null;
}

export function getDevFallbackFrom(): string {
  const devFrom = process.env.RESEND_DEV_FROM?.trim();
  if (devFrom) {
    return devFrom.includes("<") ? devFrom : `Orbit Mortgage <${devFrom}>`;
  }
  return "Orbit Mortgage <onboarding@resend.dev>";
}
