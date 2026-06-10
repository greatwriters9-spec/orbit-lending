import {
  ArrowLeftRight,
  Bell,
  CreditCard,
  FileText,
  HelpCircle,
  Landmark,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  User,
  Wallet,
} from "lucide-react";

import type { NavSection } from "@/types/navigation";

export const clientNavSections: NavSection[] = [
  {
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Loan Products", href: "/loans", icon: Landmark },
      { title: "Applications", href: "/dashboard/loans", icon: CreditCard },
      { title: "Wallet", href: "/wallet", icon: Wallet },
      { title: "Repayments", href: "/dashboard/repayments", icon: Receipt },
      {
        title: "Transactions",
        href: "/dashboard/transactions",
        icon: ArrowLeftRight,
      },
      {
        title: "Messages",
        href: "/dashboard/messages",
        icon: MessageSquare,
      },
      {
        title: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
      },
      { title: "Documents", href: "/dashboard/documents", icon: FileText },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Profile", href: "/dashboard/profile", icon: User },
      { title: "Support", href: "/dashboard/support", icon: HelpCircle },
    ],
  },
];

export const CLIENT_PORTAL = {
  title: "Orbit Lending",
  subtitle: "Client Portal",
} as const;
