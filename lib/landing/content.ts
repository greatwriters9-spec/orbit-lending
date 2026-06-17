import type { LucideIcon } from "lucide-react";

import type { LoanProductCategory } from "@/types/loans";

export type LandingProduct = {
  id: string;
  category: LoanProductCategory | "all";
  filterCategory?: LoanProductCategory;
  title: string;
  description: string;
  startingApr: string;
  href: string;
};

export type LandingTrustMetric = {
  value: string;
  label: string;
};

export type LandingWhyFeature = {
  title: string;
  description: string;
};

export type LandingProcessStep = {
  id: string;
  title: string;
  description: string;
};

export type LandingActivityItem = {
  id: string;
  message: string;
  timestamp: string;
  tone: "success" | "info" | "warning";
};

export type LandingTestimonial = {
  quote: string;
  name: string;
  role: string;
  fundedAmount: string;
  rating: number;
};

export type LandingDashboardFeature = {
  id: string;
  label: string;
  description: string;
  position: { top: string; left: string };
};

export type LandingTrustFeature = {
  title: string;
  description: string;
};

export const LANDING_CONTAINER = "mx-auto w-full max-w-[1400px] px-8";
export const LANDING_SECTION = "py-20 md:py-28";
/** Hero background image rotation interval (1 minute). */
export const HERO_CAROUSEL_INTERVAL_MS = 60 * 1000;

export const LANDING_HERO_BADGES = [
  { label: "Application Received", position: "top-[8%] -left-[6%] md:-left-[8%]" },
  { label: "Identity Verified", position: "top-[38%] -left-[10%] md:-left-[12%]" },
  { label: "Pre-Qualified", position: "top-[6%] -right-[4%] md:-right-[6%]" },
  { label: "Approved", position: "top-[32%] -right-[8%] md:-right-[10%]" },
  { label: "Closing Ready", position: "bottom-[12%] -right-[6%] md:-right-[8%]" },
] as const;

export const LANDING_TRUST_METRICS: LandingTrustMetric[] = [
  { value: "$25M+", label: "Mortgages Funded" },
  { value: "10,000+", label: "Applications Processed" },
  { value: "24–48 Hours", label: "Average Review Time" },
  { value: "98%", label: "Customer Satisfaction" },
];

export const LANDING_PRODUCT_TABS = [
  { id: "all", label: "All Products" },
  { id: "personal", label: "Fixed-Rate Mortgage" },
  { id: "business", label: "Investment Property" },
  { id: "asset_financing", label: "Construction" },
  { id: "property", label: "Refinance" },
  { id: "education", label: "Home Equity" },
] as const;

export type LandingProductTabId = (typeof LANDING_PRODUCT_TABS)[number]["id"];

export const LANDING_PRODUCTS: LandingProduct[] = [
  {
    id: "fixed-rate",
    category: "personal",
    filterCategory: "personal",
    title: "Fixed-Rate Mortgage",
    description:
      "Predictable monthly payments with a fixed mortgage rate for the life of your loan.",
    startingApr: "6.25%",
    href: "/register",
  },
  {
    id: "arm",
    category: "all",
    title: "Adjustable-Rate Mortgage",
    description:
      "Lower introductory rates with flexible terms designed for strategic homebuyers.",
    startingApr: "5.75%",
    href: "/register",
  },
  {
    id: "refinance",
    category: "property",
    filterCategory: "property",
    title: "Mortgage Refinance",
    description:
      "Refinance your existing mortgage to lower your rate or shorten your term.",
    startingApr: "6.10%",
    href: "/register",
  },
  {
    id: "cash-out",
    category: "all",
    title: "Cash-Out Refinance",
    description:
      "Access home equity while refinancing into a new mortgage with competitive terms.",
    startingApr: "6.45%",
    href: "/register",
  },
  {
    id: "home-equity",
    category: "education",
    filterCategory: "education",
    title: "Home Equity Loan",
    description:
      "Borrow against your home equity for renovations, consolidation, or major expenses.",
    startingApr: "6.99%",
    href: "/register",
  },
  {
    id: "investment",
    category: "business",
    filterCategory: "business",
    title: "Investment Property Mortgage",
    description:
      "Financing for rental properties, multi-unit homes, and real estate investments.",
    startingApr: "7.25%",
    href: "/register",
  },
  {
    id: "construction",
    category: "asset_financing",
    filterCategory: "asset_financing",
    title: "Construction Financing",
    description:
      "Build your dream home with structured draws and milestone-based funding.",
    startingApr: "7.49%",
    href: "/register",
  },
];

