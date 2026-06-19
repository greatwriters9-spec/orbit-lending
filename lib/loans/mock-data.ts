import {
  getAllDefaultCategoryConfig,
} from "@/lib/loans/category-config";
import type {
  LoanCategoryGroup,
  LoanProduct,
  LoanProductCategory,
} from "@/types/loans";

export const loanProducts: LoanProduct[] = [
  {
    id: "lp-001",
    name: "Personal Financing",
    slug: "personal-financing",
    category: "personal",
    description:
      "Flexible personal financing for planned expenses, home improvements, and major purchases with transparent repayment terms.",
    minAmount: 1000,
    maxAmount: 50000,
    active: true,
    country: "US",
    eligibilitySummary:
      "Available to verified clients aged 18+ with a stable income source and active Orbit Mortgage account.",
    eligibilityCriteria: [
      "Must be at least 18 years of age",
      "Verified Orbit Mortgage account in good standing",
      "Minimum monthly income of $2,000",
      "No active defaulted loans on the platform",
      "US resident with valid government-issued ID",
    ],
    requirements: [
      {
        id: "req-001",
        requirementName: "Government-Issued ID",
        description: "Valid passport, driver's license, or state ID.",
        required: true,
      },
      {
        id: "req-002",
        requirementName: "Proof of Income",
        description: "Recent pay stubs, tax returns, or employment letter.",
        required: true,
      },
      {
        id: "req-003",
        requirementName: "Bank Statement",
        description: "Last 3 months of primary bank account statements.",
        required: true,
      },
      {
        id: "req-004",
        requirementName: "Proof of Address",
        description: "Utility bill or lease agreement dated within 90 days.",
        required: true,
      },
    ],
    terms: [
      {
        id: "term-001",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 12,
        interestRate: 8.99,
        active: true,
      },
      {
        id: "term-002",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 24,
        interestRate: 10.49,
        active: true,
      },
      {
        id: "term-003",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 36,
        interestRate: 11.99,
        active: true,
      },
    ],
  },
  {
    id: "lp-002",
    name: "Emergency Loan",
    slug: "emergency-loan",
    category: "personal",
    description:
      "Fast-access financing for urgent, unexpected expenses with a streamlined review process.",
    minAmount: 500,
    maxAmount: 15000,
    active: true,
    country: "US",
    eligibilitySummary:
      "Designed for existing clients who need short-term access to funds for emergency situations.",
    eligibilityCriteria: [
      "Active Orbit Mortgage account for at least 30 days",
      "No overdue repayments on existing loans",
      "Verifiable income source",
      "Completed profile verification",
    ],
    requirements: [
      {
        id: "req-005",
        requirementName: "Government-Issued ID",
        description: "Valid identification document.",
        required: true,
      },
      {
        id: "req-006",
        requirementName: "Proof of Income",
        description: "Recent income verification document.",
        required: true,
      },
      {
        id: "req-007",
        requirementName: "Emergency Purpose Statement",
        description: "Brief description of the emergency expense.",
        required: true,
      },
    ],
    terms: [
      {
        id: "term-004",
        repaymentFrequency: "Weekly",
        repaymentPeriod: 12,
        interestRate: 5.0,
        active: true,
      },
      {
        id: "term-005",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 6,
        interestRate: 9.99,
        active: true,
      },
    ],
  },
  {
    id: "lp-003",
    name: "Working Capital",
    slug: "working-capital",
    category: "business",
    description:
      "Short-to-medium term financing to support day-to-day business operations, inventory, and payroll.",
    minAmount: 5000,
    maxAmount: 250000,
    active: true,
    country: "US",
    eligibilitySummary:
      "Available to registered businesses with at least 12 months of operating history.",
    eligibilityCriteria: [
      "Registered business entity in the United States",
      "Minimum 12 months of operating history",
      "Annual revenue of at least $50,000",
      "Business bank account in good standing",
      "Authorized signatory on the Orbit Mortgage account",
    ],
    requirements: [
      {
        id: "req-008",
        requirementName: "Business Registration",
        description: "Certificate of incorporation or business license.",
        required: true,
      },
      {
        id: "req-009",
        requirementName: "Business Financial Statements",
        description: "Last 12 months of profit and loss statements.",
        required: true,
      },
      {
        id: "req-010",
        requirementName: "Business Bank Statements",
        description: "Last 6 months of business account statements.",
        required: true,
      },
      {
        id: "req-011",
        requirementName: "Tax Returns",
        description: "Most recent business tax filing.",
        required: true,
      },
    ],
    terms: [
      {
        id: "term-006",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 12,
        interestRate: 10.0,
        active: true,
      },
      {
        id: "term-007",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 24,
        interestRate: 12.5,
        active: true,
      },
      {
        id: "term-008",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 36,
        interestRate: 14.0,
        active: true,
      },
    ],
  },
  {
    id: "lp-004",
    name: "Startup Capital",
    slug: "startup-capital",
    category: "business",
    description:
      "Growth financing for early-stage businesses launching or scaling operations.",
    minAmount: 10000,
    maxAmount: 500000,
    active: true,
    country: "US",
    eligibilitySummary:
      "For startups with a defined business plan and founding team documentation.",
    eligibilityCriteria: [
      "Business plan submitted with application",
      "Founding team identification provided",
      "Minimum seed funding or revenue traction documented",
      "US-based business operations",
    ],
    requirements: [
      {
        id: "req-012",
        requirementName: "Business Plan",
        description: "Detailed plan including projections and use of funds.",
        required: true,
      },
      {
        id: "req-013",
        requirementName: "Founder Identification",
        description: "Government ID for all principal owners.",
        required: true,
      },
      {
        id: "req-014",
        requirementName: "Pitch Deck or Overview",
        description: "Summary of business model and market opportunity.",
        required: false,
      },
    ],
    terms: [
      {
        id: "term-009",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 24,
        interestRate: 13.99,
        active: true,
      },
      {
        id: "term-010",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 48,
        interestRate: 15.99,
        active: true,
      },
    ],
  },
  {
    id: "lp-005",
    name: "Vehicle Financing",
    slug: "vehicle-financing",
    category: "asset_financing",
    description:
      "Finance new or used vehicles with competitive rates and flexible repayment schedules.",
    minAmount: 5000,
    maxAmount: 75000,
    active: true,
    country: "US",
    eligibilitySummary:
      "Available for passenger vehicles, trucks, and qualifying commercial vehicles.",
    eligibilityCriteria: [
      "Vehicle must be for personal or business use within the US",
      "Vehicle age not exceeding 10 years at loan maturity",
      "Comprehensive insurance required for loan duration",
      "Minimum credit assessment score threshold met",
    ],
    requirements: [
      {
        id: "req-015",
        requirementName: "Vehicle Details",
        description: "Make, model, year, VIN, and purchase agreement.",
        required: true,
      },
      {
        id: "req-016",
        requirementName: "Proof of Income",
        description: "Income verification for repayment capacity.",
        required: true,
      },
      {
        id: "req-017",
        requirementName: "Insurance Quote",
        description: "Proof of comprehensive insurance coverage.",
        required: true,
      },
    ],
    terms: [
      {
        id: "term-011",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 36,
        interestRate: 6.99,
        active: true,
      },
      {
        id: "term-012",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 60,
        interestRate: 7.99,
        active: true,
      },
    ],
  },
  {
    id: "lp-006",
    name: "Equipment Financing",
    slug: "equipment-financing",
    category: "asset_financing",
    description:
      "Finance business equipment, machinery, and technology assets with the asset as collateral.",
    minAmount: 10000,
    maxAmount: 500000,
    active: true,
    country: "US",
    eligibilitySummary:
      "For businesses acquiring operational equipment with documented asset valuation.",
    eligibilityCriteria: [
      "Registered US business entity",
      "Equipment quote or invoice provided",
      "Equipment used for business operations",
      "Business revenue supports repayment capacity",
    ],
    requirements: [
      {
        id: "req-018",
        requirementName: "Equipment Quote",
        description: "Vendor quote or purchase invoice for the equipment.",
        required: true,
      },
      {
        id: "req-019",
        requirementName: "Business Financials",
        description: "Recent business financial statements.",
        required: true,
      },
      {
        id: "req-020",
        requirementName: "Asset Specification",
        description: "Technical specifications and warranty details.",
        required: true,
      },
    ],
    terms: [
      {
        id: "term-013",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 24,
        interestRate: 8.49,
        active: true,
      },
      {
        id: "term-014",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 48,
        interestRate: 9.99,
        active: true,
      },
    ],
  },
  {
    id: "lp-007",
    name: "Tuition Financing",
    slug: "tuition-financing",
    category: "education",
    description:
      "Finance tuition and enrollment costs for accredited programs and professional certifications.",
    minAmount: 2000,
    maxAmount: 100000,
    active: true,
    country: "US",
    eligibilitySummary:
      "Available for accredited institutions and approved training programs.",
    eligibilityCriteria: [
      "Enrollment at an accredited institution or approved program",
      "Applicant or co-signer meets income requirements",
      "Program duration and cost documentation provided",
      "US citizen or permanent resident",
    ],
    requirements: [
      {
        id: "req-021",
        requirementName: "Enrollment Letter",
        description: "Official acceptance or enrollment confirmation.",
        required: true,
      },
      {
        id: "req-022",
        requirementName: "Tuition Invoice",
        description: "Itemized tuition and fee statement from institution.",
        required: true,
      },
      {
        id: "req-023",
        requirementName: "Proof of Income",
        description: "Applicant or co-signer income verification.",
        required: true,
      },
    ],
    terms: [
      {
        id: "term-015",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 24,
        interestRate: 7.49,
        active: true,
      },
      {
        id: "term-016",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 48,
        interestRate: 8.99,
        active: true,
      },
      {
        id: "term-017",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 60,
        interestRate: 9.49,
        active: true,
      },
    ],
  },
  {
    id: "lp-008",
    name: "Home Mortgage",
    slug: "home-mortgage",
    category: "property",
    description:
      "Competitive mortgage financing for primary residences, refinancing, and investment properties.",
    minAmount: 50000,
    maxAmount: 1500000,
    active: true,
    country: "US",
    eligibilitySummary:
      "Available to qualified borrowers with stable income and acceptable credit history.",
    eligibilityCriteria: [
      "Minimum credit score of 620",
      "Debt-to-income ratio below 43%",
      "Verified employment and income history",
      "Property appraisal required",
      "US citizen or permanent resident",
    ],
    requirements: [
      {
        id: "req-024",
        requirementName: "Proof of Income",
        description: "W-2s, tax returns, or self-employment documentation.",
        required: true,
      },
      {
        id: "req-025",
        requirementName: "Property Appraisal",
        description: "Independent appraisal of the subject property.",
        required: true,
      },
      {
        id: "req-026",
        requirementName: "Purchase Agreement",
        description: "Signed contract or refinance payoff statement.",
        required: true,
      },
    ],
    terms: [
      {
        id: "term-018",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 180,
        interestRate: 6.75,
        active: true,
      },
      {
        id: "term-020",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 240,
        interestRate: 6.79,
        active: true,
      },
      {
        id: "term-021",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 300,
        interestRate: 6.89,
        active: true,
      },
      {
        id: "term-019",
        repaymentFrequency: "Monthly",
        repaymentPeriod: 360,
        interestRate: 6.99,
        active: true,
      },
    ],
  },
];

