import Link from "next/link";
import { Building2 } from "lucide-react";

import { HeroBackgroundCarousel } from "@/components/landing/hero-background-carousel";
import { LANDING_CONTAINER, LANDING_TRUST_METRICS } from "@/lib/landing/content";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[calc(100dvh-88px-8.5rem)] overflow-hidden md:min-h-[calc(100dvh-88px-11rem)]">
      <HeroBackgroundCarousel />

      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1528]/82 via-[#0b1528]/35 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1528]/30 via-transparent to-transparent" />

      <div
        className={`${LANDING_CONTAINER} relative z-10 flex min-h-[calc(100dvh-88px-8.5rem)] items-center py-10 md:min-h-[calc(100dvh-88px-11rem)] md:py-12`}
      >
        <div className="max-w-xl">
          <h1 className="text-[2.35rem] leading-[1.08] font-bold tracking-tight text-white md:text-5xl lg:text-[3.25rem]">
            Home Financing Made Simple
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 md:text-lg md:leading-relaxed">
            Get pre-qualified in minutes.
            <br />
            Know exactly how much home you can afford.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/get-started"
              className="inline-flex h-11 items-center rounded-[10px] bg-brand-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
            >
              Get Pre-Qualified
            </Link>
            <Link
              href="/get-started?homeFound=true"
              className="inline-flex h-11 items-center rounded-[10px] border border-white/70 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              I Already Found A Home
            </Link>
          </div>

          <div className="mt-10 inline-flex items-center gap-2.5 text-sm text-white/80">
            <span className="flex size-8 items-center justify-center rounded-full border border-white/25 bg-white/10">
              <Building2 className="size-4 text-white" strokeWidth={1.75} />
            </span>
            <span>Powered by Pathward National Bank</span>
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
