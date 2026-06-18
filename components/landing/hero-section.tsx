import Link from "next/link";
import { Building2 } from "lucide-react";

import { HeroBackgroundCarousel } from "@/components/landing/hero-background-carousel";
import { LANDING_CONTAINER, LANDING_TRUST_METRICS } from "@/lib/landing/content";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[calc(100dvh-88px-8.5rem)] overflow-hidden md:min-h-[calc(100dvh-88px-11rem)]">
      <HeroBackgroundCarousel />

      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1528]/72 via-[#0b1528]/28 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1528]/25 via-transparent to-transparent" />

      <div
        className={`${LANDING_CONTAINER} relative z-10 flex min-h-[calc(100dvh-88px-8.5rem)] items-center py-10 md:min-h-[calc(100dvh-88px-11rem)] md:py-12`}
      >
        <div className="max-w-2xl">
          <h1 className="text-[2.75rem] leading-[1.06] font-bold tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] md:text-[3.25rem] lg:text-[3.75rem]">
            Home Financing Made Simple
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/95 drop-shadow-[0_1px_12px_rgba(0,0,0,0.25)] md:text-xl md:leading-relaxed">
            Get pre-qualified in minutes.
            <br />
            Know exactly how much home you can afford.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/get-started"
              className="inline-flex h-12 items-center rounded-xl bg-brand-blue px-7 text-base font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)] transition-colors hover:bg-[#1d4ed8]"
            >
              Get Pre-Qualified
            </Link>
            <Link
              href="/get-started?homeFound=true"
              className="inline-flex h-12 items-center rounded-xl border-2 border-white/90 bg-white/15 px-7 text-base font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              I Already Found A Home
            </Link>
          </div>

          <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-white/35 bg-white/12 px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-md md:text-base">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/15">
              <Building2 className="size-5 text-white" strokeWidth={1.75} />
            </span>
            <span className="drop-shadow-[0_1px_8px_rgba(0,0,0,0.2)]">
              Powered by Pathward National Bank
            </span>
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