export function getLoanProducts(): LoanProduct[] {
  return loanProducts.filter((product) => product.active);
}

export function getLoanProductBySlug(slug: string): LoanProduct | undefined {
  return loanProducts.find((product) => product.slug === slug && product.active);
}

export function getLoanProductsByCategory(): LoanCategoryGroup[] {
  const categoryConfig = getAllDefaultCategoryConfig();

  return categoryConfig
    .map((meta) => {
      const products = loanProducts.filter(
        (product) => product.category === meta.category && product.active,
      );

      return {
        category: meta.category,
        label: meta.label,
        description: meta.description,
        iconName: meta.iconName,
        illustrationUrl: meta.illustrationUrl,
        illustrationTransform: meta.illustrationTransform,
        sortOrder: meta.sortOrder,
        active: meta.active,
        products,
      };
    })
    .filter((group) => group.products.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatApr(rate: number): string {
  return `${rate.toFixed(2)}% APR`;
}

export function formatTermLabel(term: {
  repaymentFrequency: string;
  repaymentPeriod: number;
}): string {
  const unit =
    term.repaymentFrequency === "Weekly"
      ? term.repaymentPeriod === 1
        ? "Week"
        : "Weeks"
      : term.repaymentPeriod === 1
        ? "Month"
        : "Months";

  return `${term.repaymentPeriod} ${unit}`;
}

export function getLowestApr(product: LoanProduct): number {
  const activeTerms = product.terms.filter((term) => term.active);
  if (activeTerms.length === 0) return 0;
  return Math.min(...activeTerms.map((term) => term.interestRate));
}