export const LANDING_WHY_FEATURES: LandingWhyFeature[] = [
  {
    title: "Fast Pre-Qualification",
    description: "Get pre-qualified in minutes with a digital-first mortgage experience.",
  },
  {
    title: "Transparent Mortgage Terms",
    description: "Clear rates, fees, and payment schedules — no hidden surprises.",
  },
  {
    title: "Secure Infrastructure",
    description: "Bank-grade security, encryption, and verified identity checks.",
  },
  {
    title: "Real-Time Tracking",
    description: "Monitor your mortgage application at every stage from one dashboard.",
  },
];

export const LANDING_PROCESS_STEPS: LandingProcessStep[] = [
  {
    id: "account",
    title: "Create Account",
    description: "Register securely and set up your homebuyer profile in minutes.",
  },
  {
    id: "submit",
    title: "Get Pre-Qualified",
    description: "Complete your mortgage application with guided steps and document upload.",
  },
  {
    id: "verification",
    title: "Verification Review",
    description: "Our team verifies identity, income, and property details.",
  },
  {
    id: "approval",
    title: "Approval Decision",
    description: "Receive a clear mortgage decision with transparent terms.",
  },
  {
    id: "funding",
    title: "Closing & Funding",
    description: "Approved mortgage funds are disbursed through secure banking channels.",
  },
];

export const LANDING_ACTIVITY: LandingActivityItem[] = [
  {
    id: "1",
    message: "Mortgage Pre-Qualified",
    timestamp: "2 hours ago",
    tone: "success",
  },
  {
    id: "2",
    message: "Refinance Application Funded",
    timestamp: "5 hours ago",
    tone: "success",
  },
  {
    id: "3",
    message: "Home Purchase Under Review",
    timestamp: "Yesterday",
    tone: "info",
  },
  {
    id: "4",
    message: "Mortgage Application Submitted",
    timestamp: "Yesterday",
    tone: "warning",
  },
];

export const LANDING_DASHBOARD_FEATURES: LandingDashboardFeature[] = [
  {
    id: "tracking",
    label: "Application Tracking",
    description: "Live mortgage status timeline for every stage.",
    position: { top: "18%", left: "8%" },
  },
  {
    id: "wallet",
    label: "Wallet Management",
    description: "Balances, disbursements, and reserves.",
    position: { top: "42%", left: "4%" },
  },
  {
    id: "messages",
    label: "Messages",
    description: "Direct communication with your mortgage team.",
    position: { top: "62%", left: "12%" },
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Timely alerts on approvals and actions.",
    position: { top: "22%", left: "72%" },
  },
  {
    id: "repayments",
    label: "Payment Monitoring",
    description: "Mortgage payment schedule visibility and history.",
    position: { top: "48%", left: "78%" },
  },
  {
    id: "documents",
    label: "Document Uploads",
    description: "Secure file submission and verification.",
    position: { top: "70%", left: "68%" },
  },
];

export const LANDING_TRUST_FEATURES: LandingTrustFeature[] = [
  {
    title: "Bank-Grade Security",
    description: "Enterprise encryption and multi-layer access controls.",
  },
  {
    title: "Secure Document Storage",
    description: "Protected file handling with audit-ready compliance.",
  },
  {
    title: "Identity Verification",
    description: "Verified KYC workflows for every application.",
  },
  {
    title: "Real-Time Account Monitoring",
    description: "Continuous oversight of account and funding activity.",
  },
  {
    title: "Encrypted Data Protection",
    description: "256-bit encryption across data in transit and at rest.",
  },
  {
    title: "Compliance Driven Operations",
    description: "Regulatory-aligned mortgage and reporting standards.",
  },
];

export const LANDING_TESTIMONIALS: LandingTestimonial[] = [
  {
    quote:
      "The process felt modern and straightforward. I always knew where my mortgage application stood and closed within days of approval.",
    name: "Sarah M.",
    role: "First-Time Homebuyer",
    fundedAmount: "$385,000",
    rating: 5,
  },
  {
    quote:
      "Orbit made refinancing simple and transparent. The dashboard gave us confidence throughout the entire review cycle.",
    name: "James T.",
    role: "Refinance Client",
    fundedAmount: "$420,000",
    rating: 5,
  },
  {
    quote:
      "Buying an investment property can be complex, but Orbit made every step clear. Professional, responsive, and genuinely trustworthy.",
    name: "Priya K.",
    role: "Investment Property Owner",
    fundedAmount: "$285,000",
    rating: 5,
  },
];

export const PATHWARD_BANK = {
  name: "Pathward National Bank",
  tagline: "Banking infrastructure you can trust",
  description:
    "Orbit Mortgage operates on enterprise-grade banking infrastructure powered by Pathward National Bank, combining modern digital mortgage experiences with institutional standards.",
} as const;

export type { LucideIcon };

