import {
  Download,
  FileUp,
  PlusCircle,
  Receipt,
} from "lucide-react";

import type { QuickAction } from "@/types/dashboard";

export const dashboardQuickActions: QuickAction[] = [
  {
    label: "Make Payment",
    href: "/dashboard/repayments",
    icon: Receipt,
  },
  {
    label: "Apply for Loan",
    href: "/dashboard/loans",
    icon: PlusCircle,
  },
  {
    label: "Upload Documents",
    href: "/dashboard/documents",
    icon: FileUp,
  },
  {
    label: "Download Statement",
    href: "/dashboard/transactions",
    icon: Download,
  },
];
