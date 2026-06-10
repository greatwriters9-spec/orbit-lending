import {
  Banknote,
  ClipboardList,
  FileSearch,
  Landmark,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  LifeBuoy,
  User,
  Wallet,
} from "lucide-react";

import type { NavSection } from "@/types/navigation";

export const financeNavSections: NavSection[] = [
  {
    items: [
      {
        title: "Loan Officer Dashboard",
        href: "/finance",
        icon: LayoutDashboard,
      },
      {
        title: "Applications Queue",
        href: "/finance/applications",
        icon: ClipboardList,
      },
      {
        title: "Funding Queue",
        href: "/finance/funding",
        icon: Banknote,
      },
      {
        title: "Withdrawal Approvals",
        href: "/finance/withdrawals",
        icon: Wallet,
      },
      {
        title: "Active Loans",
        href: "/finance/loans",
        icon: Landmark,
      },
      {
        title: "Repayments",
        href: "/finance/repayments",
        icon: Receipt,
      },
      {
        title: "Support Center",
        href: "/finance/support",
        icon: LifeBuoy,
      },
      {
        title: "Messages",
        href: "/finance/messages",
        icon: MessageSquare,
      },
      {
        title: "Transactions",
        href: "/finance/transactions",
        icon: FileSearch,
      },
      {
        title: "Reports",
        href: "/finance/reports",
        icon: FileSearch,
      },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Profile", href: "/finance/profile", icon: User }],
  },
];

export const FINANCE_PORTAL = {
  title: "Orbit Lending",
  subtitle: "Loan Officer Portal",
} as const;
