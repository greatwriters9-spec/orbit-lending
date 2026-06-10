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

export const LANDING_HERO_BADGES = [
  { label: "Application Received", position: "top-[8%] -left-[6%] md:-left-[8%]" },
  { label: "Identity Verified", position: "top-[38%] -left-[10%] md:-left-[12%]" },
  { label: "Pre-Qualified", position: "top-[6%] -right-[4%] md:-right-[6%]" },
  { label: "Approved", position: "top-[32%] -right-[8%] md:-right-[10%]" },
  { label: "Funding Available", position: "bottom-[12%] -right-[6%] md:-right-[8%]" },
] as const;

export const LANDING_TRUST_METRICS: LandingTrustMetric[] = [
  { value: "$25M+", label: "Loans Funded" },
  { value: "10,000+", label: "Applications Processed" },
  { value: "24–48 Hours", label: "Average Review Time" },
  { value: "98%", label: "Customer Satisfaction" },
];

export const LANDING_PRODUCT_TABS = [
  { id: "all", label: "All Products" },
  { id: "personal", label: "Personal Financing" },
  { id: "business", label: "Business Financing" },
  { id: "asset_financing", label: "Asset Financing" },
  { id: "property", label: "Property Financing" },
  { id: "education", label: "Education Financing" },
] as const;

export type LandingProductTabId = (typeof LANDING_PRODUCT_TABS)[number]["id"];

export const LANDING_PRODUCTS: LandingProduct[] = [
  {
    id: "personal",
    category: "personal",
    filterCategory: "personal",
    title: "Personal Financing",
    description:
      "Flexible consumer lending for life expenses, home projects, and major purchases.",
    startingApr: "6.99%",
    href: "/register",
  },
  {
    id: "business",
    category: "business",
    filterCategory: "business",
    title: "Business Financing",
    description:
      "Working capital and growth financing designed for businesses at every stage.",
    startingApr: "7.49%",
    href: "/register",
  },
  {
    id: "asset_financing",
    category: "asset_financing",
    filterCategory: "asset_financing",
    title: "Asset Financing",
    description:
      "Finance vehicles, equipment, and essential assets with structured repayment plans.",
    startingApr: "5.99%",
    href: "/register",
  },
  {
    id: "property",
    category: "property",
    filterCategory: "property",
    title: "Property Financing",
    description:
      "Home mortgages, refinancing, and real estate lending backed by institutional standards.",
    startingApr: "6.25%",
    href: "/register",
  },
  {
    id: "education",
    category: "education",
    filterCategory: "education",
    title: "Education Financing",
    description:
      "Tuition, certification programs, and educational investments with transparent terms.",
    startingApr: "4.99%",
    href: "/register",
  },
];

export const LANDING_WHY_FEATURES: LandingWhyFeature[] = [
  {
    title: "Fast Decisions",
    description: "24–48 hour review process with digital-first underwriting.",
  },
  {
    title: "Transparent Lending",
    description: "Clear rates, fees, and repayment schedules — no hidden surprises.",
  },
  {
    title: "Secure Infrastructure",
    description: "Bank-grade security, encryption, and verified identity checks.",
  },
  {
    title: "Real-Time Tracking",
    description: "Monitor your application status at every stage from one dashboard.",
  },
];

export const LANDING_PROCESS_STEPS: LandingProcessStep[] = [
  {
    id: "account",
    title: "Create Account",
    description: "Register securely and set up your borrower profile in minutes.",
  },
  {
    id: "submit",
    title: "Submit Application",
    description: "Complete your application with guided steps and document upload.",
  },
  {
    id: "verification",
    title: "Verification Review",
    description: "Our team verifies identity, income, and application details.",
  },
  {
    id: "approval",
    title: "Approval Decision",
    description: "Receive a clear lending decision with transparent terms.",
  },
  {
    id: "funding",
    title: "Funding Release",
    description: "Approved funds are disbursed through secure banking channels.",
  },
];

export const LANDING_ACTIVITY: LandingActivityItem[] = [
  {
    id: "1",
    message: "Personal Loan Approved",
    timestamp: "2 hours ago",
    tone: "success",
  },
  {
    id: "2",
    message: "Business Financing Funded",
    timestamp: "5 hours ago",
    tone: "success",
  },
  {
    id: "3",
    message: "Property Loan Under Review",
    timestamp: "Yesterday",
    tone: "info",
  },
  {
    id: "4",
    message: "Asset Financing Submitted",
    timestamp: "Yesterday",
    tone: "warning",
  },
];

export const LANDING_DASHBOARD_FEATURES: LandingDashboardFeature[] = [
  {
    id: "tracking",
    label: "Application Tracking",
    description: "Live status timeline for every stage.",
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
    description: "Direct communication with your lending team.",
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
    label: "Repayment Monitoring",
    description: "Schedule visibility and payment history.",
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
    description: "Regulatory-aligned lending and reporting standards.",
  },
];

export const LANDING_TESTIMONIALS: LandingTestimonial[] = [
  {
    quote:
      "The process felt institutional yet modern. I always knew where my application stood and received funding within days of approval.",
    name: "Sarah M.",
    role: "Personal Loan Client",
    fundedAmount: "$18,500",
    rating: 5,
  },
  {
    quote:
      "Orbit delivered business financing with clarity and speed. The dashboard gave our team confidence throughout the entire review cycle.",
    name: "James T.",
    role: "Business Financing Client",
    fundedAmount: "$120,000",
    rating: 5,
  },
  {
    quote:
      "Property financing can be complex, but Orbit made every step transparent. Professional, responsive, and genuinely trustworthy.",
    name: "Priya K.",
    role: "Property Financing Client",
    fundedAmount: "$285,000",
    rating: 5,
  },
];

export const PATHWARD_BANK = {
  name: "Pathward National Bank",
  tagline: "Banking infrastructure you can trust",
  description:
    "Orbit Lending operates on enterprise-grade banking infrastructure powered by Pathward National Bank, combining modern digital experiences with institutional lending standards.",
} as const;

export type { LucideIcon };
