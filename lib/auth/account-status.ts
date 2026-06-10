export type AccountStatus =
  | "active"
  | "under_review"
  | "restricted"
  | "on_hold"
  | "suspended"
  | "closed";

export const ACCOUNT_STATUSES: AccountStatus[] = [
  "active",
  "under_review",
  "restricted",
  "on_hold",
  "suspended",
  "closed",
];

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  active: "Active",
  under_review: "Under Review",
  restricted: "Restricted",
  on_hold: "On Hold",
  suspended: "Suspended",
  closed: "Closed",
};

export type AccountRestriction =
  | "login"
  | "view_dashboard"
  | "apply_loan"
  | "wallet_deposit"
  | "wallet_withdraw"
  | "send_message"
  | "make_payment";

export type AccountStatusConfig = {
  label: string;
  description: string;
  allowed: AccountRestriction[];
  blockedPortalAccess: boolean;
};

export const ACCOUNT_STATUS_CONFIG: Record<AccountStatus, AccountStatusConfig> =
  {
    active: {
      label: "Active",
      description: "Full platform access.",
      allowed: [
        "login",
        "view_dashboard",
        "apply_loan",
        "wallet_deposit",
        "wallet_withdraw",
        "send_message",
        "make_payment",
      ],
      blockedPortalAccess: false,
    },
    under_review: {
      label: "Under Review",
      description: "Account under compliance review. Limited transactional access.",
      allowed: ["login", "view_dashboard", "send_message"],
      blockedPortalAccess: false,
    },
    restricted: {
      label: "Restricted",
      description: "New applications and withdrawals are blocked.",
      allowed: ["login", "view_dashboard", "make_payment"],
      blockedPortalAccess: false,
    },
    on_hold: {
      label: "On Hold",
      description: "Account on hold. Read-only access to account information.",
      allowed: ["login", "view_dashboard"],
      blockedPortalAccess: false,
    },
    suspended: {
      label: "Suspended",
      description: "Account suspended. Contact support to restore access.",
      allowed: ["login"],
      blockedPortalAccess: true,
    },
    closed: {
      label: "Closed",
      description: "Account closed. No further platform activity permitted.",
      allowed: [],
      blockedPortalAccess: true,
    },
  };

export function canAccountPerform(
  status: AccountStatus | null | undefined,
  restriction: AccountRestriction,
): boolean {
  const resolved = status ?? "active";
  return ACCOUNT_STATUS_CONFIG[resolved].allowed.includes(restriction);
}

export function isAccountPortalBlocked(
  status: AccountStatus | null | undefined,
): boolean {
  const resolved = status ?? "active";
  return ACCOUNT_STATUS_CONFIG[resolved].blockedPortalAccess;
}

export function requiresAccountStatusPage(
  status: AccountStatus | null | undefined,
): boolean {
  return status === "suspended" || status === "closed";
}
