import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";

import { LANDING_CONTAINER, LANDING_TRUST_METRICS } from "@/lib/landing/content";

import { HeroLoanCard } from "./hero-loan-card";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(37,99,235,0.07),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_85%,rgba(32,23,71,0.04),transparent_45%)]" />

      <div className={LANDING_CONTAINER}>
        <div className="relative grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-brand-blue/[0.05] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-brand-blue">
              <ShieldCheck className="size-3.5" strokeWidth={1.75} />
              Institutional Digital Lending
            </p>

            <h1 className="heading-primary mt-6 text-[2.5rem] leading-[1.06] md:text-5xl lg:text-[3.35rem]">
              Premium Financing Built for Trust, Speed, and Clarity
            </h1>

            <p className="mt-5 text-base leading-relaxed text-[#4B5563] md:text-lg md:leading-relaxed">
              Orbit Lending delivers a secure, transparent borrowing experience —
              from application to funding — with real-time visibility and
              bank-grade infrastructure you can rely on.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-brand-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
              >
                Apply Now
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="#products"
                className="inline-flex h-11 items-center rounded-[10px] border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#374151] transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
              >
                Explore Products
              </Link>
            </div>

            <TrustMetrics className="mt-10" />

            <div className="mt-8 inline-flex items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
              <Building2 className="size-4 text-brand-blue" strokeWidth={1.75} />
              <p className="text-xs leading-relaxed text-[#4B5563] md:text-sm">
                <span className="font-semibold text-brand-navy">
                  Banking Infrastructure Powered by Pathward National Bank
                </span>
              </p>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <HeroLoanCard />
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrustMetrics({ className }: { className?: string }) {
  return (
    <div
      className={`grid grid-cols-2 gap-4 border-t border-[#E5E7EB] pt-8 md:grid-cols-4 ${className ?? ""}`}
    >
      {LANDING_TRUST_METRICS.map((metric) => (
        <div key={metric.label}>
          <p className="heading-primary text-xl tabular-nums md:text-2xl">
            {metric.value}
          </p>
          <p className="mt-1 text-xs leading-snug text-muted-foreground md:text-sm">
            {metric.label}
          </p>
        </div>
      ))}
    </div>
  );
}
