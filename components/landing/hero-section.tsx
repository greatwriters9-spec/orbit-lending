import Link from "next/link";

import { Building2 } from "lucide-react";



import { HeroBackgroundCarousel } from "@/components/landing/hero-background-carousel";

import { LANDING_CONTAINER, LANDING_TRUST_METRICS } from "@/lib/landing/content";

import type { LandingContent } from "@/lib/landing/get-landing-content";

import type { LandingImage } from "@/lib/landing/images";

import type { BrandingConfig } from "@/types/branding-config";



type HeroSectionProps = {

  content: LandingContent;

  heroImage: LandingImage;

  branding: BrandingConfig;

  primaryColor: string;

};



export function HeroSection({

  content,

  heroImage,

  branding,

}: HeroSectionProps) {

  const subtitleLines = content.heroSubtitle.split("\n");



  return (

    <section className="relative w-full min-h-[calc(100dvh-88px-8.5rem)] overflow-hidden md:min-h-[calc(100dvh-88px-11rem)]">

      <HeroBackgroundCarousel heroImage={heroImage} />



      <div

        className="hero-overlay-left absolute inset-0"

        style={{

          background:

            "linear-gradient(to right, var(--hero-overlay-start), var(--hero-overlay-mid), transparent)",

        }}

      />

      <div

        className="absolute inset-0"

        style={{

          background:

            "linear-gradient(to top, var(--hero-overlay-bottom), transparent, transparent)",

        }}

      />



      <div

        className={`${LANDING_CONTAINER} relative z-10 flex min-h-[calc(100dvh-88px-8.5rem)] items-center py-10 md:min-h-[calc(100dvh-88px-11rem)] md:py-12`}

      >

        <div className="max-w-2xl">

          {content.heroEyebrow ? (

            <p className="hero-eyebrow mb-4 text-sm font-semibold uppercase tracking-[0.18em]">

              {content.heroEyebrow}

            </p>

          ) : null}



          <h1 className="hero-title text-[2.75rem] leading-[1.06] font-bold tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] md:text-[3.25rem] lg:text-[3.75rem]">

            {content.heroTitle}

          </h1>



          <p className="hero-subtitle mt-6 max-w-xl text-lg leading-relaxed text-white/95 drop-shadow-[0_1px_12px_rgba(0,0,0,0.25)] md:text-xl md:leading-relaxed">

            {subtitleLines.map((line, index) => (

              <span key={line}>

                {line}

                {index < subtitleLines.length - 1 ? <br /> : null}

              </span>

            ))}

          </p>



          <div className="hero-cta-group mt-10 flex flex-wrap gap-4">

            <Link

              href="/get-started"

              className="oak-btn-primary inline-flex h-12 items-center rounded-xl bg-brand-blue px-7 text-base font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-colors hover:bg-brand-blue-dark"

            >

              {content.heroButtonText}

            </Link>

            <Link

              href="/get-started?homeFound=true"

              className="oak-btn-secondary inline-flex h-12 items-center rounded-xl border-2 border-white/90 bg-white/15 px-7 text-base font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-colors hover:bg-white/25"

            >

              I Already Found A Home

            </Link>

          </div>



          <div className="mt-10 inline-flex items-center gap-3.5 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-medium text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-lg md:text-base hero-pathward-badge">

            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/15">

              <Building2 className="size-5 text-white" strokeWidth={1.75} />

            </span>

            <span className="drop-shadow-[0_1px_8px_rgba(0,0,0,0.2)]">

              Powered by {branding.bankPartnerName}

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

      className={`grid grid-cols-2 gap-4 border-t border-brand-border pt-8 md:grid-cols-4 ${className ?? ""}`}

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

