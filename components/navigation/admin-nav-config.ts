import {
  Banknote,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquare,
  Settings,
  User,
  Users,
  Wallet,
} from "lucide-react";

import type { NavSection } from "@/types/navigation";

export const adminNavSections: NavSection[] = [
  {
    items: [
      { title: "Credit Manager Dashboard", href: "/admin", icon: LayoutDashboard },
      { title: "Users", href: "/admin/users", icon: Users },
      {
        title: "Mortgage Management",
        href: "/admin/loan-products",
        icon: Home,
      },
      {
        title: "Applications",
        href: "/admin/applications",
        icon: ClipboardList,
      },
      { title: "Reports", href: "/admin/reports", icon: FileText },
      { title: "Messages", href: "/admin/messages", icon: MessageSquare },
      { title: "System Settings", href: "/admin/settings", icon: Settings },
    ],
  },
  {
    label: "Mortgage Operations",
    items: [
      {
        title: "Loan Officer Dashboard",
        href: "/finance/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Applications Queue",
        href: "/finance/applications",
        icon: ClipboardList,
      },
      { title: "Funding Queue", href: "/finance/funding", icon: Banknote },
      {
        title: "Withdrawal Approvals",
        href: "/finance/withdrawals",
        icon: Wallet,
      },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Profile", href: "/admin/profile", icon: User }],
  },
];

export const ADMIN_PORTAL = {
  title: "Orbit Mortgage",
  subtitle: "Credit Manager Portal",
} as const;

