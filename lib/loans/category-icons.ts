import {
  Banknote,
  Briefcase,
  Building2,
  Car,
  CreditCard,
  GraduationCap,
  Home,
  Landmark,
  PiggyBank,
  ShieldCheck,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { CategoryIconName } from "@/lib/loans/category-config";

const ICON_MAP: Record<CategoryIconName, LucideIcon> = {
  Wallet,
  Briefcase,
  Truck,
  Car,
  Home,
  GraduationCap,
  Building2,
  Landmark,
  CreditCard,
  PiggyBank,
  Banknote,
  ShieldCheck,
};

export function getCategoryIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName as CategoryIconName] ?? Landmark;
}
