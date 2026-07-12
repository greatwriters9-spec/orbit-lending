import type { Metadata } from "next";
import { CreditCard, ShieldCheck } from "lucide-react";

import {
  LoanCategorySection,
  ProductDirectoryGrid,
} from "@/components/loans";
import { StatCard } from "@/components/ui-kit/stat-card";
import { fetchLoanProductsByCategoryForClient } from "@/lib/loans/server-queries";

export const metadata: Metadata = {
  title: "Mortgage Products",
  description:
    "Browse available mortgage products, compare rates, and review requirements before applying.",
};

export default async function LoansPage() {
  const categories = await fetchLoanProductsByCategoryForClient();
  const totalProducts = categories.reduce(
    (count, group) => count + group.products.length,
    0,
  );

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="card-surface overflow-hidden">
        <div className="border-b border-brand-border bg-brand-navy px-6 py-8 text-white md:px-8 md:py-10">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-white/45 uppercase">
            Mortgage Products
          </p>
          <h1 className="heading-primary-light mt-2 text-3xl md:text-4xl">
            Find the Right Home Financing
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
            Explore our mortgage product directory, compare rates, and review
            requirements before starting your application. Banking infrastructure
            powered by Pathward National Bank.
          </p>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2 md:p-8">
          <StatCard
            title="Available Products"
            value={String(totalProducts)}
            description="Active mortgage products across all categories."
            icon={CreditCard}
            variant="featured"
          />
          <StatCard
            title="Secure Platform"
            value="Bank-Grade"
            description="Enterprise security standards for every application."
            icon={ShieldCheck}
            variant="growth"
          />
        </div>
      </section>

      <ProductDirectoryGrid categories={categories} />

      <div className="space-y-3">
        <h2 className="heading-secondary text-xl md:text-2xl">
          Available Mortgage Products
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          Compare mortgage amounts, rate ranges, and eligibility requirements for each
          product in your selected category.
        </p>
      </div>

      <div className="space-y-10">
        {categories.map((group) => (
          <LoanCategorySection key={group.category} group={group} />
        ))}
      </div>
    </div>
  );
}

