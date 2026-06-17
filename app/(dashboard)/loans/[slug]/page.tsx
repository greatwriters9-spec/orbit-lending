import Link from "next/link";
import {
  ArrowLeft,
  Landmark,
  Percent,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { notFound } from "next/navigation";

import {
  LoanApplyButton,
  LoanEligibilityCriteria,
  LoanRepaymentOptions,
  LoanRequirementsList,
} from "@/components/loans";
import { Badge } from "@/components/ui-kit/badge";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { StatCard } from "@/components/ui-kit/stat-card";
import {
  fetchLoanProductBySlugForClient,
} from "@/lib/loans/server-queries";
import {
  formatApr,
  formatCurrency,
  getLowestApr,
} from "@/lib/loans/queries";

import { getCategoryLabel } from "@/lib/loans/category-config";

type LoanDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { fetchLoanProducts } = await import("@/lib/loans/queries");
  const products = await fetchLoanProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: LoanDetailPageProps) {
  const { slug } = await params;
  const product = await fetchLoanProductBySlugForClient(slug);

  if (!product) {
    return { title: "Mortgage Product Not Found | Orbit Mortgage" };
  }

  return {
    title: `${product.name} | Orbit Mortgage`,
    description: product.description,
  };
}

export default async function LoanDetailPage({ params }: LoanDetailPageProps) {
  const { slug } = await params;
  const product = await fetchLoanProductBySlugForClient(slug);

  if (!product) {
    notFound();
  }

  const lowestApr = getLowestApr(product);

  return (
    <div className="space-y-8 md:space-y-9">
      <Link
        href="/loans"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-blue"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Back to Mortgage Products
      </Link>

      <section className="card-surface overflow-hidden">
        <div className="border-b border-brand-border bg-brand-navy px-6 py-8 text-white md:px-8 md:py-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-white/15 bg-white/10 text-white">
              {getCategoryLabel(product.category)}
            </Badge>
            <Badge className="border-brand-blue/30 bg-brand-blue/20 text-blue-100">
              {product.country}
            </Badge>
          </div>
          <h1 className="heading-primary-light mt-4 text-3xl md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65 md:text-base">
            {product.description}
          </p>
          <div className="mt-8">
            <LoanApplyButton productName={product.name} slug={product.slug} />
          </div>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-3 md:p-8">
          <StatCard
            title="Mortgage Range"
            value={`${formatCurrency(product.minAmount)} – ${formatCurrency(product.maxAmount)}`}
            description="Available financing amounts for this product."
            icon={Wallet}
            variant="default"
          />
          <StatCard
            title="Starting APR"
            value={lowestApr > 0 ? formatApr(lowestApr) : "—"}
            description="Lowest available rate based on repayment term."
            icon={Percent}
            variant="growth"
          />
          <StatCard
            title="Banking Partner"
            value="Pathward"
            description="Banking infrastructure powered by Pathward National Bank."
            icon={Landmark}
            variant="featured"
          />
        </div>
      </section>

      <section className="card-surface p-6 md:p-8">
        <SectionHeader
          title="Requirements"
          description="Documents and information needed to apply for this mortgage product."
        />
        <div className="mt-6">
          <LoanRequirementsList requirements={product.requirements} />
        </div>
      </section>

      <section className="card-surface p-6 md:p-8">
        <SectionHeader
          title="APR & Repayment Options"
          description="Review available repayment frequencies, terms, and interest rates."
        />
        <div className="mt-6">
          <LoanRepaymentOptions terms={product.terms} />
        </div>
      </section>

      <section className="card-surface p-6 md:p-8">
        <SectionHeader
          title="Eligibility Criteria"
          description="Confirm you meet the requirements before starting your application."
          action={<ShieldCheck className="size-5 text-brand-blue" strokeWidth={1.75} />}
        />
        <div className="mt-6">
          <LoanEligibilityCriteria
            summary={product.eligibilitySummary}
            criteria={product.eligibilityCriteria}
          />
        </div>
      </section>

      <section className="card-surface flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
        <div>
          <h2 className="heading-secondary text-lg">
            Ready to apply for {product.name}?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review the requirements above, then start your secure application.
          </p>
        </div>
        <LoanApplyButton productName={product.name} slug={product.slug} />
      </section>
    </div>
  );
}
