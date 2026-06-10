/**
 * Seeds all catalog loan products into Supabase with full rate fields.
 *
 * Usage:
 *   npm run seed:loan-products
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const contents = readFileSync(envPath, "utf8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function deriveRates(terms) {
  const rates = terms.map((term) => term.interestRate);
  const periods = terms.map((term) => term.repaymentPeriod);
  const minApr = Math.min(...rates);
  const maxApr = Math.max(...rates);
  const defaultApr = Number(((minApr + maxApr) / 2).toFixed(2));

  return {
    default_apr: defaultApr,
    min_apr: minApr,
    max_apr: maxApr,
    min_term: Math.min(...periods),
    max_term: Math.max(...periods),
    weekly_repayment_supported: terms.some(
      (term) => term.repaymentFrequency === "Weekly",
    ),
    monthly_repayment_supported: terms.some(
      (term) => term.repaymentFrequency === "Monthly",
    ),
  };
}

const PRODUCTS = [
  {
    name: "Personal Financing",
    slug: "personal-financing",
    category: "personal",
    description:
      "Flexible personal financing for planned expenses, home improvements, and major purchases with transparent repayment terms.",
    min_amount: 1000,
    max_amount: 50000,
    country: "US",
    eligibility_summary:
      "Available to verified clients aged 18+ with a stable income source and active Orbit Lending account.",
    terms: [
      { repaymentFrequency: "Monthly", repaymentPeriod: 12, interestRate: 8.99 },
      { repaymentFrequency: "Monthly", repaymentPeriod: 24, interestRate: 10.49 },
      { repaymentFrequency: "Monthly", repaymentPeriod: 36, interestRate: 11.99 },
    ],
  },
  {
    name: "Emergency Loan",
    slug: "emergency-loan",
    category: "personal",
    description:
      "Fast-access financing for urgent, unexpected expenses with a streamlined review process.",
    min_amount: 500,
    max_amount: 15000,
    country: "US",
    eligibility_summary:
      "Designed for existing clients who need short-term access to funds for emergency situations.",
    terms: [
      { repaymentFrequency: "Weekly", repaymentPeriod: 12, interestRate: 5.0 },
      { repaymentFrequency: "Monthly", repaymentPeriod: 6, interestRate: 9.99 },
    ],
  },
  {
    name: "Working Capital",
    slug: "working-capital",
    category: "business",
    description:
      "Short-to-medium term financing to support day-to-day business operations, inventory, and payroll.",
    min_amount: 5000,
    max_amount: 250000,
    country: "US",
    eligibility_summary:
      "Available to registered businesses with at least 12 months of operating history.",
    terms: [
      { repaymentFrequency: "Monthly", repaymentPeriod: 12, interestRate: 10.0 },
      { repaymentFrequency: "Monthly", repaymentPeriod: 24, interestRate: 12.5 },
      { repaymentFrequency: "Monthly", repaymentPeriod: 36, interestRate: 14.0 },
    ],
  },
  {
    name: "Startup Capital",
    slug: "startup-capital",
    category: "business",
    description:
      "Growth financing for early-stage businesses launching or scaling operations.",
    min_amount: 10000,
    max_amount: 500000,
    country: "US",
    eligibility_summary:
      "For startups with a defined business plan and founding team documentation.",
    terms: [
      { repaymentFrequency: "Monthly", repaymentPeriod: 24, interestRate: 13.99 },
      { repaymentFrequency: "Monthly", repaymentPeriod: 48, interestRate: 15.99 },
    ],
  },
  {
    name: "Vehicle Financing",
    slug: "vehicle-financing",
    category: "asset_financing",
    description:
      "Finance new or used vehicles with competitive rates and flexible repayment schedules.",
    min_amount: 5000,
    max_amount: 75000,
    country: "US",
    eligibility_summary:
      "Available for passenger vehicles, trucks, and qualifying commercial vehicles.",
    terms: [
      { repaymentFrequency: "Monthly", repaymentPeriod: 36, interestRate: 6.99 },
      { repaymentFrequency: "Monthly", repaymentPeriod: 60, interestRate: 7.99 },
    ],
  },
  {
    name: "Equipment Financing",
    slug: "equipment-financing",
    category: "asset_financing",
    description:
      "Finance business equipment, machinery, and technology assets with the asset as collateral.",
    min_amount: 10000,
    max_amount: 500000,
    country: "US",
    eligibility_summary:
      "For businesses acquiring operational equipment with documented asset valuation.",
    terms: [
      { repaymentFrequency: "Monthly", repaymentPeriod: 24, interestRate: 8.49 },
      { repaymentFrequency: "Monthly", repaymentPeriod: 48, interestRate: 9.99 },
    ],
  },
  {
    name: "Tuition Financing",
    slug: "tuition-financing",
    category: "education",
    description:
      "Finance tuition and enrollment costs for accredited programs and professional certifications.",
    min_amount: 2000,
    max_amount: 100000,
    country: "US",
    eligibility_summary:
      "Available for accredited institutions and approved training programs.",
    terms: [
      { repaymentFrequency: "Monthly", repaymentPeriod: 24, interestRate: 7.49 },
      { repaymentFrequency: "Monthly", repaymentPeriod: 48, interestRate: 8.99 },
      { repaymentFrequency: "Monthly", repaymentPeriod: 60, interestRate: 9.49 },
    ],
  },
].map((product) => ({
  ...product,
  ...deriveRates(product.terms),
  product_status: "active",
  active: true,
}));

async function seedLoanProducts() {
  console.log("Seeding full loan product catalog...\n");

  for (const product of PRODUCTS) {
    const { terms, ...row } = product;

    const { data: existing } = await supabase
      .from("loan_products")
      .select("id")
      .eq("slug", product.slug)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("loan_products")
        .update({ ...row, updated_at: new Date().toISOString() })
        .eq("id", existing.id);

      if (error) {
        throw new Error(`Failed to update ${product.slug}: ${error.message}`);
      }

      console.log(`✓ Updated ${product.name}`);
      continue;
    }

    const { error } = await supabase.from("loan_products").insert(row);

    if (error) {
      throw new Error(`Failed to insert ${product.slug}: ${error.message}`);
    }

    console.log(`✓ Created ${product.name}`);
  }

  console.log(`\n${PRODUCTS.length} catalog products are ready in admin.`);
}

seedLoanProducts().catch((err) => {
  console.error(err);
  process.exit(1);
});
