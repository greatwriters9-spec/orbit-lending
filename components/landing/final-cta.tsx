import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LANDING_CONTAINER } from "@/lib/landing/content";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-brand-navy py-20 md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(37,99,235,0.28),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.04),transparent_45%)]" />
      <div className="absolute -top-24 -right-24 size-64 rounded-full bg-brand-blue/10 blur-3xl" />

      <div className={`${LANDING_CONTAINER} relative`}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="heading-primary-light text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-tight">
            Ready To Move Forward?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
            Apply in minutes, track progress in real time, and access financing
            designed around your goals.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-brand-blue px-7 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
            >
              Apply Now
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center rounded-[10px] border border-white/20 bg-white/5 px-7 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
